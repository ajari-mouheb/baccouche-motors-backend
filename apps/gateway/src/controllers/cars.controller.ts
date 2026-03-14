import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GatewayAuthGuard, GatewayRolesGuard, Roles, UserRole, PATTERNS, CreateCarDto, UpdateCarDto, CarsQueryDto } from '@app/shared';

const multerStorage = diskStorage({
  destination: './uploads/cars',
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname) || '.jpg'}`);
  },
});

@ApiTags('Cars')
@Controller('api/cars')
export class CarsController {
  constructor(
    @Inject('CARS_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List cars (paginated, with filters)' })
  @ApiResponse({ status: 200, description: 'Paginated list of cars' })
  getAll(@Query() query: CarsQueryDto) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_FIND_ALL, query));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get cars statistics' })
  @ApiResponse({ status: 200, description: 'Cars stats (total, by status, etc.)' })
  getStats() {
    return firstValueFrom(this.client.send(PATTERNS.CARS_GET_STATS, {}));
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get car by slug' })
  @ApiParam({ name: 'slug' })
  @ApiResponse({ status: 200, description: 'Car details' })
  getBySlug(@Param('slug') slug: string) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_FIND_BY_SLUG, { slug }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get car by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Car details' })
  getById(@Param('id') id: string) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_FIND_BY_ID, { id }));
  }

  @Post()
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create car (emits car.created event)' })
  @ApiResponse({ status: 201, description: 'Car created' })
  create(@Body() body: CreateCarDto) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_CREATE, body));
  }

  @Put(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update car (emits car.updated event)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Car updated' })
  update(@Param('id') id: string, @Body() body: UpdateCarDto) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_UPDATE, { id, ...body }));
  }

  @Delete(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete car (emits car.deleted event)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Car deleted' })
  delete(@Param('id') id: string) {
    return firstValueFrom(this.client.send(PATTERNS.CARS_DELETE, { id }));
  }

  @Post(':id/image')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload car image' })
  @ApiParam({ name: 'id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 200, description: 'Image uploaded' })
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
