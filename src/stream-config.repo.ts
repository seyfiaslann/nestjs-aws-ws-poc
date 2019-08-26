import { DynamoRepo } from './dynamo.repo';
import { Injectable } from '@nestjs/common';
import { StreamConfig } from './stream.config';

@Injectable()
export class StreamConfigRepo extends DynamoRepo<StreamConfig> {
    constructor() {
        super('stream_config');
    }

    async getAll(): Promise<StreamConfig[]> {
        return this.scan();
    }
}