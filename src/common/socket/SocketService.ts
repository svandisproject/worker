import {Injectable, Logger} from "@nestjs/common";
import {AppConfig} from "../../config/AppConfig";
import * as io from 'socket.io-client';
import Socket = SocketIOClient.Socket;
import * as fs from 'fs';

@Injectable()
export class SocketService {
    private socket: Socket;

    constructor() {
        try {
            let token = fs.readFileSync((process.env.PWD || process.cwd()) + '/runtime.json');
            token = JSON.parse(token.toString()).token;
            this.socket = io(AppConfig.SOCKET_SERVER_URL, {
                forceNew: true,
                query: 'secret=' + token
            });
        } catch (error) {
            Logger.error('Error in SocketService, runtime not yet set');
        }

    }

    public getSocket(): Socket {
        return this.socket;
    }
}
