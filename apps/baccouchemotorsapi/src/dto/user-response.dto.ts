import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/entities/user.entity';

export class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty({ nullable: true })
    phone: string | null;

    @ApiProperty({ enum: UserRole })
    role: UserRole;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
