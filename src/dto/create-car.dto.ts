import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";
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
    @ApiProperty()
    vin: string;
    @ApiProperty()
    mileage: number;
    @ApiProperty()
    color: string;
    @ApiProperty()
    fuelType: string;
    @ApiProperty()
    transmission: string;
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