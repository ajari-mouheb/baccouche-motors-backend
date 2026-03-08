import {
  BadRequestException,
  Controller,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTestDriveDto } from '../dto/create-test-drive.dto';
import { CreateTestDriveGuestDto } from '../dto/create-test-drive-guest.dto';
import { UpdateTestDriveStatusDto } from '../dto/update-test-drive.dto';
import { TestDrivesService } from './test-drives.service';
import { PATTERNS } from '@app/shared';

@Controller()
export class TestDrivesController {
  constructor(private readonly testDriveService: TestDrivesService) {}

  @MessagePattern(PATTERNS.TEST_DRIVES_SCHEDULE)
  async schedule(@Payload() payload: Record<string, unknown>) {
    const hasGuestFields =
      payload.name && payload.email && payload.phone && payload.model &&
      payload.preferredDate && payload.timeSlot;
    const hasAuthFields = payload.carId && payload.scheduledAt;

    if (hasGuestFields && !hasAuthFields) {
      const dto = plainToInstance(CreateTestDriveGuestDto, payload);
      const errors = await validate(dto);
      if (errors.length > 0) {
        throw new BadRequestException(errors.flatMap((e) => Object.values(e.constraints || {})));
      }
      return this.testDriveService.scheduleTestDriveGuest(dto);
    }

    if (hasAuthFields) {
      if (!payload.user) {
        throw new BadRequestException('Authentication required for this request');
      }
      const dto = plainToInstance(CreateTestDriveDto, payload);
      const errors = await validate(dto);
      if (errors.length > 0) {
        throw new BadRequestException(errors.flatMap((e) => Object.values(e.constraints || {})));
      }
      return this.testDriveService.scheduleTestDrive(payload.user as any, dto);
    }

    throw new BadRequestException(
      'Invalid payload: provide either (name, phone, email, model, preferredDate, timeSlot) for guest or (carId, scheduledAt, user) for authenticated',
    );
  }

  @MessagePattern(PATTERNS.TEST_DRIVES_FIND_ALL)
  async list(@Payload() payload: { page?: number; limit?: number; userId?: string; userEmail?: string; isAdmin?: boolean }) {
    const page = payload.page ?? 1;
    const limit = payload.limit ?? 10;

    if (payload.isAdmin) {
      return this.testDriveService.findAll(page, limit);
    }
    if (payload.userId && payload.userEmail) {
      return this.testDriveService.findForUser(payload.userId, payload.userEmail, page, limit);
    }
    return this.testDriveService.findAll(page, limit);
  }

  @MessagePattern(PATTERNS.TEST_DRIVES_GET_STATS)
  getStats() {
    return this.testDriveService.getStats();
  }

  @MessagePattern(PATTERNS.TEST_DRIVES_FIND_BY_ID)
  async getById(@Payload() payload: { id: string; user: { id: string; email: string; role: string } }) {
    return this.testDriveService.findByIdWithAuth(payload.id, payload.user);
  }

  @MessagePattern(PATTERNS.TEST_DRIVES_UPDATE_STATUS)
  updateStatus(
    @Payload() payload: { id: string; dto: UpdateTestDriveStatusDto; user: { id: string; email: string; role: string } },
  ) {
    return this.testDriveService.updateStatus(payload.id, payload.dto, payload.user);
  }

  @MessagePattern(PATTERNS.TEST_DRIVES_DELETE)
  cancel(@Payload() payload: { id: string; user: { id: string; email: string; role: string } }) {
    return this.testDriveService.delete(payload.id, payload.user);
  }
}
