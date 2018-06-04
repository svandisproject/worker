import {TaskConfiguration} from "../api/svandis/resources/dataModel/TaskConfiguration";
import {Observable} from "rxjs/index";
import {CointelegraphCrawler} from "./crawlers/CointelegraphCrawler";

export class WebCrawlerFactory {
    constructor(private taskConfig: TaskConfiguration) {
    }

    public build(): Observable<string> {
        switch (this.taskConfig.config.url) {
            case 'https://cointelegraph.com':
                return new CointelegraphCrawler(this.taskConfig.config.url).getLinks();
        }
    }
}