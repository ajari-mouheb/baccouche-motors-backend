import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { NewsStatus } from 'src/entities/news.entity';

export class CreateNewsDto {
  @ApiProperty({ description: 'URL slug' })
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiProperty({ description: 'Article title' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ description: 'Short excerpt' })
  @IsString()
  excerpt: string;

  @ApiProperty({ description: 'Full content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Publication date (ISO)', example: '2026-03-04' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ enum: NewsStatus })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}
