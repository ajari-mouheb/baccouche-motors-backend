import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}
