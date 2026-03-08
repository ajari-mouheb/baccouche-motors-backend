import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdminService } from './admin.service';
import { PATTERNS } from '@app/shared';

@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @MessagePattern(PATTERNS.ADMIN_GET_DASHBOARD)
  getDashboard() {
    return this.adminService.getDashboardStats();
  }
}
