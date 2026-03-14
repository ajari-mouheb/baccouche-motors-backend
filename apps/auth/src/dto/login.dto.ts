import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  user: Record<string, unknown>;

  @ApiProperty()
  auth_token: string;
}
