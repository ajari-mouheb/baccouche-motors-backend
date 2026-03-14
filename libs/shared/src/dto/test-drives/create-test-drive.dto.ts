import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTestDriveDto {
  @ApiProperty({ description: 'Car UUID' })
  @IsUUID()
  carId: string;

  @ApiProperty({ example: '2025-03-20T10:00:00.000Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
