import {Injectable, Logger} from "@nestjs/common";
import {WorkerResource} from "../api/svandis/resources/WorkerResource";
import {catchError, finalize, map, tap} from "rxjs/internal/operators";
import * as fs from "fs";
import * as colors from "colors";
import {AxiosError} from "@nestjs/common/http/interfaces/axios.interfaces";
import {Observable, throwError} from "rxjs/index";
import {TaskConfiguration} from "../api/svandis/resources/dataModel/TaskConfiguration";
import {ContentExtractorService} from "./services/ContentExtractorService";
import {WebCrawlerFactory} from "../crawler/WebCrawlerFactory";
import {SocketService} from "../common/socket/SocketService";
import {fromArray} from "rxjs/internal/observable/fromArray";
import Socket = SocketIOClient.Socket;

@Injectable()
export class WorkerTaskRunner {
    private readonly SOCKET_EVENTS = {
        CONNECT: 'connect',
        TASK_UPDATE: 'task-config-update',
        VALIDATE: 'validate',
        VALIDATE_COMPLETE: 'validate-complete'
    };
    private VALIDATION_THRESHOLD: number = 1;

    private socket: Socket;
    private isWorkerBusy: boolean = false;

    constructor(private workerResource: WorkerResource,
                private socketService: SocketService,
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
            this.listenOnUrlValidation();
        });
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

    private saveTokenToFile(response) {
        const token = response.data.token;
        fs.writeFileSync(process.env.PWD + '/runtime.json', JSON.stringify({token: token}));
        Logger.log(colors.bgGreen.black('Successfully registered worker'));
    }

    private listenOnTaskUpdate() {
        // TODO: Send task array instead of a task
        this.socket.on(this.SOCKET_EVENTS.TASK_UPDATE, (task) => {
            Logger.log("Crawling task received");
            this.executeTask(task);
        });
    }

    private listenOnUrlValidation(): void {
        this.socket.on(this.SOCKET_EVENTS.VALIDATE_COMPLETE, (res: { urls: string[] }) => {
            if (res.urls) {
                fromArray(res.urls)
                    .pipe(finalize(() => this.isWorkerBusy = false))
                    .subscribe((url) => {
                        Logger.log('Extracting...');
                        this.extractorService.extract(url);
                    });
            }
        });
    }

    private executeTask(task: TaskConfiguration) {
        switch (task.type) {
            case 'web':
                new WebCrawlerFactory(task)
                    .build()
                    .subscribe((urls: string[]) => {
                        this.socket.emit(this.SOCKET_EVENTS.VALIDATE, {urls: urls, baseUrl: task.config.url});
                    });
                break;
        }
    }

    private handleRegistrationError(err: AxiosError) {
        Logger.error(colors.red("Error registering worker"));
        if (err.response.status === 403) {
            Logger.error(colors.red("Bad worker secret"));
        }
        return throwError(err);
    }
}
