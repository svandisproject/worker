import {AbstractCrawler} from "./AbstractCrawler";
import {Observable} from "rxjs/index";

export class CointelegraphCrawler extends AbstractCrawler {
    private readonly postsUrl = '/category/latest';
    private readonly linkSelector = '.category-content .category-item a';

    constructor(private targetUrl: string) {
        super();
    }

    public getLinks(): Observable<string> {
        const crawler = this.crawlForLinks();

        return Observable.create((observer) => {
            crawler.on('fetchcomplete', (queueItem) => {
                observer.next(queueItem.url);
            });
            crawler.start();
        });
    }

    protected crawlForLinks(): any {
        const crawler = this.configureCrawler(this.targetUrl + this.postsUrl);
        crawler.discoverResources = (buffer) => {
            const $: CheerioStatic = cheerio.load(buffer.toString("utf8"));

            return $(this.linkSelector)
                .map((index, element) => $(element).attr("href")).get();
        };

        return crawler;
    }
}
