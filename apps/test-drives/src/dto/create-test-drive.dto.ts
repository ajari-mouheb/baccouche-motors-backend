import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTestDriveDto {
  @IsUUID()
  carId: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
