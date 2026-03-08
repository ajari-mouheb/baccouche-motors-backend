import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { AuthRegisterDto } from 'src/dto/auth-register.dto';
import { ForgotPasswordDto } from 'src/dto/forgot-password.dto';
import { LoginUserDto } from 'src/dto/login.dto';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';
import { PasswordResetToken } from 'src/entities/password-reset-token.entity';
import { User, UserRole } from 'src/entities/user.entity';
import RegisterResponseDto from 'src/dto/registerresponse.dto';
import { LoginResponseDto } from 'src/dto/login.dto';
import { UserService } from 'src/services/user/user.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepository: Repository<PasswordResetToken>,
  ) {}

  async register(dto: AuthRegisterDto): Promise<RegisterResponseDto> {
    return this.userService.register({
      ...dto,
      role: UserRole.CUSTOMER,
    });
  }

  async login(dto: LoginUserDto): Promise<LoginResponseDto> {
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

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ success: boolean; message: string }> {
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

    await this.emailService.sendPasswordResetEmail(user.email, token);

    return {
      success: true,
      message: 'If the email exists, a reset link will be sent',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
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
