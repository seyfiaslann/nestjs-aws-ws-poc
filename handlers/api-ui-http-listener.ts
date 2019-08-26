import { Context, Handler } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';

import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { ApiModule } from '../src/api.module';

let expressApp: any;
const serverlessHttp: any = require('serverless-http');

async function bootstrapApp() {
  expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(ApiModule, adapter);

  app.enableCors();
  await app.init();
  return expressApp;
}

export const handler: Handler = async (event: any, context: Context) => {
  if (!expressApp) {
    expressApp = await bootstrapApp();
  }
  const h = serverlessHttp(expressApp);
  return await h(event, context);
}