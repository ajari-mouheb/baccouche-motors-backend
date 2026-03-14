import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from '../entities/car.entity';
import { CreateCarDto, UpdateCarDto, CarsQueryDto, PaginatedResponseDto } from '@app/shared';
import { EVENT_PATTERNS } from '@app/shared';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @Inject('EVENTS_CLIENT') private readonly eventsClient: ClientProxy,
  ) {}

  async createCar(carData: CreateCarDto) {
    const slug =
      carData.slug ||
      `${slugify(carData.make)}-${slugify(carData.model)}-${carData.year}`;
    let existing = await this.carRepository.findOne({ where: { slug } });
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
    const saved = await this.carRepository.save(car);
    this.eventsClient.emit(EVENT_PATTERNS.CAR_CREATED, { id: saved.id });
    return { message: 'Car created successfully', car: saved, success: true };
  }

  async updateCar(id: string, carData: UpdateCarDto) {
    const car = await this.carRepository.findOne({ where: { id } });
    if (!car) throw new NotFoundException('Car not found');
    Object.assign(car, carData);
    const saved = await this.carRepository.save(car);
    this.eventsClient.emit(EVENT_PATTERNS.CAR_UPDATED, { id });
    return { message: 'Car updated successfully', car: saved, success: true };
  }

  async deleteCar(id: string) {
    const result = await this.carRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Car not found');
    this.eventsClient.emit(EVENT_PATTERNS.CAR_DELETED, { id });
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
    if (!car) throw new NotFoundException('Car not found');
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

    if (make) qb.andWhere('LOWER(car.make) LIKE LOWER(:make)', { make: `%${make}%` });
    if (model) qb.andWhere('LOWER(car.model) LIKE LOWER(:model)', { model: `%${model}%` });
    if (yearMin != null) qb.andWhere('car.year >= :yearMin', { yearMin });
    if (yearMax != null) qb.andWhere('car.year <= :yearMax', { yearMax });
    if (priceMin != null) qb.andWhere('car.price >= :priceMin', { priceMin });
    if (priceMax != null) qb.andWhere('car.price <= :priceMax', { priceMax });

    qb.orderBy('car.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [cars, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(cars, total, page, limit);
  }

  async getStats(): Promise<{ total: number }> {
    const total = await this.carRepository.count();
    return { total };
  }
}
