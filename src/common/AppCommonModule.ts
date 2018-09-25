import {Module} from "@nestjs/common";
import {SocketService} from "./socket/SocketService";
import {AuthService} from './auth/AuthService';

@Module({
    providers: [
        AuthService,
        SocketService
    ],
    exports: [
        SocketService,
        AuthService
    ]
})
export class AppCommonModule {
}
