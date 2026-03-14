import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateTestDriveGuestDto {
  @ApiProperty({ description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Customer phone' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Car model name (e.g. BMW Série 3)' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ description: 'Preferred date (ISO date string)', example: '2026-03-15' })
  @IsDateString()
  preferredDate: string;

  @ApiProperty({ description: 'Time slot', enum: ['morning', 'afternoon'] })
  @IsIn(['morning', 'afternoon'])
  timeSlot: string;
}
