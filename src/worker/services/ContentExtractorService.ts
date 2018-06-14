import {Injectable, Logger} from "@nestjs/common";
import {ContextExtractorResource} from "../../api/svandis/resources/ContextExtractorResource";

@Injectable()
export class ContentExtractorService {
    constructor(private extractorResource: ContextExtractorResource) {
    }

    public extract(targetUrl: string): void {
        this.extractorResource.extract(targetUrl)
            .subscribe(null, (err) => this.handleError(err));
    }

    private handleError(err): void {
        Logger.error(err);
    }
}
