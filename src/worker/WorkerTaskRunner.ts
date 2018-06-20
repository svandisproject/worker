import {HttpService, Injectable, Logger} from "@nestjs/common";
import {WorkerResource} from "../api/svandis/resources/WorkerResource";
import {catchError, filter, finalize, map, switchMap, tap} from "rxjs/internal/operators";
import * as fs from "fs";
import * as colors from "colors";
import {AxiosError} from "@nestjs/common/http/interfaces/axios.interfaces";
import {EMPTY, from, Observable, throwError} from "rxjs/index";
import {TaskConfiguration} from "../api/svandis/resources/dataModel/TaskConfiguration";
import {ContentExtractorService} from "./services/ContentExtractorService";
import {SocketService} from "../common/socket/SocketService";
import {fromArray} from "rxjs/internal/observable/fromArray";
import {GeneralWebCrawler} from "../crawler/services/GeneralWebCrawler";
import * as _ from "lodash";
import Socket = SocketIOClient.Socket;

@Injectable()
export class WorkerTaskRunner {
    private readonly SOCKET_EVENTS = {
        CONNECT: 'connect',
        TASK_UPDATE: 'task-config-update',
        VALIDATE: 'validate',
        VALIDATE_COMPLETE: 'validate-complete'
    };

    private socket: Socket;
    private isWorkerBusy: boolean = false;

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

            this.heartbeat();
            this.listenOnTaskUpdate();
        });
    }

    private listenOnTaskUpdate() {
        // TODO: Send task array instead of a task
        this.socket.on(this.SOCKET_EVENTS.TASK_UPDATE, (tasks: TaskConfiguration[]) => {
            if (!this.isWorkerBusy) {
                Logger.log("Crawling tasks received");
                this.executeTask(tasks);
            }
        });
    }

    private executeTask(tasks: TaskConfiguration[]) {
        this.isWorkerBusy = true;
        from(tasks)
            .pipe(
                filter((task) => task.type === 'web'),
                switchMap((task: TaskConfiguration) => {
                    return this.handleWebTask(task);
                }),
                finalize(() => {
                    Logger.log('Tasks finished, releasing worker');
                    this.isWorkerBusy = false;
                })
            )
            .subscribe(null, (error) => {
                console.error(error);
            });
    }

    private sendUrlsForValidation(urls: string[], task): Observable<{ urls: string[] }> {
        this.socket.emit(
            this.SOCKET_EVENTS.VALIDATE,
            {urls: urls, baseUrl: task.config.url}
        );
        return this.onValidationComplete();

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

    private heartbeat() {
        setInterval(() => {
            this.workerResource.heartbeat()
                .subscribe(
                    () => Logger.log(colors.green('Heartbeat send')),
                    (error) => Logger.error('Heartbeat error ' + error)
                );
        }, 60000);
    }

    private handleWebTask(task): Observable<any> {
        return this.webCrawler
            .getLinks(task)
            .pipe(
                switchMap((urls) => {
                    if (_.isEmpty(urls)) {
                        return EMPTY;
                    }
                    return this.sendUrlsForValidation(urls, task);
                }),
                switchMap((res) => {
                    if (_.isEmpty(res.urls)) {
                        return EMPTY;
                    }
                    Logger.log('Urls for extraction: ');
                    console.log(res.urls);
                    return fromArray(res.urls)
                        .pipe(
                            switchMap((url) => this.extractorService.getHtml(url)),
                            switchMap((payload: { url: string, pageHtml: string }) => {
                                Logger.log('Extracting...');
                                return this.extractorService.extract(payload);
                            }),
                            tap((result) => console.log(result))
                        );
                }),
            );
    }

    private saveTokenToFile(response) {
        const token = response.data.token;
        fs.writeFileSync((process.env.PWD || process.cwd()) + '/runtime.json', JSON.stringify({token: token}));
        Logger.log(colors.bgGreen.black('Successfully registered worker'));
    }
}
