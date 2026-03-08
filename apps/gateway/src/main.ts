import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { GatewayModule } from './gateway.module';

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

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
