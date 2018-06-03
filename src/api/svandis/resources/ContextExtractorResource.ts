import {HttpService, Injectable, Logger} from "@nestjs/common";
import {Observable} from "rxjs/index";
import {SecuredResource} from "./SecuredResource";

@Injectable()
export class ContextExtractorResource extends SecuredResource {

    private readonly URL = 'https://svandis-ce.herokuapp.com/extract';

    constructor(private httpService: HttpService) {
        super();
    }

    public extract(targetUrl: string): Observable<any> {
        return this.httpService.post(this.URL, {
            url: targetUrl,
            token: this.getToken()
        });
    }
}
