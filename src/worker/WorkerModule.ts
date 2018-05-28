import {Module} from "@nestjs/common";
import {WorkerTaskRunner} from "./WorkerTaskRunner";

@Module({
    providers: [
        WorkerTaskRunner
    ]
})
export class WorkerModule {

}