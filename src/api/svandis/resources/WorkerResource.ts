import {HttpService} from "@nestjs/common/http";
import {Injectable} from "@nestjs/common";
import {Observable} from "rxjs/index";
import {AppConfig} from "../../../config/AppConfig";
import {AxiosResponse} from "@nestjs/common/http/interfaces/axios.interfaces";
import {SecuredResource} from "./SecuredResource";

@Injectable()
export class WorkerResource extends SecuredResource {
    constructor(private httpService: HttpService) {
        super();
    }

    public register(secret: string): Observable<AxiosResponse<{ token: string }>> {
        return this.httpService.post(AppConfig.API_URL + '/worker/register', {secret: secret});
    }

    public heartbeat(): Observable<AxiosResponse<any>> {
        return this.httpService
            .post(AppConfig.API_URL + '/worker/heartbeat', null, this.getSecuredRequestConfig());
    }
}
