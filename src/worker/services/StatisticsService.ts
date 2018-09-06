import {Injectable} from '@nestjs/common';
import * as _ from 'lodash';
import {Observable} from 'rxjs/internal/Observable';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import {Server} from 'socket.io';

@Injectable()
export class StatisticsService {
    private urls: string[];
    private urlsSubject = new BehaviorSubject<string[]>([]);
    private server: Server;

    constructor() {
        const Server = require('socket.io');
        this.server = new Server(3030, {transport: 'websocket'});
        this.server.on('connection', () => console.log('connected'));
    }

    public addUrls(urls: string[]) {
        this.urls = _.concat(this.urls, urls);
        this.server.emit('statUpdate', this.urls);
        this.urlsSubject.next(this.urls);
    }

    public getUrls(): string[] {
        return this.urls;
    }

    public urlsUpdate(): Observable<string[]> {
        return this.urlsSubject.asObservable();
    }
}