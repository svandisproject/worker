import {AbstractCrawler} from "../AbstractCrawler";
import * as cheerio from 'cheerio';
import {TaskConfiguration} from "../../api/svandis/resources/dataModel/TaskConfiguration";
import {Observable} from "rxjs/internal/Observable";
import {Injectable} from "@nestjs/common";
import * as _ from "lodash";
import {Subject} from 'rxjs/internal/Subject';

@Injectable()
export class GeneralWebCrawler extends AbstractCrawler {

    public getLinks(task: TaskConfiguration, onComplete: (results) => void) {
        console.log('web crawler received a task', task);
        const crawler = this.crawlForLinks(task);
        let results = [];

        crawler.on('discoverycomplete', (queItem, resource) => {
            console.log('crawl resource parsed', resource);
            results = _.concat(results, resource);
        });
        crawler.on('complete', () => {
            console.log('crawling completed' , results);
            onComplete(results);
        });
        crawler.start();

    }

    protected crawlForLinks(task: TaskConfiguration): any {
        const crawler = this.configureCrawler(task.config.url);
        crawler.discoverResources = (buffer) => {
            const $: CheerioStatic = cheerio.load(buffer.toString("utf8"));
            const selector: string = task.config.linkSelector;

            return !this.isInvalidSelector(selector) ?
                $(selector).map((index, element) => $(element).attr("href")).get() : null;
        };

        return crawler;
    }

    private isInvalidSelector(selector: string): boolean {
        return /class=/.test(selector);
    }
}
