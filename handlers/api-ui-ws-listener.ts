import { Context, Handler } from 'aws-lambda';
import { ApiGatewayManagementApi } from 'aws-sdk';

export const handler: Handler = async (event: any, context: Context) => {
    console.log(JSON.stringify(event));

    const apigwManagementApi = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
    });

    const connectionId = event.requestContext.connectionId;

    await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: { body: 'hello' } }).promise();

    return { body: 'Hello' };
};
