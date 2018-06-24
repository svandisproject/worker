import {HttpModule, Logger, Module, OnModuleInit} from "@nestjs/common";
import {WorkerTaskRunner} from "./WorkerTaskRunner";
import {SvandisApiModule} from "../api/svandis/SvandisApiModule";
import {LoggerMessage} from "../common/logger/LoggerMessage";
import {ContentExtractorService} from "./services/ContentExtractorService";
import {AppCommonModule} from "../common/AppCommonModule";
import {GeneralWebCrawler} from "../crawler/services/GeneralWebCrawler";

@Module({
    imports: [
        HttpModule,
        AppCommonModule,
        SvandisApiModule
    ],
    providers: [
        WorkerTaskRunner,
        GeneralWebCrawler,
        ContentExtractorService
    ],
    exports: [
        WorkerTaskRunner
    ]
})
export class WorkerModule implements OnModuleInit {

    private argv: { register?: number, start?: boolean } = {
        register: null,
        start: null
    };

    constructor(private workerRunner: WorkerTaskRunner) {
        this.argv = require('yargs').argv;
    }

    onModuleInit(): void {

        if (this.argv.register && !this.argv.start) {
            this.registerWorker();
        } else if (this.argv.register && this.argv.start) {
            this.registerAndRun();
        } else {
            this.workerRunner.startWorker();
        }
    }

    private registerWorker(onSuccess?: () => any): void {
        this.workerRunner.registerWorker(this.argv.register)
            .subscribe(
                () => {
                    Logger.log(LoggerMessage.WORKER_REGISTERED);
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        process.exit(0);
                    }
                },
                (err) => {
                    Logger.error(LoggerMessage.WORKER_REGISTER_FAILED + ' ' + err);
                    process.exit(0);
                }
            );
    }

    private registerAndRun(): void {
        this.registerWorker(this.workerRunner.startWorker);
    }
}
