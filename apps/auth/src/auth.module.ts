import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { CustomersController } from './customers/customers.controller';
import { UserService } from './user/user.service';
import { DatabaseModule } from './database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
            clientId: 'auth-events',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
          },
          producerOnlyMode: true,
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
