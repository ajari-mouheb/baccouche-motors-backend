import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AuthModule } from './auth.module';
import { HttpToRpcExceptionFilter } from '@app/shared';
import { QUEUES } from '@app/shared';

const rmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: QUEUES.AUTH,
      queueOptions: { durable: true },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpToRpcExceptionFilter());

  await app.listen();
}
bootstrap();
