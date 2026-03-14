import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { NewsStatus } from '@app/shared';

export class CreateNewsDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  excerpt: string;

  @IsString()
  content: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}
