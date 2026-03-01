import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';
import { TestDrive, TestDriveStatus } from 'src/entities/test-drive.entity';

export class UpdateTestDriveStatusDto {
  @ApiProperty({
    enum: TestDriveStatus,
    description: 'New status for the test drive',
  })
  @IsEnum(TestDriveStatus)
  status: TestDriveStatus;
}

export class UpdateTestDriveStatusResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  @IsBoolean()
  success: boolean;

  @ApiProperty({ type: () => TestDrive })
  testDrive: TestDrive;
}

