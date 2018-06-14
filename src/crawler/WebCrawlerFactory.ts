import {TaskConfiguration} from "../api/svandis/resources/dataModel/TaskConfiguration";
import {Observable} from "rxjs/index";
import {GeneralWebCrawler} from "./crawlers/GeneralWebCrawler";

export class WebCrawlerFactory {
    constructor(private taskConfig: TaskConfiguration) {
    }

    public build(): Observable<string[]> {
        return new GeneralWebCrawler(this.taskConfig).getLinks();
    }
}
