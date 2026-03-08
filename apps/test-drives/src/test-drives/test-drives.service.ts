import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { TestDrive } from '../entities/test-drive.entity';
import { CreateTestDriveDto } from '../dto/create-test-drive.dto';
import { CreateTestDriveGuestDto } from '../dto/create-test-drive-guest.dto';
import { UpdateTestDriveStatusDto } from '../dto/update-test-drive.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import {
  EVENT_PATTERNS,
  PATTERNS,
  UserRole,
  TestDriveStatus,
} from '@app/shared';

interface GatewayUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class TestDrivesService implements OnModuleInit {
  constructor(
    @InjectRepository(TestDrive)
    private readonly testDriveRepository: Repository<TestDrive>,
    @Inject('CARS_SERVICE') private readonly carsClient: ClientKafka,
    @Inject('EVENTS_CLIENT') private readonly eventsClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.carsClient.subscribeToResponseOf(PATTERNS.CARS_FIND_BY_ID);
    await this.carsClient.connect();
    await this.eventsClient.connect();
  }

  private async getCarById(carId: string): Promise<{ id: string; model: string; status: string } | null> {
    try {
      const res = await firstValueFrom(this.carsClient.send(PATTERNS.CARS_FIND_BY_ID, { id: carId }));
      return res?.car ?? null;
    } catch {
      return null;
    }
  }

  async scheduleTestDrive(user: GatewayUser, dto: CreateTestDriveDto) {
    const car = await this.getCarById(dto.carId);
    if (!car) throw new NotFoundException('Car not found');
    if (car.status === 'sold') {
      throw new BadRequestException('Cannot schedule a test drive for a sold car');
    }

    const scheduledAt = new Date(dto.scheduledAt);
    if (isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      throw new BadRequestException('scheduledAt must be a valid future date');
    }

    const testDrive = this.testDriveRepository.create({
      userId: user.id,
      carId: car.id,
      model: car.model,
      scheduledAt,
      notes: dto.notes ?? null,
      email: user.email,
      status: TestDriveStatus.PENDING,
    });
    const saved = await this.testDriveRepository.save(testDrive);

    const timeSlot = scheduledAt.getHours() < 12 ? 'morning' : 'afternoon';
    this.eventsClient.emit(EVENT_PATTERNS.TEST_DRIVE_CREATED, {
      id: saved.id,
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client',
      model: car.model,
      preferredDate: scheduledAt.toLocaleDateString('fr-FR'),
      timeSlot,
    });

    return { message: 'Test drive scheduled successfully', success: true, testDrive: saved };
  }

