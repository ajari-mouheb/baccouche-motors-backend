import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NewsModule } from './news.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(NewsModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'news',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      },
      consumer: {
        groupId: 'news-consumer',
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen();
}
bootstrap();
