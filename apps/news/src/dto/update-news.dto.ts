import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { NewsStatus } from '@app/shared';

export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}
