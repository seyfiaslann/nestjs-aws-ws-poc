import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { SocketRepo } from './socket.repo';

@Module({
  providers: [EventsGateway, SocketRepo],
})
export class EventsModule {}