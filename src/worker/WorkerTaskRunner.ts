import {HttpService, Injectable, Logger} from "@nestjs/common";
import {WorkerResource} from "../api/svandis/resources/WorkerResource";
import {catchError, concatAll, finalize, map, mergeMap, switchMap, tap} from "rxjs/internal/operators";
import * as fs from "fs";
import * as colors from "colors";
import {AxiosError} from "@nestjs/common/http/interfaces/axios.interfaces";
import {asyncScheduler, EMPTY, from, Observable, Subscription, throwError, timer} from "rxjs/index";
import {TaskConfiguration} from "../api/svandis/resources/dataModel/TaskConfiguration";
import {ContentExtractorService} from "./services/ContentExtractorService";
import {SocketService} from "../common/socket/SocketService";
import {GeneralWebCrawler} from "../crawler/services/GeneralWebCrawler";
import * as _ from "lodash";
import Socket = SocketIOClient.Socket;

@Injectable()
export class WorkerTaskRunner {
    private readonly SOCKET_EVENTS = {
        CONNECT: 'connect',
        DISCONNECT: 'disconnect',
        TASK_UPDATE: 'task-config-update',
        VALIDATE: 'validate',
        VALIDATE_COMPLETE: 'validate-complete'
    };

    private socket: Socket;
    private isWorkerBusy: boolean = false;

    private activeTaskSubscription: Subscription;
    private activeHeartbeatSubscription: Subscription;

    constructor(private workerResource: WorkerResource,
                private socketService: SocketService,
                private webCrawler: GeneralWebCrawler,
                private httpService: HttpService,
                private extractorService: ContentExtractorService) {
        this.socket = this.socketService.getSocket();
    }

    /**
     * Registers worker and stores token
     * @param secret
     * @returns {Observable<boolean>} true on success
     */
    public registerWorker(secret): Observable<boolean> {
        if (!secret) {
            Logger.log(colors.red('Secret is required to register worker'));
            process.exit(1);
        }
        Logger.log(colors.red('Registering worker'));
        return this.workerResource.register(secret)
            .pipe(
                tap((response) => {
                    this.saveTokenToFile(response);
                }),
                catchError((err: AxiosError) => {
                    return this.handleRegistrationError(err);
                }),
                map(() => true)
            );
    }

    public startWorker(): void {
        this.socket.on(this.SOCKET_EVENTS.CONNECT, () => {
            Logger.log(colors.yellow("Connected to socket server, worker started"));

            this.activeHeartbeatSubscription = this.heartbeat().subscribe(
                () => Logger.log(colors.green('Heartbeat send')),
                (error) => {
                    Logger.error('Heartbeat error ' + error);
                    process.exit(1);
                }
            );

            this.onTaskUpdate();
        });

        this.socket.on(this.SOCKET_EVENTS.DISCONNECT, () => {
            Logger.log('Connection lost, unsubscribe tasks');
            if (!this.isWorkerBusy) {
                this.activeHeartbeatSubscription.unsubscribe();
                this.activeTaskSubscription.unsubscribe();
            }
        });
    }

    private onTaskUpdate() {
        this.socket.on(this.SOCKET_EVENTS.TASK_UPDATE, (tasks: TaskConfiguration[]) => {
            if (!this.isWorkerBusy) {
                Logger.log("Crawling tasks received");
                this.activeTaskSubscription = this.executeTask(tasks)
                    .pipe(finalize(() => this.isWorkerBusy = false))
                    .subscribe();
            }
        });
    }

    private executeTask(tasks: TaskConfiguration[]): Observable<any> {
        this.isWorkerBusy = true;
        return from(tasks, asyncScheduler)
            .pipe(
                mergeMap((task) => {
                    if (task.type === 'web') {
                        return this.handleWebTask(task);
                    }
                    return EMPTY;
                }),
            );
    }

    private handleWebTask(task): Observable<any> {
        return this.webCrawler
            .getLinks(task)
            .pipe(
                mergeMap((urls) => {
                    if (_.isEmpty(urls)) {
                        Logger.log('No links for extraction found');
                        return EMPTY;
                    }
                    return this.sendUrlsForValidation(urls, task)
                        .pipe(
                            mergeMap((res) => {
                                if (_.isEmpty(res.urls)) {
                                    return EMPTY;
                                }

                                return from(res.urls, asyncScheduler)
                                    .pipe(
                                        mergeMap((url) => {
                                            return this.extractorService.getHtml(url)
                                                .pipe(
                                                    mergeMap((html) => {
                                                        Logger.log('Extracting...');
                                                        return this.extractorService.extract({pageHtml: html, url: url})
                                                            .pipe(
                                                                catchError((err) => {
                                                                    Logger.error(err);
                                                                    return EMPTY;
                                                                })
                                                            );
                                                    }),
                                                );
                                        }),
                                        concatAll()
                                    );
                            }));
                }),
                catchError((err, caught) => {
                    Logger.error(err);
                    return EMPTY;
                }),
                finalize(() => console.log('handleWebTask done, go to next'))
            );
    }

    private sendUrlsForValidation(urls: string[], task): Observable<{ urls: string[] }> {
        this.socket.emit(
            this.SOCKET_EVENTS.VALIDATE,
            {urls: urls, baseUrl: task.config.url}
        );
        return this.onValidationComplete()
            .pipe(finalize(() => console.log('validation, done')));

    }

    private onValidationComplete(): Observable<{ urls: string[] }> {
        return Observable.create((observer) => {
            this.socket.on(this.SOCKET_EVENTS.VALIDATE_COMPLETE, (res: { urls: string[] }) => {
                observer.next(res);
                observer.complete();
            });
        });
    }

    private handleRegistrationError(err: AxiosError) {
        Logger.error(colors.red("Error registering worker"));
        if (err.response.status === 403) {
            Logger.error(colors.red("Bad worker secret"));
        }
        return throwError(err);
    }

    private heartbeat(): Observable<any> {
        return timer(0, 60000)
            .pipe(
                switchMap(() => this.workerResource.heartbeat())
            );
    }

    private isLastIndex(index, array: any[]) {
        return index + 1 === array.length;
    }

    private saveTokenToFile(response) {
        const token = response.data.token;
        fs.writeFileSync((process.env.PWD || process.cwd()) + '/runtime.json', JSON.stringify({token: token}));
        Logger.log(colors.bgGreen.black('Successfully registered worker'));
    }
}
