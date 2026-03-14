import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TestDriveStatus } from '../../constants';

export class UpdateTestDriveStatusDto {
  @ApiProperty({ enum: TestDriveStatus })
  @IsEnum(TestDriveStatus)
  status: TestDriveStatus;
}
