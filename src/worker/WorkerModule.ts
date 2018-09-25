import {HttpModule, Logger, Module, OnModuleInit} from "@nestjs/common";
import {WorkerTaskRunner} from "./WorkerTaskRunner";
import {SvandisApiModule} from "../api/svandis/SvandisApiModule";
import {LoggerMessage} from "../common/logger/LoggerMessage";
import {ContentExtractorService} from "./services/ContentExtractorService";
import {AppCommonModule} from "../common/AppCommonModule";
import {GeneralWebCrawler} from "../crawler/services/GeneralWebCrawler";
import {TaskService} from "./services/TaskService";
import {StatisticsService} from './services/StatisticsService';
import {AuthService} from '../common/auth/AuthService';

@Module({
    imports: [
        HttpModule,
        AppCommonModule,
        SvandisApiModule
    ],
    providers: [
        WorkerTaskRunner,
        TaskService,
        StatisticsService,
        GeneralWebCrawler,
        ContentExtractorService
    ],
    exports: [
        WorkerTaskRunner
    ]
})
export class WorkerModule implements OnModuleInit {
    constructor(private workerRunner: WorkerTaskRunner) {
    }

    onModuleInit(): void {
        this.workerRunner.startWorker();
    }
}
