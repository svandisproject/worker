import * as cheerio from 'cheerio';
import {TaskConfiguration} from "../../api/svandis/resources/dataModel/TaskConfiguration";
import {Observable} from "rxjs/index";

export class WebCrawlerService {
    private crawler;

    constructor(private taskConfig: TaskConfiguration) {
        this.crawler = require('simplecrawler')(taskConfig.config.url);
        this.configureCrawler();
    }

    public execute(): Observable<string> {
        return Observable.create((observer) => {
            // TODO: Temporaly here , needs selector tweaking
            if (this.taskConfig.config.url !== 'https://cointelegraph.com'){
                observer.complete();
            }
            this.crawler.on('fetchcomplete', (queueItem) => {
                observer.next(queueItem.url);
            });
            this.crawler.start();
        });
    }

    private configureCrawler() {
        this.crawler.maxDepth = 2;
        this.crawler.maxConcurrency = 3;
        this.crawler.discoverResources =
            (buffer) => this.crawlForPostLinks(buffer);
    }

    private crawlForPostLinks(buffer) {
        const $: CheerioStatic = cheerio.load(buffer.toString("utf8"));

        // TODO: Rethink selectors
        return $(`a[href]`).not('header a')
            .map((index, element) => $(element).attr("href")).get();
    }
}