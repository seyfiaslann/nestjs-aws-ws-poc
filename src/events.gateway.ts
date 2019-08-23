import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { SocketEntity } from './socket.entity';
import { SocketRepo } from './socket.repo';
import { StreamSample } from './stream';

@WebSocketGateway(8080, { transports: ['websocket'] })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly socketRepo: SocketRepo) { }

    async handleDisconnect(client: SocketClient, connectionId?: string) {
        if (connectionId) {
            await this.socketRepo.delete(connectionId);
        }
        console.log('Disconnected');
    }
    async handleConnection(client: SocketClient, ...args: any[]) {
        if (args[0] && args[0].connectionId) {
            await this.socketRepo.add({ id: args[0].connectionId, event: JSON.stringify(args[0]) });
        }

        console.log('Connected');
    }

    @SubscribeMessage('events')
    async handleEvent(client: SocketClient, data: string) {
        await client.send(StreamSample);
    }
}

export interface SocketClient {
    send(data: any);
}