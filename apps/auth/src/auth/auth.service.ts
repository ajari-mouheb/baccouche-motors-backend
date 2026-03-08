import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { AuthRegisterDto } from '../dto/auth-register.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginUserDto } from '../dto/login.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { UserRole } from '@app/shared';
import { UserService } from '../user/user.service';
import { EVENT_PATTERNS } from '@app/shared';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject('EVENTS_CLIENT') private readonly eventsClient: ClientKafka,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepository: Repository<PasswordResetToken>,
  ) {}

  async onModuleInit() {
    await this.eventsClient.connect();
  }

  async register(dto: AuthRegisterDto) {
    return this.userService.register({
      ...dto,
      role: UserRole.CUSTOMER,
    });
  }

  async login(dto: LoginUserDto) {
    return this.userService.loginUser(dto);
  }

  async getMe(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      return {
        success: true,
        message: 'If the email exists, a reset link will be sent',
      };
    }

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.resetTokenRepository.delete({ userId: user.id });
    await this.resetTokenRepository.save({
      userId: user.id,
      token,
      expiresAt,
    });

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    this.eventsClient.emit(EVENT_PATTERNS.AUTH_FORGOT_PASSWORD_REQUESTED, {
      email: user.email,
      resetToken: token,
      resetLink,
    });

    return {
      success: true,
      message: 'If the email exists, a reset link will be sent',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetToken = await this.resetTokenRepository.findOne({
      where: { token: dto.token },
      relations: ['user'],
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userService.updatePassword(resetToken.userId, hashedPassword);
    await this.resetTokenRepository.delete({ id: resetToken.id });

    return {
      success: true,
      message: 'Password has been reset successfully',
    };
  }
}
