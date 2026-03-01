import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { TestDrive } from 'src/entities/test-drive.entity';
import { IsBoolean } from 'class-validator';

export class CreateTestDriveDto {
  @ApiProperty({ description: 'ID of the car to test drive' })
  @IsUUID()
  carId: string;

  @ApiProperty({
    description: 'Scheduled date and time for the test drive (ISO string)',
    example: '2026-03-01T10:00:00.000Z',
  })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({
    description: 'Optional notes from the customer',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTestDriveResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  @IsBoolean()
  success: boolean;

  @ApiProperty({ type: () => TestDrive })
  testDrive: TestDrive;
}

