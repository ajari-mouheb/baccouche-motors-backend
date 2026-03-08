import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChangePasswordDto } from 'src/dto/change-password.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { User } from 'src/entities/user.entity';
import { UserService } from 'src/services/user/user.service';

@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiResponse({ status: 200, description: 'Current customer profile' })
  getProfile(@Req() req: Request & { user: User }) {
    return this.userService.findById(req.user.id).then((user) => {
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      const { password: _, ...safeUser } = user;
      return safeUser;
    });
  }

  @Patch('me')
  @ApiResponse({ status: 200, description: 'Profile updated' })
  updateProfile(
    @Req() req: Request & { user: User },
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.id, dto);
  }

  @Patch('me/password')
  @ApiResponse({ status: 200, description: 'Password changed' })
  async changePassword(
    @Req() req: Request & { user: User },
    @Body() dto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
    return { success: true, message: 'Password changed successfully' };
  }
}
