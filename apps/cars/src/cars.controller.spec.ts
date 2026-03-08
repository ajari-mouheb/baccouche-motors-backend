import { Test, TestingModule } from '@nestjs/testing';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';

describe('CarsController', () => {
  let carsController: CarsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CarsController],
      providers: [CarsService],
    }).compile();

    carsController = app.get<CarsController>(CarsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(carsController.getHello()).toBe('Hello World!');
    });
  });
});
