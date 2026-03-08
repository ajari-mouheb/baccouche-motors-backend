import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { Car } from "src/entities/car.entity";

class UpdateCarDto {
    @ApiProperty()
    @IsOptional()
    make?: string;
    @ApiProperty()
    @IsOptional()
    model?: string;
    @ApiProperty()
    @IsOptional()
    year?: number;
    @ApiProperty()
    @IsOptional()
    price?: number;
    @ApiProperty()
    @IsOptional()
    slug?: string;
    @ApiProperty()
    @IsOptional()
    image?: string;
    @ApiProperty()
    @IsOptional()
    description?: string;
    @ApiProperty()
    @IsOptional()
    specs?: Record<string, unknown>;
    @ApiProperty()
    @IsOptional()
    vin?: string;
    @ApiProperty()
    @IsOptional()
    mileage?: number;
    @ApiProperty()
    @IsOptional()
    color?: string;
    @ApiProperty()
    @IsOptional()
    fuelType?: string;
    @ApiProperty()
    @IsOptional()
    transmission?: string;
}
class updateCarDtoResponse {
    @ApiProperty()
    message: string;
    @ApiProperty()
    @IsBoolean()
    success: boolean;
    @ApiProperty()
    car: Car;
}
export { UpdateCarDto, updateCarDtoResponse };