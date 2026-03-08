import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CarsController } from './cars/cars.controller';
import { CarsService } from './cars/cars.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'EVENTS_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'cars-events',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  controllers: [CarsController],
  providers: [CarsService],
})
export class CarsModule {}
