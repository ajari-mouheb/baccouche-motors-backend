import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCarDto {
  @ApiProperty()
  @IsString()
  make: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsNumber()
  price: number;

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
