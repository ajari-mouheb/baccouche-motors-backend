import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ContactsModule } from './contacts.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ContactsModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'contacts',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      },
      consumer: {
        groupId: 'contacts-consumer',
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
