import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { TestDrivesModule } from './test-drives.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TestDrivesModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'test-drives',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      },
      consumer: {
        groupId: 'test-drives-consumer',
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
