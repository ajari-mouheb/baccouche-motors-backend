import { IsEnum } from 'class-validator';
import { TestDriveStatus } from '@app/shared';

export class UpdateTestDriveStatusDto {
  @IsEnum(TestDriveStatus)
  status: TestDriveStatus;
}
