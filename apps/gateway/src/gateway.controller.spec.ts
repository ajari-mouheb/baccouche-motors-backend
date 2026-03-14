import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health/health.controller';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  describe('healthRoot', () => {
    it('should return status ok', () => {
      expect(healthController.healthRoot()).toEqual({
        status: 'ok',
        service: 'gateway',
      });
    });
  });
});
