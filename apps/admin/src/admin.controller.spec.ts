import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';

describe('AdminController', () => {
  let adminController: AdminController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: { getDashboardStats: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile();

    adminController = app.get<AdminController>(AdminController);
  });

  describe('getDashboard', () => {
    it('should return dashboard stats from service', async () => {
      const result = await adminController.getDashboard();
      expect(result).toBeDefined();
    });
  });
});
