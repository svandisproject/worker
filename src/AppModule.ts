import {Module} from '@nestjs/common';
import {SvandisApiModule} from "./api/svandis/SvandisApiModule";
import {WorkerModule} from "./worker/WorkerModule";
import {AppCommonModule} from "./common/AppCommonModule";
import {AuthService} from './common/auth/AuthService';

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
    private argv: { register?: number, start?: boolean, token?: string } = {
        register: null,
        token: null,
        start: null
    };

    constructor() {
        this.argv = require('yargs').argv;
        AuthService.setToken(this.argv.token || process.env.TOKEN);
    }
}
