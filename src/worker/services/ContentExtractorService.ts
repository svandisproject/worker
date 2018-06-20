import {HttpService, Injectable} from "@nestjs/common";
import {ContextExtractorResource} from "../../api/svandis/resources/ContextExtractorResource";
import {Observable} from "rxjs/internal/Observable";
import {map} from "rxjs/internal/operators";

@Injectable()
export class ContentExtractorService {
    constructor(private extractorResource: ContextExtractorResource,
                private httpService: HttpService) {
    }

    public extract(payload: { url: string, pageHtml: string }): Observable<any> {
        return this.extractorResource.extract(payload);
    }

    public getHtml(url: string): Observable<any> {
        return this.httpService.get(url)
            .pipe(map((response) => {
                return {url: url, pageHtml: response.data};
            }));
    }
}
