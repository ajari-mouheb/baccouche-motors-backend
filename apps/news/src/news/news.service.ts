import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../entities/news.entity';
import { CreateNewsDto, UpdateNewsDto, PaginatedResponseDto } from '@app/shared';
import { NewsStatus } from '@app/shared';
import { EVENT_PATTERNS } from '@app/shared';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @Inject('EVENTS_CLIENT') private readonly eventsClient: ClientProxy,
  ) {}

  async create(dto: CreateNewsDto): Promise<News> {
    const existing = await this.newsRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('News with this slug already exists');
    }
    const news = this.newsRepository.create({
      ...dto,
      date: new Date(dto.date),
      image: dto.image ?? null,
      status: dto.status ?? NewsStatus.PUBLISHED,
    });
    const saved = await this.newsRepository.save(news);
    this.eventsClient.emit(EVENT_PATTERNS.NEWS_CREATED, { id: saved.id });
    return saved;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    adminView = false,
  ): Promise<PaginatedResponseDto<News>> {
    const skip = (page - 1) * limit;
    const where = adminView ? {} : { status: NewsStatus.PUBLISHED };
    const [items, total] = await this.newsRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { date: 'DESC' },
    });
    return new PaginatedResponseDto(items, total, page, limit);
  }

  async findBySlug(slug: string): Promise<News | null> {
    return this.newsRepository.findOne({
      where: { slug, status: NewsStatus.PUBLISHED },
    });
  }

  async findById(id: string): Promise<News | null> {
    return this.newsRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateNewsDto): Promise<News> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException('News not found');
    }
    if (dto.slug !== undefined && dto.slug !== news.slug) {
      const existing = await this.newsRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('News with this slug already exists');
      }
    }
    Object.assign(news, {
      ...dto,
      ...(dto.date && { date: new Date(dto.date) }),
    });
    const saved = await this.newsRepository.save(news);
    this.eventsClient.emit(EVENT_PATTERNS.NEWS_UPDATED, { id });
    return saved;
  }

  async delete(id: string): Promise<void> {
    const result = await this.newsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('News not found');
    }
    this.eventsClient.emit(EVENT_PATTERNS.NEWS_DELETED, { id });
  }

  async updateImage(id: string, imagePath: string): Promise<News> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException('News not found');
    }
    news.image = imagePath;
    return this.newsRepository.save(news);
  }

  async getStats(): Promise<{ total: number }> {
    const total = await this.newsRepository.count();
    return { total };
  }
}
