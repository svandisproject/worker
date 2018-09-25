import {Injectable, Logger} from "@nestjs/common";
import {AppConfig} from "../../config/AppConfig";
import * as io from 'socket.io-client';
import Socket = SocketIOClient.Socket;
import * as fs from 'fs';
import {AuthService} from '../auth/AuthService';

@Injectable()
export class SocketService {
    private socket: Socket;

    constructor() {
        this.socket = io(AppConfig.SOCKET_SERVER_URL, {
            forceNew: true,
            query: 'secret=' + AuthService.getToken()
        });
    }

    public getSocket(): Socket {
        return this.socket;
    }
}
