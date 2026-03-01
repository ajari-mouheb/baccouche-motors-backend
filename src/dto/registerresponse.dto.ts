import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

class RegisterResponseDto {
    @ApiProperty()
    message: string;
    @ApiProperty()
    userId: string;
    @ApiProperty()
    @IsBoolean()
    success: boolean;
}

export default RegisterResponseDto;