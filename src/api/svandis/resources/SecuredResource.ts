import {AxiosRequestConfig} from "@nestjs/common/http/interfaces/axios.interfaces";
import {Logger} from "@nestjs/common";
import * as fs from "fs";
import {AuthService} from '../../../common/auth/AuthService';

export class SecuredResource {
    private token: string;

    constructor() {
        this.token = AuthService.getToken();
    }

    protected getSecuredRequestConfig(): AxiosRequestConfig {
        return {headers: {'X-WORKER-TOKEN': this.token}};
    }

    protected getToken(): string {
        return this.token;
    }
}
