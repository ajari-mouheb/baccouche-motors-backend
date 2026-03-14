import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news/news.controller';
import { NewsService } from './news/news.service';

describe('NewsController', () => {
  let newsController: NewsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        {
          provide: NewsService,
          useValue: { getStats: jest.fn().mockResolvedValue({ total: 0 }) },
        },
      ],
    }).compile();

    newsController = app.get<NewsController>(NewsController);
  });

  describe('getStats', () => {
    it('should return stats from service', async () => {
      const result = await newsController.getStats();
      expect(result).toEqual({ total: 0 });
    });
  });
});
