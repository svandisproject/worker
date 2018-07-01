import {Injectable, Logger} from "@nestjs/common";
import {WorkerResource} from "../api/svandis/resources/WorkerResource";
import {catchError, finalize, map, switchMap, tap} from "rxjs/internal/operators";
import * as fs from "fs";
import * as colors from "colors";
import {AxiosError} from "@nestjs/common/http/interfaces/axios.interfaces";
import {Observable, Subscription, throwError, timer} from "rxjs/index";
import {TaskConfiguration} from "../api/svandis/resources/dataModel/TaskConfiguration";
import {SocketService} from "../common/socket/SocketService";
import {SOCKET_EVENTS} from "./SocketEvents";
import {TaskService} from "./services/TaskService";
import Socket = SocketIOClient.Socket;

@Injectable()
export class WorkerTaskRunner {
    private readonly SOCKET_EVENTS = SOCKET_EVENTS;
    private readonly TERMINATE_TIMEOUT = 300000;

    private socket: Socket;

    private activeTaskSubscription: Subscription;
    private activeHeartbeatSubscription: Subscription;

    constructor(private workerResource: WorkerResource,
                private taskService: TaskService,
                private socketService: SocketService) {
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
                tap((response) => this.saveTokenToFile(response)),
                catchError((err: AxiosError) => this.handleRegistrationError(err)),
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
            this.destroySubscriptions();
        });

        timer(this.TERMINATE_TIMEOUT)
            .subscribe(() => {
                Logger.warn('Time for cleanup, terminating process');
                process.exit();
            });

        this.sendReadySignal();
    }

    private onTaskUpdate() {
        this.socket.on(this.SOCKET_EVENTS.TASK_UPDATE, (tasks: TaskConfiguration[]) => {
            if (!this.taskService.getIsBusy()) {
                Logger.log("Crawling tasks received");
                this.activeTaskSubscription = this.taskService.executeTask(tasks)
                    .pipe(finalize(() => this.taskService.unsetIsBusy()))
                    .subscribe();
            }
        });
    }

    private heartbeat(): Observable<any> {
        return timer(0, 60000)
            .pipe(
                switchMap(() => this.workerResource.heartbeat())
            );
    }

    private handleRegistrationError(err: AxiosError) {
        Logger.error(colors.red("Error registering worker"));
        if (err.response.status === 403) {
            Logger.error(colors.red("Bad worker secret"));
        }
        return throwError(err);
    }

    private destroySubscriptions() {
        Logger.log('Connection lost, unsubscribe tasks');
        if (!this.taskService.getIsBusy()) {
            this.activeHeartbeatSubscription.unsubscribe();
            this.activeTaskSubscription.unsubscribe();
        }
    }

    private saveTokenToFile(response) {
        const token = response.data.token;
        fs.writeFileSync((process.env.PWD || process.cwd()) + '/runtime.json', JSON.stringify({token: token}));
        Logger.log(colors.bgGreen.black('Successfully registered worker'));
    }

    /**
     * Used for pm2 to that child is ready
     */
    private sendReadySignal() {
        if (process.send) {
            process.send('ready');
        }
    }
}
