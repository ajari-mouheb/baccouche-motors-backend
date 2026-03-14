import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { DatabaseModule } from './database/database.module';
import { UserService } from './services/user/user.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { ContactService } from './services/contact/contact.service';
import { AdminService } from './services/admin/admin.service';
import { NewsService } from './services/news/news.service';
import { CarService } from './services/car/car.service';
import { ContactController } from './controllers/contact/contact.controller';
import { AdminController } from './controllers/admin/admin.controller';
import { CustomersController } from './controllers/customers/customers.controller';
import { NewsController } from './controllers/news/news.controller';
import { CarsController } from './controllers/cars/cars.controller';
import { TestDriveService } from './services/test-drive/test-drive.service';
import { TestDrivesController } from './controllers/test-drives/test-drives.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EmailModule,
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 100, ttl: 60000 }],
    }),
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
  controllers: [
    AppController,
    AuthController,
    AdminController,
    CustomersController,
    ContactController,
    NewsController,
    CarsController,
    TestDrivesController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
    AuthService,
    UserService,
    AdminService,
    ContactService,
    NewsService,
    JwtStrategy,
    CarService,
    TestDriveService,
  ],
})
export class AppModule {}
