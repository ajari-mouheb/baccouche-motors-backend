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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtOptionalGuard } from 'src/auth/jwt-optional.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { User, UserRole } from 'src/entities/user.entity';
import { CreateNewsDto } from 'src/dto/create-news.dto';
import { UpdateNewsDto } from 'src/dto/update-news.dto';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { News } from 'src/entities/news.entity';
import { NewsService } from 'src/services/news/news.service';

const multerStorage = diskStorage({
  destination: './uploads/news',
  filename: (_req, file, cb) => {
    const name = randomUUID();
    cb(null, `${name}${extname(file.originalname) || '.jpg'}`);
  },
});

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @UseGuards(JwtOptionalGuard)
  @ApiResponse({ status: 200, description: 'List news (public: published only, admin: all)' })
  async list(
    @Query() pagination: PaginationDto,
    @Req() req: Request & { user?: User },
  ): Promise<PaginatedResponseDto<News>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const isAdmin =
      req.user &&
      (req.user.role === UserRole.ADMIN || req.user.role === UserRole.STAFF);
    return this.newsService.findAll(page, limit, !!isAdmin);
  }

  @Get('slug/:slug')
  @ApiResponse({ status: 200, description: 'News by slug (public)' })
  async getBySlug(@Param('slug') slug: string) {
    const news = await this.newsService.findBySlug(slug);
    if (!news) {
      return { success: false, message: 'News not found' };
    }
    return { success: true, news };
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'News by ID (public for published)' })
  async getById(@Param('id') id: string) {
    const news = await this.newsService.findById(id);
    if (!news) {
      return { success: false, message: 'News not found' };
    }
    return { success: true, news };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'News created' })
  create(@Body() dto: CreateNewsDto) {
    return this.newsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'News updated' })
  update(@Param('id') id: string, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'News deleted' })
  async delete(@Param('id') id: string) {
    await this.newsService.delete(id);
    return { success: true, message: 'News deleted' };
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|webp|gif)$/i;
        if (allowed.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: { filename: string },
  ) {
    const path = `/uploads/news/${file.filename}`;
    const news = await this.newsService.updateImage(id, path);
    return { success: true, news };
  }
}
