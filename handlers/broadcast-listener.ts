import { Context, Handler } from 'aws-lambda';
import { ApiGatewayManagementApi } from 'aws-sdk';
import { DynamoRepo } from '../src/dynamo.repo';
import { SocketEntity } from '../src/socket.entity';
import { StreamSample } from '../src/stream';

let apigwManagementApi: ApiGatewayManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: 'adk1xq190k.execute-api.eu-west-1.amazonaws.com/Prod',
});
const dynamoRepo = new DynamoRepo<SocketEntity>('test_sockets');

export const handler: Handler = async (event: any, context: Context, callback) => {
    console.log(JSON.stringify(event));

    const connectionId = event.requestContext.connectionId;

    const response = StreamSample;

    const items = await dynamoRepo.scan();

    for (const item of items) {
        await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: response }).promise();
    }

    return {};
};
