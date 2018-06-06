import {AbstractCrawler} from "./AbstractCrawler";
import {Observable} from "rxjs/index";
import * as cheerio from 'cheerio';
import {TaskConfiguration} from "../../api/svandis/resources/dataModel/TaskConfiguration";

export class GeneralWebCrawler extends AbstractCrawler {

    constructor(private task: TaskConfiguration) {
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
        const crawler = this.configureCrawler(this.task.config.url);
        crawler.discoverResources = (buffer) => {
            const $: CheerioStatic = cheerio.load(buffer.toString("utf8"));

            return $(this.task.config.linkSelector)
                .map((index, element) => $(element).attr("href")).get();
        };

        return crawler;
    }
}
