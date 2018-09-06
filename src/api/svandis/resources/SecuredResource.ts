import {AxiosRequestConfig} from "@nestjs/common/http/interfaces/axios.interfaces";
import {Logger} from "@nestjs/common";
import * as fs from "fs";

export class SecuredResource {
    private token: string;

    constructor() {
        try {
            const token = fs.readFileSync((process.env.PWD || process.cwd()) + '/runtime.json');
            this.token = JSON.parse(token.toString()).token;
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
