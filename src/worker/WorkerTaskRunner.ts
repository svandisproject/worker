import {Injectable, Logger} from "@nestjs/common";
import {WorkerResource} from "../api/svandis/resources/WorkerResource";
import {catchError, map, tap} from "rxjs/internal/operators";
import * as fs from "fs";
import * as colors from "colors";
import {AxiosError} from "@nestjs/common/http/interfaces/axios.interfaces";
import {Observable, throwError} from "rxjs/index";
import {AppConfig} from "../config/AppConfig";
import * as io from 'socket.io-client';

@Injectable()
export class WorkerTaskRunner {

    constructor(private workerResource: WorkerResource) {
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
        const runtime = require(__dirname + '/runtime.json');
        // axios.defaults.headers.common['X-WORKER-TOKEN'] = runtime.token;
        const socket = io(AppConfig.SOCKET_SERVER_URL, {
            forceNew: true,
            query: 'secret=' + runtime.secret
        });

        socket.on('connect', () => Logger.log(colors.yellow("Connected to socket server")));

        this.heartbeat();
        Logger.log("Worker started".green);
        socket.on('task-config-update', (task) => {
            Logger.log(task);
            Logger.log("Crawling task received");
            this.executeTask(task);
        });
    }

    public executeTask(task) {

    }

    public heartbeat() {
        setInterval(() => {
            this.workerResource.heartbeat()
                .subscribe(
                    () => Logger.log(colors.green('Heartbeat send')),
                    (error) => Logger.error(error)
                );
        }, 60000);
    }

    private saveTokenToFile(response) {
        const token = response.data.token;
        fs.writeFileSync(__dirname + '/runtime.json', JSON.stringify({token: token}));
        Logger.log(colors.bgGreen.black('Successfully registered worker'));
    }

    private handleRegistrationError(err: AxiosError) {
        Logger.error(colors.red("Error registering worker"));
        if (err.response.status === 403) {
            Logger.error(colors.red("Bad worker secret"));
        }
        return throwError(err);
    }
}
