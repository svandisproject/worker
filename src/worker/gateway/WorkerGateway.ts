import {OnGatewayConnection, OnGatewayInit, WebSocketGateway} from '@nestjs/websockets';
import {Client, Server} from 'socket.io';
import {StatisticsService} from '../services/StatisticsService';
import {Logger} from '@nestjs/common';

@WebSocketGateway(3030)
export class WorkerGateway implements OnGatewayInit, OnGatewayConnection {
    constructor(private statService: StatisticsService) {

    }

    afterInit(server: Server): any {
        Logger.log('stats gateway opened on 3030');
        this.statService.urlsUpdate().subscribe((urls) => {
            if (urls) {
                console.log('----------------');
                console.log(urls.length);
                console.log('----------------');

                server.emit('statUpdate', urls);
            }
        });
    }

    handleConnection(client: Client): any {
        console.log('connected');
    }
}
