import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AdminModule } from './admin.module';
import { QUEUES, EXCHANGE } from '@app/shared';

const rmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AdminModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: QUEUES.ADMIN,
      queueOptions: { durable: true },
      exchange: EXCHANGE,
      exchangeType: 'topic',
      wildcards: true,
    },
  });

  await app.listen();
}
bootstrap();
