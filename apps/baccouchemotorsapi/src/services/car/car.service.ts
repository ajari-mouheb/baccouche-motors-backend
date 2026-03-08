import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCarDto, createCarDtoResponse } from 'src/dto/create-car.dto';
import { UpdateCarDto, updateCarDtoResponse } from 'src/dto/update-car.dto';
import { CarsQueryDto } from 'src/dto/cars-query.dto';
import { Car } from 'src/entities/car.entity';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';
import { Repository } from 'typeorm';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class CarService {
    constructor(
        @InjectRepository(Car)
        private readonly carRepository: Repository<Car>,
    ) { }

    async createCar(carData: CreateCarDto): Promise<createCarDtoResponse> {
        const slug =
          carData.slug ||
          `${slugify(carData.make)}-${slugify(carData.model)}-${carData.year}`;
        const existing = await this.carRepository.findOne({ where: { slug } });
        let finalSlug = slug;
        if (existing) {
          let suffix = 1;
          while (await this.carRepository.findOne({ where: { slug: `${slug}-${suffix}` } })) {
            suffix++;
          }
          finalSlug = `${slug}-${suffix}`;
        }
        const car = this.carRepository.create({
          ...carData,
          slug: finalSlug,
          image: carData.image ?? null,
          description: carData.description ?? null,
          specs: carData.specs ?? null,
          vin: carData.vin ?? null,
          mileage: carData.mileage ?? null,
          color: carData.color ?? null,
          fuelType: carData.fuelType ?? null,
          transmission: carData.transmission ?? null,
        });
        await this.carRepository.save(car);
        return { message: 'Car created successfully', car, success: true };
    }

    async updateCar(id: string, carData: UpdateCarDto): Promise<updateCarDtoResponse> {
        const car = await this.carRepository.findOneOrFail({ where: { id } });
        Object.assign(car, carData);
        await this.carRepository.save(car);
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

    async findBySlug(slug: string): Promise<Car | null> {
        return this.carRepository.findOne({ where: { slug } });
    }

    async updateCarImage(id: string, imagePath: string): Promise<Car> {
        const car = await this.carRepository.findOne({ where: { id } });
        if (!car) {
            throw new NotFoundException('Car not found');
        }
        car.image = imagePath;
        return this.carRepository.save(car);
    }

    async findAll(query: CarsQueryDto): Promise<PaginatedResponseDto<Car>> {
        const { slug, make, model, yearMin, yearMax, priceMin, priceMax, page = 1, limit = 10 } = query;

        if (slug) {
            const car = await this.carRepository.findOne({ where: { slug } });
            return new PaginatedResponseDto(car ? [car] : [], car ? 1 : 0, 1, 1);
        }

        const skip = (page - 1) * limit;
        const qb = this.carRepository.createQueryBuilder('car');

        if (make) {
            qb.andWhere('LOWER(car.make) LIKE LOWER(:make)', { make: `%${make}%` });
        }
        if (model) {
            qb.andWhere('LOWER(car.model) LIKE LOWER(:model)', { model: `%${model}%` });
        }
        if (yearMin != null) {
            qb.andWhere('car.year >= :yearMin', { yearMin });
        }
        if (yearMax != null) {
            qb.andWhere('car.year <= :yearMax', { yearMax });
        }
        if (priceMin != null) {
            qb.andWhere('car.price >= :priceMin', { priceMin });
        }
        if (priceMax != null) {
            qb.andWhere('car.price <= :priceMax', { priceMax });
        }

        qb.orderBy('car.createdAt', 'DESC');
        qb.skip(skip).take(limit);

        const [cars, total] = await qb.getManyAndCount();
        return new PaginatedResponseDto(cars, total, page, limit);
    }
}
