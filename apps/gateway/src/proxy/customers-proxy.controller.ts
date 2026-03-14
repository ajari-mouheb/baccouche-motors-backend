import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { GatewayAuthGuard } from '@app/shared';
import { PATTERNS } from '@app/shared';

@Controller('api/customers')
@UseGuards(GatewayAuthGuard)
export class CustomersProxyController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientKafka,
  ) {}

  @Get('me')
  getMe(@Req() req: Request & { headers: Record<string, string> }) {
    return firstValueFrom(
      this.client.send(PATTERNS.CUSTOMERS_ME, { userId: req.headers['x-user-id'] }),
    );
  }

  @Patch('me')
  updateMe(
    @Req() req: Request & { headers: Record<string, string> },
    @Body() dto: unknown,
  ) {
    return firstValueFrom(
      this.client.send(PATTERNS.CUSTOMERS_UPDATE_ME, { userId: req.headers['x-user-id'], ...dto as object }),
    );
  }

  @Patch('me/password')
  changePassword(
    @Req() req: Request & { headers: Record<string, string> },
    @Body() dto: unknown,
  ) {
    return firstValueFrom(
      this.client.send(PATTERNS.CUSTOMERS_CHANGE_PASSWORD, { userId: req.headers['x-user-id'], ...dto as object }),
    );
  }
}
