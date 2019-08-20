import { Context, Handler } from 'aws-lambda';

export const handler: Handler = async (event: any, context: Context) => {
  console.log(JSON.stringify(event));
  return { body: 'Hello' };
};