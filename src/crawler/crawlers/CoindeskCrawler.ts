import {AbstractCrawler} from "./AbstractCrawler";
import {Observable} from "rxjs/index";

export class CoindeskCrawler extends AbstractCrawler {
    private readonly maxPageDepth = 10;
    private readonly linkSelector = '#content .post-info a';
    private currentPage = 1;

    getLinks(): Observable<string> {
        return undefined;
    }

    protected crawlForLinks(): any {
        return null;
    }
}
