import {TaskConfiguration} from "../api/svandis/resources/dataModel/TaskConfiguration";
import {Observable} from "rxjs/internal/Observable";

export abstract class AbstractCrawler {

    abstract getLinks(task: TaskConfiguration): Observable<string[]>;

    protected abstract crawlForLinks(task: TaskConfiguration, onComplete: (results) => void): any;

    protected configureCrawler(targetUrl: string): any {
        const crawler = require('simplecrawler')(targetUrl);
        crawler.maxDepth = 2;
        crawler.maxConcurrency = 3;

        return crawler;
    }

}