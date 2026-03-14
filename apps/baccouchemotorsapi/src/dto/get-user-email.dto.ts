import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class GetUserEmailDto {
    @ApiProperty({ description: 'User email address' })
    @IsEmail()
    email: string;
}
