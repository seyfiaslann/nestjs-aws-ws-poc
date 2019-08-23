import { Context, Handler } from 'aws-lambda';
import { ApiGatewayManagementApi } from 'aws-sdk';
import { EventsGateway, SocketClient } from '../src/events.gateway';
import { SocketRepo } from '../src/socket.repo';

const dynamoRepo = new SocketRepo('test_sockets');
const eventsGateway = new EventsGateway(dynamoRepo);

export const handler: Handler = async (event: any, context: Context, callback) => {
    console.log(JSON.stringify(event));

    const { domainName, stage, connectionId } = event.requestContext;
    const client: ApiGateWaySocketClient = new ApiGateWaySocketClient(domainName, stage, connectionId);

    switch (event.requestContext.eventType) {
        case 'CONNECT':
            await eventsGateway.handleConnection(client, [{ connectionId, event }]);
            break;
        case 'DISCONNECT':
            await eventsGateway.handleDisconnect(client, connectionId);
            break;
        default:
            await eventsGateway.handleEvent(client, '');
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
        await apigwManagementApi.postToConnection({ ConnectionId: this.connectionId, Data: data }).promise();
    }

}
