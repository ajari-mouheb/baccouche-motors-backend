import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateContactDto } from 'src/dto/create-contact.dto';
import { UpdateContactDto } from 'src/dto/update-contact.dto';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { Contact } from 'src/entities/contact.entity';
import { UserRole } from 'src/entities/user.entity';
import { ContactService } from 'src/services/contact/contact.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiResponse({ status: 201, description: 'Contact message submitted' })
  create(@Body() dto: CreateContactDto): Promise<Contact> {
    return this.contactService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'List all contacts (admin)' })
  async list(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Contact>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    return this.contactService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Get contact by ID (admin)' })
  async getById(@Param('id') id: string) {
    const contact = await this.contactService.findById(id);
    if (!contact) {
      return { success: false, message: 'Contact not found' };
    }
    return { success: true, contact };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Update contact (e.g. mark read)' })
  update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Delete contact (admin)' })
  async delete(@Param('id') id: string) {
    await this.contactService.delete(id);
    return { success: true, message: 'Contact deleted' };
  }
}
