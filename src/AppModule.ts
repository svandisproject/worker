import {Module} from '@nestjs/common';
import {SvandisApiModule} from "./api/svandis/SvandisApiModule";
import {WorkerModule} from "./worker/WorkerModule";
import {AppCommonModule} from "./common/AppCommonModule";

@Module({
    imports: [
        AppCommonModule,
        SvandisApiModule,
        WorkerModule
    ],
    exports: [
        AppCommonModule,
        SvandisApiModule
    ]
})
export class AppModule {
}
