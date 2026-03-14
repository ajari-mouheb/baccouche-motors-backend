import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TestDrivesController } from './test-drives/test-drives.controller';
import { TestDrivesService } from './test-drives/test-drives.service';
import { DatabaseModule } from './database/database.module';
import { EXCHANGE, QUEUES } from '@app/shared';

const rmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
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
        name: 'EVENTS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [rmqUrl],
          queue: EXCHANGE,
          exchange: EXCHANGE,
          exchangeType: 'topic',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [TestDrivesController],
  providers: [TestDrivesService],
})
export class TestDrivesModule {}
