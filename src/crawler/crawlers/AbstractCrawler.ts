import {Observable} from "rxjs/index";

export abstract class AbstractCrawler {

    abstract getLinks(): Observable<string>;

    protected abstract crawlForLinks(): any;

    protected configureCrawler(targetUrl: string): any {
        const crawler = require('simplecrawler')(targetUrl);
        crawler.maxDepth = 2;
        crawler.maxConcurrency = 3;

        return crawler;
    }

}

// this.$ = cheerio.load(buffer.toString("utf8"));
// crawler.discoverResources =
//     (buffer) => this.crawlForPostLinks(buffer);