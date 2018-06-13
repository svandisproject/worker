import {AxiosRequestConfig} from "@nestjs/common/http/interfaces/axios.interfaces";
import {Logger} from "@nestjs/common";

export class SecuredResource {
    private token: string;

    constructor() {
        try {
            this.token = require((process.env.PWD || process.cwd()) + '/runtime.json').token;
        } catch (error) {
            Logger.error('Error in SecuredResource, runtime not yet set');
        }
    }

    protected getSecuredRequestConfig(): AxiosRequestConfig {
        return {headers: {'X-WORKER-TOKEN': this.token}};
    }

    protected getToken(): string {
        return this.token;
    }
}
