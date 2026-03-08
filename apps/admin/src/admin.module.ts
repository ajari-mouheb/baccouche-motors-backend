import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AdminController } from './admin/admin.controller';
import { AdminEventsHandler } from './admin/admin.events-handler';
import { AdminService } from './admin/admin.service';

const kafkaBrokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'CARS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'admin-cars', brokers: kafkaBrokers },
          consumer: { groupId: 'admin-cars-consumer' },
        },
      },
      {
        name: 'NEWS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'admin-news', brokers: kafkaBrokers },
          consumer: { groupId: 'admin-news-consumer' },
        },
      },
      {
        name: 'TEST_DRIVES_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'admin-test-drives', brokers: kafkaBrokers },
          consumer: { groupId: 'admin-test-drives-consumer' },
        },
      },
      {
        name: 'CONTACTS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'admin-contacts', brokers: kafkaBrokers },
          consumer: { groupId: 'admin-contacts-consumer' },
        },
      },
    ]),
  ],
  controllers: [AdminController, AdminEventsHandler],
  providers: [AdminService],
})
export class AdminModule {}
