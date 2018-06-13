import {Module} from "@nestjs/common";
import {SocketService} from "./socket/SocketService";

@Module({
    providers: [
        SocketService
    ],
    exports: [
        SocketService
    ]
})
export class AppCommonModule {

}
