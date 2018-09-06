import {Injectable} from '@nestjs/common';
import * as _ from 'lodash';
import {Observable} from 'rxjs/internal/Observable';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class StatisticsService {
    private urls: string[];
    private urlsSubject = new BehaviorSubject<string[]>(null);

    public addUrls(urls: string[]) {
       this.urls = _.concat(this.urls, urls);
       this.urlsSubject.next(this.urls);
    }

    public getUrls(): string[] {
        return this.urls;
    }

    public urlsUpdate(): Observable<string[]>  {
        return this.urlsSubject.asObservable();
    }
}