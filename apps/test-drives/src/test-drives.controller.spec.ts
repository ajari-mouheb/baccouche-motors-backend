import { Test, TestingModule } from '@nestjs/testing';
import { TestDrivesController } from './test-drives.controller';
import { TestDrivesService } from './test-drives.service';

describe('TestDrivesController', () => {
  let testDrivesController: TestDrivesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TestDrivesController],
      providers: [TestDrivesService],
    }).compile();

    testDrivesController = app.get<TestDrivesController>(TestDrivesController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(testDrivesController.getHello()).toBe('Hello World!');
    });
  });
});
