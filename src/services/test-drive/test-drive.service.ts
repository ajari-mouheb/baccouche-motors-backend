import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TestDrive,
  TestDriveStatus,
} from 'src/entities/test-drive.entity';
import { Car, CarStatus } from 'src/entities/car.entity';
import { User, UserRole } from 'src/entities/user.entity';
import {
  CreateTestDriveDto,
  CreateTestDriveResponseDto,
} from 'src/dto/create-test-drive.dto';
import {
  UpdateTestDriveStatusDto,
  UpdateTestDriveStatusResponseDto,
} from 'src/dto/update-test-drive.dto';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';

@Injectable()
export class TestDriveService {
  constructor(
    @InjectRepository(TestDrive)
    private readonly testDriveRepository: Repository<TestDrive>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  async scheduleTestDrive(
    user: User,
    dto: CreateTestDriveDto,
  ): Promise<CreateTestDriveResponseDto> {
    const car = await this.carRepository.findOne({
      where: { id: dto.carId },
    });
    if (!car) {
      throw new NotFoundException('Car not found');
    }
    if (car.status === CarStatus.SOLD) {
      throw new BadRequestException(
        'Cannot schedule a test drive for a sold car',
      );
    }

    const scheduledAt = new Date(dto.scheduledAt);
    if (isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      throw new BadRequestException(
        'scheduledAt must be a valid future date',
      );
    }

    const testDrive = this.testDriveRepository.create({
      userId: user.id,
      carId: car.id,
      scheduledAt,
      notes: dto.notes ?? null,
    });
    await this.testDriveRepository.save(testDrive);

    return {
      message: 'Test drive scheduled successfully',
      success: true,
      testDrive,
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateTestDriveStatusDto,
    currentUser: User,
  ): Promise<UpdateTestDriveStatusResponseDto> {
    const testDrive = await this.testDriveRepository.findOne({
      where: { id },
    });
    if (!testDrive) {
      throw new NotFoundException('Test drive not found');
    }

    const isStaffOrAdmin =
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.STAFF;
    const isOwner = testDrive.userId === currentUser.id;

    if (!isStaffOrAdmin) {
      // Non staff/admin users can only cancel their own pending test drives
      if (
        !isOwner ||
        dto.status !== TestDriveStatus.CANCELLED ||
        testDrive.status !== TestDriveStatus.PENDING
      ) {
        throw new ForbiddenException(
          'You are not allowed to change this test drive',
        );
      }
    }

    if (
      testDrive.status === TestDriveStatus.COMPLETED ||
      testDrive.status === TestDriveStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot modify a completed or cancelled test drive',
      );
    }

    if (
      testDrive.status === TestDriveStatus.PENDING &&
      dto.status === TestDriveStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Test drive must be confirmed before completion',
      );
    }

    testDrive.status = dto.status;
    const saved = await this.testDriveRepository.save(testDrive);

    return {
      message: 'Test drive status updated successfully',
      success: true,
      testDrive: saved,
    };
  }

  async findById(id: string): Promise<TestDrive | null> {
    return this.testDriveRepository.findOne({
      where: { id },
      relations: ['car', 'user'],
    });
  }

  async findForUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<TestDrive>> {
    const skip = (page - 1) * limit;
    const [items, total] = await this.testDriveRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { scheduledAt: 'DESC' },
      relations: ['car'],
    });
    return new PaginatedResponseDto(items, total, page, limit);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<TestDrive>> {
    const skip = (page - 1) * limit;
    const [items, total] = await this.testDriveRepository.findAndCount({
      skip,
      take: limit,
      order: { scheduledAt: 'DESC' },
      relations: ['car', 'user'],
    });
    return new PaginatedResponseDto(items, total, page, limit);
  }
}

