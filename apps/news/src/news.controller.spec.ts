import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

describe('NewsController', () => {
  let newsController: NewsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [NewsService],
    }).compile();

    newsController = app.get<NewsController>(NewsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(newsController.getHello()).toBe('Hello World!');
    });
  });
});
