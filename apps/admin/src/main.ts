import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AdminModule } from './admin.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AdminModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'admin',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      },
      consumer: {
        groupId: 'admin-consumer',
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  await app.listen();
}
bootstrap();
