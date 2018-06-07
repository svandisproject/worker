import {AxiosRequestConfig} from "@nestjs/common/http/interfaces/axios.interfaces";
import {Logger} from "@nestjs/common";

export class SecuredResource {
    private token: string;

    constructor() {
        try {
            this.token = require(process.env.PWD + '/runtime.json').token;
        } catch (error) {
            Logger.log('runtime not yet set');
        }
    }

    protected getSecuredRequestConfig(): AxiosRequestConfig {
        return {headers: {'X-WORKER-TOKEN': this.token}};
    }

    protected getToken(): string {
        return this.token;
    }
}
