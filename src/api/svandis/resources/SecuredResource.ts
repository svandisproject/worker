import {AxiosRequestConfig} from "@nestjs/common/http/interfaces/axios.interfaces";

export class SecuredResource {

    protected getSecuredRequestConfig(): AxiosRequestConfig {
        return {headers: {'X-WORKER-TOKEN': require(process.env.PWD + '/runtime.json').token}};
    }
}
