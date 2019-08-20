import { Context, Handler } from 'aws-lambda';

export const handler: Handler = async (event: any, context: Context, callback: any) => {
    console.log(JSON.stringify(event));

    callback(null, {
        statusCode: 200,
        body: 'Hello',
    });
};
