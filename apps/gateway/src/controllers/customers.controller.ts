import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { GatewayAuthGuard, PATTERNS, UpdateUserDto, ChangePasswordDto } from '@app/shared';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('api/customers')
@UseGuards(GatewayAuthGuard)
export class CustomersController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user details' })
  getMe(@Req() req: Request & { headers: Record<string, string> }) {
    return firstValueFrom(
      this.client.send(PATTERNS.CUSTOMERS_ME, { userId: req.headers['x-user-id'] }),
    );
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  updateMe(
    @Req() req: Request & { headers: Record<string, string> },
    @Body() dto: UpdateUserDto,
  ) {
    return firstValueFrom(
      this.client.send(PATTERNS.CUSTOMERS_UPDATE_ME, { userId: req.headers['x-user-id'], ...dto }),
    );
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  changePassword(
    @Req() req: Request & { headers: Record<string, string> },
    @Body() dto: ChangePasswordDto,
  ) {
    return firstValueFrom(
      this.client.send(PATTERNS.CUSTOMERS_CHANGE_PASSWORD, { userId: req.headers['x-user-id'], ...dto }),
    );
  }
}
