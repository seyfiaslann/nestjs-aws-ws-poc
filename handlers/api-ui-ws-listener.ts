import { Context, Handler } from 'aws-lambda';
import { ApiGatewayManagementApi } from 'aws-sdk';
import { DynamoRepo } from '../src/dynamo.repo';
import { SocketEntity } from '../src/socket.entity';

let apigwManagementApi: ApiGatewayManagementApi;
const dynamoRepo = new DynamoRepo<SocketEntity>('test');

export const handler: Handler = async (event: any, context: Context, callback) => {
    console.log(JSON.stringify(event));

    if (!apigwManagementApi) {
        apigwManagementApi = new ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
        });
    }

    const connectionId = event.requestContext.connectionId;

    switch (event.requestContext.eventType) {
        case 'CONNECT':
            await dynamoRepo.add({ id: connectionId, event: JSON.stringify(event) });
            break;
        case 'DISCONNECT':
            await dynamoRepo.delete(connectionId);
            break;
        default:
            await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: 'Hello' }).promise();
            break;
    }
};
