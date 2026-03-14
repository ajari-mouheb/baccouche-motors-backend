import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HealthController } from './health/health.controller';
import { GatewayMiddleware } from './gateway/gateway.middleware';
import { AuthController } from './controllers/auth.controller';
import { CustomersController } from './controllers/customers.controller';
import { CarsController } from './controllers/cars.controller';
import { NewsController } from './controllers/news.controller';
import { TestDrivesController } from './controllers/test-drives.controller';
import { ContactsController } from './controllers/contacts.controller';
import { AdminController } from './controllers/admin.controller';
import { QUEUES } from '@app/shared';

const rmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rmqUrl],
          queue: QUEUES.AUTH,
          queueOptions: { durable: true },
        },
      },
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
      {
        name: 'ADMIN_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [rmqUrl],
          queue: QUEUES.ADMIN,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [
    HealthController,
    AuthController,
    CustomersController,
    CarsController,
    NewsController,
    TestDrivesController,
    ContactsController,
    AdminController,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GatewayMiddleware).forRoutes('*');
  }
}
