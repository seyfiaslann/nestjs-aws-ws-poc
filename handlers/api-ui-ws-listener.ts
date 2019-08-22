import { Context, Handler } from 'aws-lambda';
import { ApiGatewayManagementApi } from 'aws-sdk';
import { DynamoRepo } from '../src/dynamo.repo';
import { SocketEntity } from '../src/socket.entity';
import { StreamSample } from '../src/stream';

let apigwManagementApi: ApiGatewayManagementApi;
const dynamoRepo = new DynamoRepo<SocketEntity>('test_sockets');

export const handler: Handler = async (event: any, context: Context, callback) => {
    console.log(JSON.stringify(event));

    if (!apigwManagementApi) {
        console.log('Initiating gateway api');
        apigwManagementApi = new ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
        });
    } else {
        console.log('Api gateway is already initiated');
    }

    const connectionId = event.requestContext.connectionId;

    const response = StreamSample;

    switch (event.requestContext.eventType) {
        case 'CONNECT':
            await dynamoRepo.add({ id: connectionId, event: JSON.stringify(event) });
            break;
        case 'DISCONNECT':
            await dynamoRepo.delete(connectionId);
            break;
        default:
            await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: response }).promise();
            break;
    }

    return {};
};
