import { Test, TestingModule } from '@nestjs/testing';
import { CarsController } from './cars/cars.controller';
import { CarsService } from './cars/cars.service';

describe('CarsController', () => {
  let carsController: CarsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [
        {
          provide: CarsService,
          useValue: { getStats: jest.fn().mockResolvedValue({ total: 0 }) },
        },
      ],
    }).compile();

    carsController = app.get<CarsController>(CarsController);
  });

  describe('getStats', () => {
    it('should return stats from service', async () => {
      const result = await carsController.getStats();
      expect(result).toEqual({ total: 0 });
    });
  });
});
