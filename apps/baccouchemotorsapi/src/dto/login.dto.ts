import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from 'class-validator';

class LoginUserDto {
    @IsEmail()
    @ApiProperty()
    email: string;
    @ApiProperty()
    @IsNotEmpty()
    password: string;
}

class LoginResponseDto {
    @ApiProperty()
    success: boolean;
    @ApiProperty({ description: 'User data (password excluded)' })
    user: Record<string, unknown>;
    @ApiProperty({ description: 'JWT bearer token' })
    auth_token: string;
}

export { LoginResponseDto, LoginUserDto }