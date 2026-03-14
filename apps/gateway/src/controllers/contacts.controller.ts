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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  GatewayRolesGuard,
  Roles,
  UserRole,
  PATTERNS,
  CreateContactDto,
  UpdateContactDto,
  PaginationDto,
} from '@app/shared';

@ApiTags('Contacts')
@Controller('api/contacts')
export class ContactsController {
  constructor(
    @Inject('CONTACTS_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create contact (emits contact.created event)' })
  @ApiResponse({ status: 201, description: 'Contact created' })
  create(@Body() dto: CreateContactDto) {
    return firstValueFrom(this.client.send(PATTERNS.CONTACTS_CREATE, dto));
  }

  @Get()
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List contacts (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Paginated list of contacts' })
  list(@Query() query: PaginationDto) {
    return firstValueFrom(
      this.client.send(PATTERNS.CONTACTS_FIND_ALL, {
        page: query.page,
        limit: query.limit,
      }),
    );
  }

  @Get('stats')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contact statistics' })
  @ApiResponse({ status: 200, description: 'Contact stats' })
  getStats() {
    return firstValueFrom(this.client.send(PATTERNS.CONTACTS_GET_STATS, {}));
  }

  @Get(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Contact details' })
  getById(@Param('id') id: string) {
    return firstValueFrom(this.client.send(PATTERNS.CONTACTS_FIND_BY_ID, { id }));
  }

  @Patch(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact (emits contact.updated event)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Contact updated' })
  update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return firstValueFrom(this.client.send(PATTERNS.CONTACTS_UPDATE, { id, ...dto }));
  }

  @Delete(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete contact' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Contact deleted' })
  delete(@Param('id') id: string) {
    return firstValueFrom(this.client.send(PATTERNS.CONTACTS_DELETE, { id }));
  }
}
