import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtOptionalGuard } from 'src/auth/jwt-optional.guard';
import { CreateTestDriveDto, CreateTestDriveResponseDto } from 'src/dto/create-test-drive.dto';
import { CreateTestDriveGuestDto } from 'src/dto/create-test-drive-guest.dto';
import {
  UpdateTestDriveStatusDto,
  UpdateTestDriveStatusResponseDto,
} from 'src/dto/update-test-drive.dto';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { TestDrive } from 'src/entities/test-drive.entity';
import { User, UserRole } from 'src/entities/user.entity';
import { TestDriveService } from 'src/services/test-drive/test-drive.service';

@Controller('test-drives')
export class TestDrivesController {
  constructor(private readonly testDriveService: TestDriveService) {}

  @Post()
  @UseGuards(JwtOptionalGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiResponse({
    status: 201,
    description: 'Test drive request submitted successfully',
    type: CreateTestDriveResponseDto,
  })
  async create(
    @Body() body: Record<string, unknown>,
    @Req() req: Request & { user?: User },
  ): Promise<CreateTestDriveResponseDto> {
    const hasGuestFields =
      body.name && body.email && body.phone && body.model && body.preferredDate && body.timeSlot;
    const hasAuthFields = body.carId && body.scheduledAt;

    if (hasGuestFields && !hasAuthFields) {
      const dto = plainToInstance(CreateTestDriveGuestDto, body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        throw new BadRequestException(
          errors.flatMap((e) => Object.values(e.constraints || {})),
        );
      }
      return this.testDriveService.scheduleTestDriveGuest(dto);
    }

    if (hasAuthFields) {
      if (!req.user) {
        throw new ForbiddenException('Authentication required for this request');
      }
      const dto = plainToInstance(CreateTestDriveDto, body);
      const errors = await validate(dto);
      if (errors.length > 0) {
        throw new BadRequestException(
          errors.flatMap((e) => Object.values(e.constraints || {})),
        );
      }
      return this.testDriveService.scheduleTestDrive(req.user, dto);
    }

    throw new BadRequestException(
      'Invalid payload: provide either (name, phone, email, model, preferredDate, timeSlot) for guest requests or (carId, scheduledAt) for authenticated requests',
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'List test drives (admin: all, customer: own)',
  })
  async list(
    @Query() pagination: PaginationDto,
    @Req() req: Request & { user: User },
  ): Promise<PaginatedResponseDto<TestDrive>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;

    if (
      req.user.role === UserRole.ADMIN ||
      req.user.role === UserRole.STAFF
    ) {
      return this.testDriveService.findAll(page, limit);
    }
    return this.testDriveService.findForUser(req.user.id, req.user.email, page, limit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Test drive found by ID' })
  async getById(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
  ) {
    const testDrive = await this.testDriveService.findById(id);
    if (!testDrive) {
      return { success: false, message: 'Test drive not found' };
    }
    const isStaffOrAdmin =
      req.user.role === UserRole.ADMIN || req.user.role === UserRole.STAFF;
    const isOwner =
      testDrive.userId === req.user.id ||
      (testDrive.userId === null &&
        testDrive.email?.toLowerCase() === req.user.email.toLowerCase());
    if (!isStaffOrAdmin && !isOwner) {
      throw new ForbiddenException('You cannot view this test drive');
    }
    return { success: true, testDrive };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Test drive status updated',
    type: UpdateTestDriveStatusResponseDto,
  })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTestDriveStatusDto,
    @Req() req: Request & { user: User },
  ): Promise<UpdateTestDriveStatusResponseDto> {
    return this.testDriveService.updateStatus(id, dto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Test drive cancelled' })
  async cancel(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
  ) {
    return this.testDriveService.delete(id, req.user);
  }
}
