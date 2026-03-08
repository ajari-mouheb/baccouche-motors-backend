import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventsHandler } from './notifications/events.handler';
import { EmailService } from './email/email.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [EventsHandler],
  providers: [EmailService],
})
export class NotificationsModule {}
