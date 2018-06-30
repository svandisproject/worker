import {HttpService, Injectable, Logger} from "@nestjs/common";
import {catchError, concatMap, finalize, map, take} from "rxjs/internal/operators";
import {TaskConfiguration} from "../../api/svandis/resources/dataModel/TaskConfiguration";
import {EMPTY, interval, Observable} from "rxjs/index";
import * as _ from "lodash";
import {GeneralWebCrawler} from "../../crawler/services/GeneralWebCrawler";
import {ContentExtractorService} from "./ContentExtractorService";
import {SocketService} from "../../common/socket/SocketService";
import {SOCKET_EVENTS} from "../SocketEvents";
import Socket = SocketIOClient.Socket;

@Injectable()
export class TaskService {
    private isBusy = false;
    private socket: Socket;
    private readonly SOCKET_EVENTS = SOCKET_EVENTS;

    constructor(private webCrawler: GeneralWebCrawler,
                private httpService: HttpService,
                private socketService: SocketService,
                private extractorService: ContentExtractorService) {
        this.socket = this.socketService.getSocket();
    }

    public executeTask(tasks: TaskConfiguration[]): Observable<any> {
        this.isBusy = true;
        return interval(1000)
            .pipe(
                map((i) => tasks[i]),
                concatMap((task) => {
                    if (_.get(task, 'type') === 'web') {
                        return this.handleWebTask(task);
                    }
                    return EMPTY;
                }),
                take(tasks.length),
            );
    }

    public getIsBusy(): boolean {
        return this.isBusy;
    }

    public unsetIsBusy(): void {
        this.isBusy = false;
    }

    private handleWebTask(task): Observable<any> {
        return this.webCrawler
            .getLinks(task)
            .pipe(
                concatMap((urls) => {
                    if (_.isEmpty(urls)) {
                        Logger.log('No links for extraction found');
                        return EMPTY;
                    }
                    return this.sendUrlsForValidation(urls, task)
                        .pipe(
                            concatMap((res) => _.isEmpty(res.urls) ? EMPTY : this.processValidatedUrls(res))
                        );
                }),
                catchError((err) => {
                    Logger.error(err);
                    return EMPTY;
                }),
                finalize(() => console.log('handleWebTask done, go to next'))
            );
    }

    private processValidatedUrls(res) {
        return interval(1000)
            .pipe(
                map((i) => res.urls[i]),

                concatMap((url) => {
                    return this.sendHtmlForExtraction(url);
                }),
                take(res.urls.length)
            );
    }

    private sendHtmlForExtraction(url) {
        return this.extractorService.getHtml(url)
            .pipe(
                concatMap((payload) => {
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
}