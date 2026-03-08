import {
  IsDateString,
  IsEmail,
  IsIn,
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateTestDriveGuestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsDateString()
  preferredDate: string;

  @IsIn(['morning', 'afternoon'])
  timeSlot: string;
}
