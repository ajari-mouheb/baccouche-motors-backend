import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AdminController } from './admin/admin.controller';
import { AdminEventsHandler } from './admin/admin.events-handler';
import { AdminService } from './admin/admin.service';
import { QUEUES } from '@app/shared';

const rmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'CARS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rmqUrl],
          queue: QUEUES.CARS,
          queueOptions: { durable: true },
        },
      },
      {
        name: 'NEWS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rmqUrl],
          queue: QUEUES.NEWS,
          queueOptions: { durable: true },
        },
      },
      {
        name: 'TEST_DRIVES_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rmqUrl],
          queue: QUEUES.TEST_DRIVES,
          queueOptions: { durable: true },
        },
      },
      {
        name: 'CONTACTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rmqUrl],
          queue: QUEUES.CONTACTS,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [AdminController, AdminEventsHandler],
  providers: [AdminService],
})
export class AdminModule {}
