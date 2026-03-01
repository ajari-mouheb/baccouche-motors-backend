import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  CreateCarDto,
  createCarDtoResponse,
} from 'src/dto/create-car.dto';
import {
  UpdateCarDto,
  updateCarDtoResponse,
} from 'src/dto/update-car.dto';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { Car } from 'src/entities/car.entity';
import { CarService } from 'src/services/car/car.service';

@Controller('car')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Car created successfully',
    type: createCarDtoResponse,
  })
  createCar(@Body() carData: CreateCarDto): Promise<createCarDtoResponse> {
    return this.carService.createCar(carData);
  }

  @Get('all')
  @ApiResponse({
    status: 200,
    description: 'Paginated list of cars',
  })
  async getAllCars(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Car>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    return this.carService.findAll(page, limit);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Car found by ID',
  })
  async getCarById(@Param('id') id: string) {
    const car = await this.carService.findById(id);
    if (!car) {
      return { success: false, message: 'Car not found' };
    }
    return { success: true, car };
  }

  @Put(':id')
  @ApiResponse({
    status: 200,
    description: 'Car updated successfully',
    type: updateCarDtoResponse,
  })
  updateCar(
    @Param('id') id: string,
    @Body() carData: UpdateCarDto,
  ): Promise<updateCarDtoResponse> {
    return this.carService.updateCar(id, carData);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Car deleted successfully',
  })
  deleteCar(
    @Param('id') id: string,
  ): Promise<{ message: string; success: boolean }> {
    return this.carService.deleteCar(id);
  }
}
