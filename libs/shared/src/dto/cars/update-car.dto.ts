import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateCarDto {
  @ApiPropertyOptional()
  @IsOptional()
  make?: string;

  @ApiPropertyOptional()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  specs?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  vin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  mileage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  fuelType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  transmission?: string;
}
