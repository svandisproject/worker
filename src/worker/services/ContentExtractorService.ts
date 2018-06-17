import {Injectable} from "@nestjs/common";
import {ContextExtractorResource} from "../../api/svandis/resources/ContextExtractorResource";
import {Observable} from "rxjs/internal/Observable";

@Injectable()
export class ContentExtractorService {
    constructor(private extractorResource: ContextExtractorResource) {
    }

    public extract(payload: { url: string, pageHtml: string }): Observable<any> {
        return this.extractorResource.extract(payload);
    }
}
