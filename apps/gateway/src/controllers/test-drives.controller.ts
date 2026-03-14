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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import {
  GatewayAuthGuard,
  GatewayRolesGuard,
  Roles,
  UserRole,
  PATTERNS,
  CreateTestDriveDto,
  CreateTestDriveGuestDto,
  UpdateTestDriveStatusDto,
  PaginationDto,
} from '@app/shared';

@ApiTags('Test Drives')
@Controller('api/test-drives')
export class TestDrivesController {
  constructor(
    @Inject('TEST_DRIVES_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Schedule test drive (emits test-drive.created event)',
    description: 'Logged-in: send carId, scheduledAt, notes. Guest: send name, phone, email, model, preferredDate, timeSlot.',
  })
  @ApiResponse({ status: 201, description: 'Test drive scheduled' })
  create(
    @Body() body: CreateTestDriveDto | CreateTestDriveGuestDto,
    @Req() req: Request & { headers: Record<string, string> },
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List test drives' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Paginated list of test drives' })
  list(
    @Query() query: PaginationDto,
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get test drive statistics' })
  @ApiResponse({ status: 200, description: 'Test drive stats' })
  getStats() {
    return firstValueFrom(this.client.send(PATTERNS.TEST_DRIVES_GET_STATS, {}));
  }

  @Get(':id')
  @UseGuards(GatewayAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get test drive by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Test drive details' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update test drive status (emits test-drive.status-changed event)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTestDriveStatusDto,
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel test drive' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Test drive cancelled' })
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
