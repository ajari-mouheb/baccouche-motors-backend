import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(NotificationsModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'notifications',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      },
      consumer: {
        groupId: 'notifications-consumer',
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  await app.listen();
}
bootstrap();
