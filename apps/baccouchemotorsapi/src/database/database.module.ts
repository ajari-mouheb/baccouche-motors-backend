import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../entities/car.entity';
import { Contact } from '../entities/contact.entity';
import { News } from '../entities/news.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { TestDrive } from '../entities/test-drive.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Car, TestDrive, PasswordResetToken, Contact, News]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Car, TestDrive, PasswordResetToken, Contact, News],
        synchronize: true, // disable in production
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
