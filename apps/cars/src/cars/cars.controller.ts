import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCarDto, UpdateCarDto, CarsQueryDto, PaginatedResponseDto } from '@app/shared';
import { CarsService } from './cars.service';
import { PATTERNS } from '@app/shared';

@Controller()
export class CarsController {
  constructor(private readonly carService: CarsService) {}

  @MessagePattern(PATTERNS.CARS_FIND_ALL)
  async getAllCars(@Payload() query: CarsQueryDto) {
    return this.carService.findAll(query);
  }

  @MessagePattern(PATTERNS.CARS_GET_STATS)
  getStats() {
    return this.carService.getStats();
  }

  @MessagePattern(PATTERNS.CARS_FIND_BY_SLUG)
  async getCarBySlug(@Payload() payload: { slug: string }) {
    const car = await this.carService.findBySlug(payload.slug);
    if (!car) return { success: false, message: 'Car not found' };
    return { success: true, car };
  }

  @MessagePattern(PATTERNS.CARS_FIND_BY_ID)
  async getCarById(@Payload() payload: { id: string }) {
    const car = await this.carService.findById(payload.id);
    if (!car) return { success: false, message: 'Car not found' };
    return { success: true, car };
  }

  @MessagePattern(PATTERNS.CARS_CREATE)
  createCar(@Payload() carData: CreateCarDto) {
    return this.carService.createCar(carData);
  }

  @MessagePattern(PATTERNS.CARS_UPDATE)
  updateCar(@Payload() payload: { id: string } & UpdateCarDto) {
    const { id, ...carData } = payload;
    return this.carService.updateCar(id, carData);
  }

  @MessagePattern(PATTERNS.CARS_DELETE)
  deleteCar(@Payload() payload: { id: string }) {
    return this.carService.deleteCar(payload.id);
  }

  @MessagePattern(PATTERNS.CARS_UPLOAD_IMAGE)
  async uploadImage(@Payload() payload: { id: string; imagePath: string }) {
    const car = await this.carService.updateCarImage(payload.id, payload.imagePath);
    return { success: true, car };
  }
}
