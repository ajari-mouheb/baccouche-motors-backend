import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ description: 'User object' })
  user: Record<string, unknown>;

  @ApiProperty({ description: 'JWT access token' })
  auth_token: string;
}
