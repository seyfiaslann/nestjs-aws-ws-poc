import { WebSocketAdapter, WsMessageHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

export class WebSocketService implements WebSocketAdapter {
    create(port: number, options?: any) {
        throw new Error('Method not implemented.');
    }
    bindClientConnect(server: any, callback: Function) {
        throw new Error('Method not implemented.');
    }
    bindClientDisconnect?(client: any, callback: Function) {
        throw new Error('Method not implemented.');
    }
    bindMessageHandlers(client: any, handlers: WsMessageHandler<string>[], transform: (data: any) => Observable<any>) {
        throw new Error('Method not implemented.');
    }
    close(server: any) {
        throw new Error('Method not implemented.');
    }
}