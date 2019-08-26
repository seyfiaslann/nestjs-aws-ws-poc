import { Controller, Get } from '@nestjs/common';
import { StreamSample } from './stream';

@Controller()
export class AppController {
    @Get('api/events')
    getEvents() {
        return StreamSample;
    }
}