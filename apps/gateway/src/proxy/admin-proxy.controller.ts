import { Controller, Get, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GatewayAuthGuard, GatewayRolesGuard, Roles, UserRole } from '@app/shared';
import { PATTERNS } from '@app/shared';

@Controller('api/admin')
@UseGuards(GatewayAuthGuard, GatewayRolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class AdminProxyController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly client: ClientKafka,
  ) {}

  @Get('dashboard')
  getDashboard() {
    return firstValueFrom(this.client.send(PATTERNS.ADMIN_GET_DASHBOARD, {}));
  }
}
