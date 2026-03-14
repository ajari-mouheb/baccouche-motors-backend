import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from 'src/email/email.service';
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
import { CreateTestDriveGuestDto } from 'src/dto/create-test-drive-guest.dto';
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
    private readonly emailService: EmailService,
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

    const scheduledDate = new Date(dto.scheduledAt);
    const timeSlot = scheduledDate.getHours() < 12 ? 'morning' : 'afternoon';
    await this.emailService.sendTestDriveConfirmationEmail(
      user.email,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client',
      car.model,
      scheduledDate.toLocaleDateString('fr-FR'),
      timeSlot,
    );

    return {
      message: 'Test drive scheduled successfully',
      success: true,
      testDrive,
    };
  }

  async scheduleTestDriveGuest(
    dto: CreateTestDriveGuestDto,
  ): Promise<CreateTestDriveResponseDto> {
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
    await this.testDriveRepository.save(testDrive);

    await this.emailService.sendTestDriveConfirmationEmail(
      dto.email,
      dto.name,
      dto.model,
      dto.preferredDate,
      dto.timeSlot,
    );

    return {
      message: 'Test drive request submitted successfully',
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
      relations: ['car', 'user'],
    });
    if (!testDrive) {
      throw new NotFoundException('Test drive not found');
    }

    const isStaffOrAdmin =
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.STAFF;
    const isOwner =
      testDrive.userId === currentUser.id ||
      (testDrive.userId === null &&
        testDrive.email?.toLowerCase() === currentUser.email.toLowerCase());

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
      testDrive.status === TestDriveStatus.CANCELLED ||
      testDrive.status === TestDriveStatus.REJECTED
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

    const notifyEmail = testDrive.email ?? (testDrive.user as User | null)?.email ?? null;
    let notifyName = testDrive.name;
    if (!notifyName && testDrive.user) {
      const u = testDrive.user as User;
      notifyName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Client';
    }
    notifyName = notifyName ?? 'Client';
    const model = testDrive.car?.model ?? testDrive.model ?? 'véhicule';
    if (
      notifyEmail &&
      (dto.status === TestDriveStatus.CONFIRMED ||
        dto.status === TestDriveStatus.COMPLETED ||
        dto.status === TestDriveStatus.REJECTED)
    ) {
      await this.emailService.sendTestDriveStatusChangeEmail(
        notifyEmail,
        notifyName,
        model,
        dto.status,
      );
    }

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

  async delete(id: string, currentUser: User): Promise<{ success: boolean; message: string }> {
    const testDrive = await this.testDriveRepository.findOne({
      where: { id },
    });
    if (!testDrive) {
      throw new NotFoundException('Test drive not found');
    }
    const isStaffOrAdmin =
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.STAFF;
    const isOwner =
      testDrive.userId === currentUser.id ||
      (testDrive.userId === null &&
        testDrive.email?.toLowerCase() === currentUser.email.toLowerCase());

    if (!isStaffOrAdmin && (!isOwner || testDrive.status !== TestDriveStatus.PENDING)) {
      throw new ForbiddenException(
        'You can only cancel your own pending test drives',
      );
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
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<TestDrive>> {
    const skip = (page - 1) * limit;
    const qb = this.testDriveRepository.createQueryBuilder('td');
    qb.leftJoinAndSelect('td.car', 'car');
    qb.where('td.userId = :userId OR (td.userId IS NULL AND LOWER(td.email) = LOWER(:email))', {
      userId,
      email: userEmail,
    });
    qb.orderBy('COALESCE(td.scheduledAt, td.preferredDate)', 'DESC');
    qb.skip(skip).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(items, total, page, limit);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<TestDrive>> {
    const skip = (page - 1) * limit;
    const qb = this.testDriveRepository.createQueryBuilder('td');
    qb.leftJoinAndSelect('td.car', 'car');
    qb.leftJoinAndSelect('td.user', 'user');
    qb.orderBy('COALESCE(td.scheduledAt, td.preferredDate, td.createdAt)', 'DESC');
    qb.skip(skip).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(items, total, page, limit);
  }
}

