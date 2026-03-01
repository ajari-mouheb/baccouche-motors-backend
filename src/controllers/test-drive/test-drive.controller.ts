import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateTestDriveDto, CreateTestDriveResponseDto } from 'src/dto/create-test-drive.dto';
import { UpdateTestDriveStatusDto, UpdateTestDriveStatusResponseDto } from 'src/dto/update-test-drive.dto';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { TestDrive } from 'src/entities/test-drive.entity';
import { User, UserRole } from 'src/entities/user.entity';
import { TestDriveService } from 'src/services/test-drive/test-drive.service';

@Controller('test-drive')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TestDriveController {
  constructor(private readonly testDriveService: TestDriveService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Test drive scheduled successfully',
    type: CreateTestDriveResponseDto,
  })
  schedule(
    @Body() dto: CreateTestDriveDto,
    @Req() req: Request & { user: User },
  ): Promise<CreateTestDriveResponseDto> {
    return this.testDriveService.scheduleTestDrive(req.user, dto);
  }

  @Get('my')
  @ApiResponse({
    status: 200,
    description: 'Paginated list of current user test drives',
  })
  getMyTestDrives(
    @Query() pagination: PaginationDto,
    @Req() req: Request & { user: User },
  ): Promise<PaginatedResponseDto<TestDrive>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    return this.testDriveService.findForUser(req.user.id, page, limit);
  }

  @Get('all')
  @ApiResponse({
    status: 200,
    description: 'Paginated list of all test drives (admin/staff only)',
  })
  async getAllTestDrives(
    @Query() pagination: PaginationDto,
    @Req() req: Request & { user: User },
  ): Promise<PaginatedResponseDto<TestDrive>> {
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.STAFF
    ) {
      throw new ForbiddenException('Only staff or admin can view all test drives');
    }
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    return this.testDriveService.findAll(page, limit);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Test drive found by ID',
  })
  async getById(@Param('id') id: string) {
    const testDrive = await this.testDriveService.findById(id);
    if (!testDrive) {
      return { success: false, message: 'Test drive not found' };
    }
    return { success: true, testDrive };
  }

  @Put(':id/status')
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
}

