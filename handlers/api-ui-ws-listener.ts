import { Context, Handler } from 'aws-lambda';
import { ApiGatewayManagementApi } from 'aws-sdk';

export const handler: Handler = async (event: any, context: Context, callback) => {
    console.log(JSON.stringify(event));

    const apigwManagementApi = new ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: event.requestContext.domainName + '/' + event.requestContext.stage,
    });

    const connectionId = event.requestContext.connectionId;
    
    if((event.requestContext.eventType === 'CONNECT' || event.requestContext.eventType === 'DISCONNECT') === false) {
        await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: "Hello" }).promise();    
    }

    return { body: 'Hello' };
};
