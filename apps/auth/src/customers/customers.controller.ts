import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChangePasswordDto, UpdateUserDto } from '@app/shared';
import { UserService } from '../user/user.service';
import { PATTERNS } from '@app/shared';

@Controller()
export class CustomersController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(PATTERNS.CUSTOMERS_ME)
  getProfile(@Payload() payload: { userId: string }) {
    return this.userService.findById(payload.userId).then((user) => {
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      const { password: _, ...safeUser } = user;
      return safeUser;
    });
  }

  @MessagePattern(PATTERNS.CUSTOMERS_UPDATE_ME)
  updateProfile(
    @Payload() payload: { userId: string } & UpdateUserDto,
  ) {
    const { userId, ...dto } = payload;
    return this.userService.update(userId, dto);
  }

  @MessagePattern(PATTERNS.CUSTOMERS_CHANGE_PASSWORD)
  async changePassword(
    @Payload() payload: { userId: string } & ChangePasswordDto,
  ) {
    await this.userService.changePassword(
      payload.userId,
      payload.currentPassword,
      payload.newPassword,
    );
    return { success: true, message: 'Password changed successfully' };
  }
}
