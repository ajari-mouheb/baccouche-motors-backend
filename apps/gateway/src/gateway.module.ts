import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GatewayMiddleware } from './gateway/gateway.middleware';
import { AuthProxyController } from './proxy/auth-proxy.controller';
import { CustomersProxyController } from './proxy/customers-proxy.controller';
import { CarsProxyController } from './proxy/cars-proxy.controller';
import { NewsProxyController } from './proxy/news-proxy.controller';
import { TestDrivesProxyController } from './proxy/test-drives-proxy.controller';
import { ContactsProxyController } from './proxy/contacts-proxy.controller';
import { AdminProxyController } from './proxy/admin-proxy.controller';
import { GatewayKafkaBootstrap } from './gateway/gateway-kafka.bootstrap';

const kafkaBrokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'gateway-auth', brokers: kafkaBrokers },
          consumer: { groupId: 'gateway-auth-consumer' },
        },
      },
      {
        name: 'CARS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'gateway-cars', brokers: kafkaBrokers },
          consumer: { groupId: 'gateway-cars-consumer' },
        },
      },
      {
        name: 'NEWS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'gateway-news', brokers: kafkaBrokers },
          consumer: { groupId: 'gateway-news-consumer' },
        },
      },
      {
        name: 'TEST_DRIVES_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'gateway-test-drives', brokers: kafkaBrokers },
          consumer: { groupId: 'gateway-test-drives-consumer' },
        },
      },
      {
        name: 'CONTACTS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'gateway-contacts', brokers: kafkaBrokers },
          consumer: { groupId: 'gateway-contacts-consumer' },
        },
      },
      {
        name: 'ADMIN_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'gateway-admin', brokers: kafkaBrokers },
          consumer: { groupId: 'gateway-admin-consumer' },
        },
      },
    ]),
  ],
  controllers: [
    AuthProxyController,
    CustomersProxyController,
    CarsProxyController,
    NewsProxyController,
    TestDrivesProxyController,
    ContactsProxyController,
    AdminProxyController,
  ],
  providers: [GatewayKafkaBootstrap],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GatewayMiddleware).forRoutes('*');
  }
}