  async scheduleTestDriveGuest(dto: CreateTestDriveGuestDto) {
    const preferredDate = new Date(dto.preferredDate);
    if (isNaN(preferredDate.getTime())) {
      throw new BadRequestException('preferredDate must be a valid date');
    }
    const scheduledAt = new Date(dto.preferredDate);
    const hour = dto.timeSlot === 'morning' ? 10 : 14;
    scheduledAt.setHours(hour, 0, 0, 0);

    const testDrive = this.testDriveRepository.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      model: dto.model,
      preferredDate,
      timeSlot: dto.timeSlot,
      scheduledAt,
      status: TestDriveStatus.PENDING,
      userId: null,
      carId: null,
    });
    const saved = await this.testDriveRepository.save(testDrive);

    this.eventsClient.emit(EVENT_PATTERNS.TEST_DRIVE_CREATED, {
      id: saved.id,
      email: dto.email,
      name: dto.name,
      model: dto.model,
      preferredDate: dto.preferredDate,
      timeSlot: dto.timeSlot,
    });

    return { message: 'Test drive request submitted successfully', success: true, testDrive: saved };
  }

  async updateStatus(id: string, dto: UpdateTestDriveStatusDto, currentUser: GatewayUser) {
    const testDrive = await this.testDriveRepository.findOne({ where: { id } });
    if (!testDrive) throw new NotFoundException('Test drive not found');

    const isStaffOrAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.STAFF;
    const isOwner =
      testDrive.userId === currentUser.id ||
      (testDrive.userId === null &&
        testDrive.email?.toLowerCase() === currentUser.email.toLowerCase());

    if (!isStaffOrAdmin) {
      if (
        !isOwner ||
        dto.status !== TestDriveStatus.CANCELLED ||
        testDrive.status !== TestDriveStatus.PENDING
      ) {
        throw new ForbiddenException('You are not allowed to change this test drive');
      }
    }

    if (
      testDrive.status === TestDriveStatus.COMPLETED ||
      testDrive.status === TestDriveStatus.CANCELLED ||
      testDrive.status === TestDriveStatus.REJECTED
    ) {
      throw new BadRequestException('Cannot modify a completed or cancelled test drive');
    }

    if (
      testDrive.status === TestDriveStatus.PENDING &&
      dto.status === TestDriveStatus.COMPLETED
    ) {
      throw new BadRequestException('Test drive must be confirmed before completion');
    }

    testDrive.status = dto.status;
    const saved = await this.testDriveRepository.save(testDrive);

    const notifyEmail = testDrive.email ?? null;
    const notifyName = testDrive.name ?? 'Client';
    const model = testDrive.model ?? 'véhicule';

    if (
      notifyEmail &&
      (dto.status === TestDriveStatus.CONFIRMED ||
        dto.status === TestDriveStatus.COMPLETED ||
        dto.status === TestDriveStatus.REJECTED)
    ) {
      this.eventsClient.emit(EVENT_PATTERNS.TEST_DRIVE_STATUS_CHANGED, {
        id: saved.id,
        email: notifyEmail,
        name: notifyName,
        model,
        status: dto.status,
      });
    }

    return { message: 'Test drive status updated successfully', success: true, testDrive: saved };
  }

  async findById(id: string): Promise<TestDrive | null> {
    return this.testDriveRepository.findOne({ where: { id } });
  }

  async findByIdWithAuth(
    id: string,
    user: { id: string; email: string; role: string },
  ) {
    const testDrive = await this.testDriveRepository.findOne({ where: { id } });
    if (!testDrive) return { success: false, message: 'Test drive not found' };

    const isStaffOrAdmin = user.role === UserRole.ADMIN || user.role === UserRole.STAFF;
    const isOwner =
      testDrive.userId === user.id ||
      (testDrive.userId === null && testDrive.email?.toLowerCase() === user.email.toLowerCase());

    if (!isStaffOrAdmin && !isOwner) {
      throw new BadRequestException('You cannot view this test drive');
    }
    return { success: true, testDrive };
  }

  async delete(id: string, currentUser: GatewayUser) {
    const testDrive = await this.testDriveRepository.findOne({ where: { id } });
    if (!testDrive) throw new NotFoundException('Test drive not found');

    const isStaffOrAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.STAFF;
    const isOwner =
      testDrive.userId === currentUser.id ||
      (testDrive.userId === null &&
        testDrive.email?.toLowerCase() === currentUser.email.toLowerCase());

    if (!isStaffOrAdmin && (!isOwner || testDrive.status !== TestDriveStatus.PENDING)) {
      throw new ForbiddenException('You can only cancel your own pending test drives');
    }

    if (testDrive.status !== TestDriveStatus.PENDING) {
      throw new BadRequestException('Only pending test drives can be cancelled');
    }

    testDrive.status = TestDriveStatus.CANCELLED;
    await this.testDriveRepository.save(testDrive);

    return { success: true, message: 'Test drive cancelled successfully' };
  }

  async findForUser(
    userId: string,
    userEmail: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponseDto<TestDrive>> {
    const skip = (page - 1) * limit;
    const qb = this.testDriveRepository.createQueryBuilder('td');
    qb.where('td.userId = :userId OR (td.userId IS NULL AND LOWER(td.email) = LOWER(:email))', {
      userId,
      email: userEmail,
    });
    qb.orderBy('COALESCE(td.scheduledAt, td.preferredDate)', 'DESC');
    qb.skip(skip).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(items, total, page, limit);
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResponseDto<TestDrive>> {
    const skip = (page - 1) * limit;
    const [items, total] = await this.testDriveRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return new PaginatedResponseDto(items, total, page, limit);
  }

  async getStats(): Promise<{ pending: number }> {
    const pending = await this.testDriveRepository.count({
      where: { status: TestDriveStatus.PENDING },
    });
    return { pending };
  }
}
