import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthRegisterDto, ForgotPasswordDto, LoginUserDto, ResetPasswordDto } from '@app/shared';
import { AuthService } from './auth.service';
import { PATTERNS } from '@app/shared';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(PATTERNS.AUTH_REGISTER)
  register(@Payload() dto: AuthRegisterDto) {
    return this.authService.register(dto);
  }

  @MessagePattern(PATTERNS.AUTH_LOGIN)
  login(@Payload() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @MessagePattern(PATTERNS.AUTH_LOGOUT)
  logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  @MessagePattern(PATTERNS.AUTH_ME)
  getMe(@Payload() payload: { userId: string }) {
    return this.authService.getMe(payload.userId);
  }

  @MessagePattern(PATTERNS.AUTH_FORGOT_PASSWORD)
  forgotPassword(@Payload() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @MessagePattern(PATTERNS.AUTH_RESET_PASSWORD)
  resetPassword(@Payload() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
