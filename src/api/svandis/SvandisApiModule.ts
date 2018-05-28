import {Module} from "@nestjs/common";
import {WorkerResource} from "./resources/WorkerResource";
import {HttpModule} from "@nestjs/common/http";

@Module({
    imports: [
        HttpModule
    ],
    providers: [
        WorkerResource
    ],
    exports: [
        WorkerResource,
    ]
})
export class SvandisApiModule {
}
