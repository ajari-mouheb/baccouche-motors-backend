import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ description: 'Contact name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Message subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
