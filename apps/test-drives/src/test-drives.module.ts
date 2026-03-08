import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TestDrivesController } from './test-drives/test-drives.controller';
import { TestDrivesService } from './test-drives/test-drives.service';
import { DatabaseModule } from './database/database.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'CARS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'test-drives-cars',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
          },
          consumer: {
            groupId: 'test-drives-cars-consumer',
          },
        },
      },
      {
        name: 'EVENTS_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'test-drives-events',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  controllers: [TestDrivesController],
  providers: [TestDrivesService],
})
export class TestDrivesModule {}
