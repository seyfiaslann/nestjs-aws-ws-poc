import { Context, Handler } from 'aws-lambda';
import { ApiGatewayManagementApi } from 'aws-sdk';
import { EventsGateway, SocketClient } from '../src/events.gateway';
import { AppModule } from '../src/app.module';
import { NestFactory } from '@nestjs/core';
import * as _ from 'lodash';
import { WsException } from '@nestjs/websockets';

let app: any;

async function bootstrap() {
    app = await NestFactory.create(AppModule);
}

let eventsGateway: EventsGateway;

export const handler: Handler = async (event: any, context: Context, callback) => {
    console.log(JSON.stringify(event));

    if (!app) {
        console.log('Initiating dependencies');
        await bootstrap();
        eventsGateway = app.get(EventsGateway);
    } else {
        console.log('System already initiated');
    }

    const { domainName, stage, connectionId } = event.requestContext;
    const client: ApiGateWaySocketClient = new ApiGateWaySocketClient(domainName, stage, connectionId);

    switch (event.requestContext.eventType) {
        case 'CONNECT':
            await eventsGateway.handleConnection(client, { connectionId, event });
            break;
        case 'DISCONNECT':
            await eventsGateway.handleDisconnect(client, connectionId);
            break;
        default:
            const body = JSON.parse(event.body);
            if (body.event) {
                const funcName = 'handle' + (body.event.split('_').map(i => _.upperFirst(i)).join(''));
                if (eventsGateway[funcName]) {
                    await eventsGateway[funcName](client, body.data);
                } else {
                    throw new WsException('function not found');
                }
            } else {
                throw new WsException('event not found');
            }
            break;
    }

    return {};
};

export class ApiGateWaySocketClient implements SocketClient {

    apigwManagementApi: ApiGatewayManagementApi;
    connectionId: string;

    constructor(domainName: string, stage: string, connectionId: string) {
        this.apigwManagementApi = new ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: domainName + '/' + stage,
        });
        this.connectionId = connectionId;
    }

    async send(data: any) {
        await this.apigwManagementApi.postToConnection({ ConnectionId: this.connectionId, Data: data }).promise();
    }

}
