import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTestDriveGuestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'guest@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Car model name' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: '2025-03-20' })
  @IsDateString()
  preferredDate: string;

  @ApiProperty({ enum: ['morning', 'afternoon'] })
  @IsIn(['morning', 'afternoon'])
  timeSlot: string;
}
