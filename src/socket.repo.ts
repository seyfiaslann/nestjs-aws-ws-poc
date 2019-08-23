import { SocketEntity } from './socket.entity';
import { DynamoRepo } from './dynamo.repo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketRepo extends DynamoRepo<SocketEntity> {

}
