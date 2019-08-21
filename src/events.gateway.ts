import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';

@WebSocketGateway()
export class EventsGateway {
    @SubscribeMessage('events')
    handleEvent(client: any, data: string): string {
        return data;
    }
}