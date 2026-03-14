import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GatewayAuthGuard, GatewayRolesGuard, Roles, UserRole, PATTERNS } from '@app/shared';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('api/admin')
@UseGuards(GatewayAuthGuard, GatewayRolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class AdminController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard (aggregates event-driven stats)' })
  @ApiResponse({ status: 200, description: 'Dashboard stats (cars, news, test drives, contacts)' })
  getDashboard() {
    return firstValueFrom(this.client.send(PATTERNS.ADMIN_GET_DASHBOARD, {}));
  }
}
