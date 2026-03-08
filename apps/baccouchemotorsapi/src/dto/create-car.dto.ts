import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { Car } from "src/entities/car.entity";

class CreateCarDto {
    @ApiProperty()
    make: string;
    @ApiProperty()
    model: string;
    @ApiProperty()
    year: number;
    @ApiProperty()
    price: number;
    @ApiPropertyOptional()
    @IsOptional()
    slug?: string;
    @ApiPropertyOptional()
    @IsOptional()
    image?: string;
    @ApiPropertyOptional()
    @IsOptional()
    description?: string;
    @ApiPropertyOptional()
    @IsOptional()
    specs?: Record<string, unknown>;
    @ApiPropertyOptional()
    @IsOptional()
    vin?: string;
    @ApiPropertyOptional()
    @IsOptional()
    mileage?: number;
    @ApiPropertyOptional()
    @IsOptional()
    color?: string;
    @ApiPropertyOptional()
    @IsOptional()
    fuelType?: string;
    @ApiPropertyOptional()
    @IsOptional()
    transmission?: string;
}
class createCarDtoResponse {
    @ApiProperty()
    message: string;
    @ApiProperty()
    @IsBoolean()
    success: boolean;
    @ApiProperty()
    car: Car;
}
export { CreateCarDto, createCarDtoResponse };