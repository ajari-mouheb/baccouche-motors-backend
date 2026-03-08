import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NewsController } from './news/news.controller';
import { NewsService } from './news/news.service';
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
            clientId: 'news-events',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
