import {AxiosRequestConfig} from "@nestjs/common/http/interfaces/axios.interfaces";

export class SecuredResource {
    private token: string = require(process.env.PWD + '/runtime.json').token;

    protected getSecuredRequestConfig(): AxiosRequestConfig {
        return {headers: {'X-WORKER-TOKEN': this.token}};
    }

    protected getToken(): string {
        return this.token;
    }
}
