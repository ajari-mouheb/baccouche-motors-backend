import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthRegisterDto } from 'src/dto/auth-register.dto';
import { ForgotPasswordDto } from 'src/dto/forgot-password.dto';
import { LoginUserDto } from 'src/dto/login.dto';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';
import { User } from 'src/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 201, description: 'Customer registered successfully' })
  register(@Body() dto: AuthRegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiResponse({ status: 201, description: 'Logged in successfully' })
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Logged out (client should discard token)' })
  logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Current user profile' })
  getMe(@Req() req: Request & { user: User }) {
    return this.authService.getMe(req.user.id);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiResponse({ status: 200, description: 'Password reset email sent (if email exists)' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
