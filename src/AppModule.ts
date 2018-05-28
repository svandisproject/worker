import {Module} from '@nestjs/common';
import {SvandisApiModule} from "./api/svandis/SvandisApiModule";
import {WorkerModule} from "./worker/WorkerModule";

@Module({
    imports: [
        SvandisApiModule,
        WorkerModule
    ],
    exports: [
        SvandisApiModule
    ]
})
export class AppModule {
}
