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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import {
  GatewayAuthGuard,
  GatewayRolesGuard,
  Roles,
  UserRole,
  PATTERNS,
  CreateNewsDto,
  UpdateNewsDto,
  PaginationDto,
} from '@app/shared';

const multerStorage = diskStorage({
  destination: './uploads/news',
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname) || '.jpg'}`);
  },
});

@ApiTags('News')
@Controller('api/news')
export class NewsController {
  constructor(
    @Inject('NEWS_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List news (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Paginated list of news' })
  list(
    @Query() query: PaginationDto,
    @Req() req: Request & { headers: Record<string, string> },
  ) {
    const role = req.headers['x-user-role'] as string;
    const adminView = role === UserRole.ADMIN || role === UserRole.STAFF;
    return firstValueFrom(
      this.client.send(PATTERNS.NEWS_FIND_ALL, {
        page: query.page,
        limit: query.limit,
        adminView,
      }),
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get news statistics' })
  @ApiResponse({ status: 200, description: 'News stats' })
  getStats() {
    return firstValueFrom(this.client.send(PATTERNS.NEWS_GET_STATS, {}));
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get news by slug' })
  @ApiParam({ name: 'slug' })
  @ApiResponse({ status: 200, description: 'News details' })
  getBySlug(@Param('slug') slug: string) {
    return firstValueFrom(this.client.send(PATTERNS.NEWS_FIND_BY_SLUG, { slug }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get news by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'News details' })
  getById(@Param('id') id: string) {
    return firstValueFrom(this.client.send(PATTERNS.NEWS_FIND_BY_ID, { id }));
  }

  @Post()
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create news (emits news.created event)' })
  @ApiResponse({ status: 201, description: 'News created' })
  create(@Body() body: CreateNewsDto) {
    return firstValueFrom(this.client.send(PATTERNS.NEWS_CREATE, body));
  }

  @Put(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update news (emits news.updated event)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'News updated' })
  update(@Param('id') id: string, @Body() body: UpdateNewsDto) {
    return firstValueFrom(this.client.send(PATTERNS.NEWS_UPDATE, { id, ...body }));
  }

  @Delete(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete news (emits news.deleted event)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'News deleted' })
  delete(@Param('id') id: string) {
    return firstValueFrom(this.client.send(PATTERNS.NEWS_DELETE, { id }));
  }

  @Post(':id/image')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload news image' })
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
    const imagePath = `/uploads/news/${file.filename}`;
    return firstValueFrom(
      this.client.send(PATTERNS.NEWS_UPLOAD_IMAGE, { id, imagePath }),
    );
  }
}
