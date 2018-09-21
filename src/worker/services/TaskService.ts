import {HttpService, Injectable, Logger} from "@nestjs/common";
import {catchError, concatMap, filter, finalize, map, skip, switchMap, take, takeLast, tap} from "rxjs/internal/operators";
import {TaskConfiguration} from "../../api/svandis/resources/dataModel/TaskConfiguration";
import {BehaviorSubject, EMPTY, interval, Observable} from "rxjs/index";
import * as _ from "lodash";
import {GeneralWebCrawler} from "../../crawler/services/GeneralWebCrawler";
import {ContentExtractorService} from "./ContentExtractorService";
import {SocketService} from "../../common/socket/SocketService";
import {SOCKET_EVENTS} from "../SocketEvents";
import Socket = SocketIOClient.Socket;
import {StatisticsService} from './StatisticsService';

@Injectable()
export class TaskService {
    private isBusy = false;
    private socket: Socket;
    private readonly SOCKET_EVENTS = SOCKET_EVENTS;

    constructor(private webCrawler: GeneralWebCrawler,
                private httpService: HttpService,
                private statService: StatisticsService,
                private socketService: SocketService,
                private extractorService: ContentExtractorService) {
        this.socket = this.socketService.getSocket();
    }

    public executeTask(tasks: TaskConfiguration[], onComplete: () => void) {
        this.isBusy = true;
        console.log('task executer received tasks: ', tasks);
        tasks.forEach((task, index) => {
            if (_.get(task, 'type') === 'web') {
                this.handleWebTask(task, () => {
                    if (index + 1 === tasks.length) {
                        onComplete();
                        console.log('tasks completed');
                    }
                });
            }
        });
    }

    public getIsBusy(): boolean {
        return this.isBusy;
    }

    public unsetIsBusy(): void {
        this.isBusy = false;
    }

    private handleWebTask(task, onComplete: () => void) {
        this.webCrawler.getLinks(task, (results) => {
            const resultSubject = new BehaviorSubject(results);
            resultSubject
                .pipe(
                    tap((res) => console.log('this is what i get from getLinks :', res)),
                    switchMap((urls) => {
                        console.log('crawling finished, switching map');
                        if (_.isEmpty(urls)) {
                            Logger.log('No links for extraction found');
                            onComplete();
                        }
                        return this.sendUrlsForValidation(urls, task)
                            .pipe(
                                switchMap((res) => _.isEmpty(res.urls) ? EMPTY : this.processValidatedUrls(res)),
                                finalize(() => onComplete())
                            );
                    }),
                    catchError((err) => {
                        Logger.error(err);
                        onComplete();
                        return EMPTY;
                    }),
                    finalize(() => onComplete())
                )
                .subscribe();
        });
    }

    private processValidatedUrls(res) {
        return interval(1000)
            .pipe(
                map((i) => res.urls[i]),

                switchMap((url) => {
                    return this.sendHtmlForExtraction(url);
                }),
                take(res.urls.length)
            );
    }

    private sendHtmlForExtraction(url) {
        return this.extractorService.getHtml(url)
            .pipe(
                switchMap((payload) => {
                    Logger.log('Extracting...');
                    return this.extractorService.extract(payload)
                        .pipe(
                            catchError((err) => {
                                Logger.error(err);
                                return EMPTY;
                            })
                        );
                }),
            );
    }

    private sendUrlsForValidation(urls: string[], task): Observable<{ urls: string[] }> {
        console.log('received urls for validation, count: ' + urls.length);
        this.socket.emit(
            this.SOCKET_EVENTS.VALIDATE,
            {urls: urls, baseUrl: task.config.url}
        );
        return this.onValidationComplete()
            .pipe(
                tap((res) => this.statService.addUrls(res.urls)),
                finalize(() => console.log('validation, done'))
            );

    }

    private onValidationComplete(): Observable<{ urls: string[] }> {
        return Observable.create((observer) => {
            this.socket.on(this.SOCKET_EVENTS.VALIDATE_COMPLETE, (res: { urls: string[] }) => {
                console.log(res, 'for extraction');
                observer.next(res);
                observer.complete();
            });
        });
    }
}