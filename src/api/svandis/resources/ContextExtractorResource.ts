import {HttpService, Injectable} from "@nestjs/common";
import {Observable} from "rxjs/index";
import {SecuredResource} from "./SecuredResource";
import {AuthService} from '../../../common/auth/AuthService';

@Injectable()
export class ContextExtractorResource extends SecuredResource {

    private readonly URL = 'https://svandis-content-exteactor.herokuapp.com/extract';

    constructor(private httpService: HttpService) {
        super();
    }

    public extract(payload: { url: string, pageHtml: string }): Observable<any> {
        return this.httpService.post(this.URL, {
            url: payload.url,
            token: this.getToken(),
            pageHtml: payload.pageHtml
        });
    }
}
