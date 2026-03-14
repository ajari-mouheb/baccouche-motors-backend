import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateNewsDto, UpdateNewsDto } from '@app/shared';
import { NewsService } from './news.service';
import { PATTERNS } from '@app/shared';

@Controller()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @MessagePattern(PATTERNS.NEWS_FIND_ALL)
  async list(@Payload() payload: { page?: number; limit?: number; adminView?: boolean }) {
    const page = payload.page ?? 1;
    const limit = payload.limit ?? 10;
    return this.newsService.findAll(page, limit, !!payload.adminView);
  }

  @MessagePattern(PATTERNS.NEWS_GET_STATS)
  getStats() {
    return this.newsService.getStats();
  }

  @MessagePattern(PATTERNS.NEWS_FIND_BY_SLUG)
  async getBySlug(@Payload() payload: { slug: string }) {
    const news = await this.newsService.findBySlug(payload.slug);
    if (!news) return { success: false, message: 'News not found' };
    return { success: true, news };
  }

  @MessagePattern(PATTERNS.NEWS_FIND_BY_ID)
  async getById(@Payload() payload: { id: string }) {
    const news = await this.newsService.findById(payload.id);
    if (!news) return { success: false, message: 'News not found' };
    return { success: true, news };
  }

  @MessagePattern(PATTERNS.NEWS_CREATE)
  create(@Payload() dto: CreateNewsDto) {
    return this.newsService.create(dto);
  }

  @MessagePattern(PATTERNS.NEWS_UPDATE)
  update(@Payload() payload: { id: string } & UpdateNewsDto) {
    const { id, ...dto } = payload;
    return this.newsService.update(id, dto);
  }

  @MessagePattern(PATTERNS.NEWS_DELETE)
  async delete(@Payload() payload: { id: string }) {
    await this.newsService.delete(payload.id);
    return { success: true, message: 'News deleted' };
  }

  @MessagePattern(PATTERNS.NEWS_UPLOAD_IMAGE)
  async uploadImage(@Payload() payload: { id: string; imagePath: string }) {
    const news = await this.newsService.updateImage(payload.id, payload.imagePath);
    return { success: true, news };
  }
}
