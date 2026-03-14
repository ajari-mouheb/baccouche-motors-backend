import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import {
  GatewayAuthGuard,
  PATTERNS,
  AuthRegisterDto,
  LoginUserDto,
  LoginResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '@app/shared';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  register(@Body() dto: AuthRegisterDto) {
    return firstValueFrom(this.client.send(PATTERNS.AUTH_REGISTER, dto));
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT' })
  @ApiResponse({ status: 200, description: 'Returns access token and user', type: LoginResponseDto })
  login(@Body() dto: LoginUserDto) {
    return firstValueFrom(this.client.send(PATTERNS.AUTH_LOGIN, dto));
  }

  @Post('logout')
  @UseGuards(GatewayAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (invalidates token)' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout() {
    return firstValueFrom(this.client.send(PATTERNS.AUTH_LOGOUT, {}));
  }

  @Get('me')
  @UseGuards(GatewayAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  getMe(@Req() req: Request & { headers: Record<string, string> }) {
    return firstValueFrom(
      this.client.send(PATTERNS.AUTH_ME, { userId: req.headers['x-user-id'] }),
    );
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset (emits event → Notifications sends email)' })
  @ApiResponse({ status: 200, description: 'If email exists, reset link sent' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return firstValueFrom(this.client.send(PATTERNS.AUTH_FORGOT_PASSWORD, dto));
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token from email' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return firstValueFrom(this.client.send(PATTERNS.AUTH_RESET_PASSWORD, dto));
  }
}
