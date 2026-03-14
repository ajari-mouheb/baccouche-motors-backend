import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { GatewayAuthGuard, GatewayRolesGuard, Roles, UserRole } from '@app/shared';
import { PATTERNS } from '@app/shared';

@Controller('api/test-drives')
export class TestDrivesProxyController {
  constructor(
    @Inject('TEST_DRIVES_SERVICE') private readonly client: ClientKafka,
  ) {}

  @Post()
  create(
    @Body() body: Record<string, unknown>,
    @Req() req: Request & { headers: Record<string, string>; user?: { id: string; email: string; role: string; firstName?: string; lastName?: string } },
  ) {
    const user = req.headers['x-user-id']
      ? {
          id: req.headers['x-user-id'],
          email: req.headers['x-user-email'] ?? '',
          role: req.headers['x-user-role'] ?? '',
          firstName: req.headers['x-user-firstname'],
          lastName: req.headers['x-user-lastname'],
        }
      : undefined;
    return firstValueFrom(
      this.client.send(PATTERNS.TEST_DRIVES_SCHEDULE, { ...body, user }),
    );
  }

  @Get()
  @UseGuards(GatewayAuthGuard)
  list(
    @Query() query: Record<string, unknown>,
    @Req() req: Request & { headers: Record<string, string> },
  ) {
    const role = req.headers['x-user-role'] as string;
    const isAdmin = role === UserRole.ADMIN || role === UserRole.STAFF;
    return firstValueFrom(
      this.client.send(PATTERNS.TEST_DRIVES_FIND_ALL, {
        page: query.page,
        limit: query.limit,
        userId: req.headers['x-user-id'],
        userEmail: req.headers['x-user-email'],
        isAdmin,
      }),
    );
  }

  @Get('stats')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getStats() {
    return firstValueFrom(this.client.send(PATTERNS.TEST_DRIVES_GET_STATS, {}));
  }

  @Get(':id')
  @UseGuards(GatewayAuthGuard)
  getById(
    @Param('id') id: string,
    @Req() req: Request & { headers: Record<string, string> },
  ) {
    const user = {
      id: req.headers['x-user-id'] ?? '',
      email: req.headers['x-user-email'] ?? '',
      role: req.headers['x-user-role'] ?? '',
    };
    return firstValueFrom(
      this.client.send(PATTERNS.TEST_DRIVES_FIND_BY_ID, { id, user }),
    );
  }

  @Patch(':id')
  @UseGuards(GatewayAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: unknown,
    @Req() req: Request & { headers: Record<string, string> },
  ) {
    const user = {
      id: req.headers['x-user-id'] ?? '',
      email: req.headers['x-user-email'] ?? '',
      role: req.headers['x-user-role'] ?? '',
    };
    return firstValueFrom(
      this.client.send(PATTERNS.TEST_DRIVES_UPDATE_STATUS, { id, dto, user }),
    );
  }

  @Delete(':id')
  @UseGuards(GatewayAuthGuard)
  cancel(
    @Param('id') id: string,
    @Req() req: Request & { headers: Record<string, string> },
  ) {
    const user = {
      id: req.headers['x-user-id'] ?? '',
      email: req.headers['x-user-email'] ?? '',
      role: req.headers['x-user-role'] ?? '',
    };
    return firstValueFrom(
      this.client.send(PATTERNS.TEST_DRIVES_DELETE, { id, user }),
    );
  }
}
