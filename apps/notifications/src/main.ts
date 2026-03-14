import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module';
import { QUEUES, EXCHANGE } from '@app/shared';

const rmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(NotificationsModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: QUEUES.NOTIFICATIONS,
      queueOptions: { durable: true },
      exchange: EXCHANGE,
      exchangeType: 'topic',
      wildcards: true,
    },
  });

  await app.listen();
}
bootstrap();
