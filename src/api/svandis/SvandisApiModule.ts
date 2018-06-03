import {Module} from "@nestjs/common";
import {WorkerResource} from "./resources/WorkerResource";
import {HttpModule} from "@nestjs/common/http";
import {ContextExtractorResource} from "./resources/ContextExtractorResource";

@Module({
    imports: [
        HttpModule
    ],
    providers: [
        WorkerResource,
        ContextExtractorResource
    ],
    exports: [
        WorkerResource,
        ContextExtractorResource
    ]
})
export class SvandisApiModule {
}
