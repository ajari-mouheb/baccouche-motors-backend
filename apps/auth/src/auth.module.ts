import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { CustomersController } from './customers/customers.controller';
import { UserService } from './user/user.service';
import { DatabaseModule } from './database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EXCHANGE } from '@app/shared';

const rmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'EVENTS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [rmqUrl],
          queue: EXCHANGE,
          exchange: EXCHANGE,
          exchangeType: 'topic',
          queueOptions: { durable: true },
        },
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, CustomersController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
