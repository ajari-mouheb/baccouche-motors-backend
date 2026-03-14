import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { GatewayModule } from './gateway.module';
import {
  LoginResponseDto,
  PaginatedResponseDto,
  AuthRegisterDto,
  LoginUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  CreateCarDto,
  UpdateCarDto,
  CarsQueryDto,
  CreateNewsDto,
  UpdateNewsDto,
  CreateContactDto,
  UpdateContactDto,
  CreateTestDriveDto,
  CreateTestDriveGuestDto,
  UpdateTestDriveStatusDto,
  UpdateUserDto,
  ChangePasswordDto,
  PaginationDto,
} from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(GatewayModule);

  const uploadsDir = join(__dirname, '..', 'uploads');
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
  const carsDir = join(uploadsDir, 'cars');
  const newsDir = join(uploadsDir, 'news');
  if (!existsSync(carsDir)) mkdirSync(carsDir, { recursive: true });
  if (!existsSync(newsDir)) mkdirSync(newsDir, { recursive: true });
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new RpcExceptionFilter());

  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .setTitle('Baccouche Motors API Gateway')
    .setDescription(
      `API Gateway for Baccouche Motors microservices.

## Event-Driven Design (RabbitMQ)
This system follows a strict **Event-Driven Design** pattern:
- **Domain events** are emitted on create/update/delete operations
- **Consumers** react asynchronously (emails, stats, audit)

| Event | Producer | Consumers |
|-------|----------|-----------|
| \`auth.forgot-password-requested\` | Auth | Notifications (email) |
| \`car.created\` / \`updated\` / \`deleted\` | Cars | Admin (stats) |
| \`news.created\` / \`updated\` / \`deleted\` | News | Admin (stats) |
| \`contact.created\` / \`updated\` | Contacts | Notifications, Admin |
| \`test-drive.created\` / \`status-changed\` | Test Drives | Notifications, Admin |

**Flow**: Gateway → RabbitMQ RPC (sync) → Microservice → emits to \`baccouche.events\` exchange → Consumers (Notifications, Admin)`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      LoginResponseDto,
      PaginatedResponseDto,
      AuthRegisterDto,
      LoginUserDto,
      ForgotPasswordDto,
      ResetPasswordDto,
      CreateCarDto,
      UpdateCarDto,
      CarsQueryDto,
      CreateNewsDto,
      UpdateNewsDto,
      CreateContactDto,
      UpdateContactDto,
      CreateTestDriveDto,
      CreateTestDriveGuestDto,
      UpdateTestDriveStatusDto,
      UpdateUserDto,
      ChangePasswordDto,
      PaginationDto,
    ],
  });
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
  });

  // Write OpenAPI JSON to file for versioning / external tools
  try {
    const docsDir = join(process.cwd(), 'docs');
    if (!existsSync(docsDir)) mkdirSync(docsDir, { recursive: true });
    writeFileSync(
      join(docsDir, 'openapi.json'),
      JSON.stringify(document, null, 2),
    );
  } catch {
    // ignore if docs write fails (e.g. read-only filesystem in Docker)
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
