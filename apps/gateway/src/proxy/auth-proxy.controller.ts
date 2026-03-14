import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { GatewayAuthGuard } from '@app/shared';
import { PATTERNS } from '@app/shared';

@Controller('api/auth')
export class AuthProxyController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientKafka,
  ) {}

  @Post('register')
  register(@Body() dto: unknown) {
    return firstValueFrom(this.client.send(PATTERNS.AUTH_REGISTER, dto));
  }

  @Post('login')
  login(@Body() dto: unknown) {
    return firstValueFrom(this.client.send(PATTERNS.AUTH_LOGIN, dto));
  }

  @Post('logout')
  @UseGuards(GatewayAuthGuard)
  logout() {
    return firstValueFrom(this.client.send(PATTERNS.AUTH_LOGOUT, {}));
  }

  @Get('me')
  @UseGuards(GatewayAuthGuard)
  getMe(@Req() req: Request & { headers: Record<string, string> }) {
    return firstValueFrom(
      this.client.send(PATTERNS.AUTH_ME, { userId: req.headers['x-user-id'] }),
    );
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: unknown) {
    return firstValueFrom(this.client.send(PATTERNS.AUTH_FORGOT_PASSWORD, dto));
  }

  @Post('reset-password')
  resetPassword(@Body() dto: unknown) {
    return firstValueFrom(this.client.send(PATTERNS.AUTH_RESET_PASSWORD, dto));
  }
}
