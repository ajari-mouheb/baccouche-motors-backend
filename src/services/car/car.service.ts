import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCarDto, createCarDtoResponse } from 'src/dto/create-car.dto';
import { UpdateCarDto, updateCarDtoResponse } from 'src/dto/update-car.dto';
import { Car } from 'src/entities/car.entity';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';
import { Repository } from 'typeorm';

@Injectable()
export class CarService {
    constructor(
        @InjectRepository(Car)
        private readonly carRepository: Repository<Car>,
    ) { }

    async createCar(carData: CreateCarDto): Promise<createCarDtoResponse> {
        const car = this.carRepository.create(carData);
        await this.carRepository.save(car);
        return { message: 'Car created successfully', car: car, success: true };
    }

    async updateCar(id: string, carData: UpdateCarDto): Promise<updateCarDtoResponse> {
        await this.carRepository.update(id, carData);
        const car = await this.carRepository.findOneOrFail({ where: { id } });
        return { message: 'Car updated successfully', car: car, success: true };
    }

    async deleteCar(id: string): Promise<{ message: string, success: boolean, car: Car | null }> {
        const result = await this.carRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Car not found');
        }
        return { message: 'Car deleted successfully', success: true, car: null };
    }

    async findById(id: string): Promise<Car | null> {
        return this.carRepository.findOne({ where: { id } });
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
    ): Promise<PaginatedResponseDto<Car>> {
        const skip = (page - 1) * limit;
        const [cars, total] = await this.carRepository.findAndCount({
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return new PaginatedResponseDto(cars, total, page, limit);
    }
}
