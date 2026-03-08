import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GatewayAuthGuard, GatewayRolesGuard, Roles, UserRole } from '@app/shared';
import { PATTERNS } from '@app/shared';

const multerStorage = diskStorage({
  destination: './uploads/cars',
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname) || '.jpg'}`);
  },
});

@Controller('api/cars')
export class CarsProxyController {
  constructor(
    @Inject('CARS_SERVICE') private readonly client: ClientKafka,
  ) {}

  @Get()
  getAll(@Query() query: Record<string, unknown>) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_FIND_ALL, query));
  }

  @Get('stats')
  getStats() {
    return firstValueFrom(this.client.send(PATTERNS.CARS_GET_STATS, {}));
  }

  @Get('slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_FIND_BY_SLUG, { slug }));
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_FIND_BY_ID, { id }));
  }

  @Post()
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  create(@Body() body: unknown) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_CREATE, body));
  }

  @Put(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  update(@Param('id') id: string, @Body() body: unknown) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_UPDATE, { id, ...body as object }));
  }

  @Delete(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  delete(@Param('id') id: string) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_DELETE, { id }));
  }

  @Post(':id/image')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
        cb(null, allowed.test(file.originalname));
      },
    }),
  )
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: { filename: string },
  ) {
    const imagePath = `/uploads/cars/${file.filename}`;
    return firstValueFrom(
      this.client.send(PATTERNS.CARS_UPLOAD_IMAGE, { id, imagePath }),
    );
  }
}
