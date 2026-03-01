import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserService } from './services/user/user.service';
import { UserController } from './controllers/user/user.controller';
import { JwtStrategy } from './auth/jwt.strategy';
import { CarService } from './services/car/car.service';
import { CarController } from './controllers/car/car.controller';
import { TestDriveService } from './services/test-drive/test-drive.service';
import { TestDriveController } from './controllers/test-drive/test-drive.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  controllers: [AppController, UserController, CarController, TestDriveController],
  providers: [AppService, UserService, JwtStrategy, CarService, TestDriveService],
})
export class AppModule {}
