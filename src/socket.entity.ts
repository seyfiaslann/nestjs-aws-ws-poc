import { Entity } from './dynamo.repo';

export interface SocketEntity extends Entity {
    event: string;
}
