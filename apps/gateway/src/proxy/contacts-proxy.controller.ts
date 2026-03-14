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
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GatewayAuthGuard, GatewayRolesGuard, Roles, UserRole } from '@app/shared';
import { PATTERNS } from '@app/shared';

@Controller('api/contacts')
export class ContactsProxyController {
  constructor(
    @Inject('CONTACTS_SERVICE') private readonly client: ClientKafka,
  ) {}

  @Post()
  create(@Body() dto: unknown) {
    return firstValueFrom(this.client.send(PATTERNS.CONTACTS_CREATE, dto));
  }

  @Get()
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  list(@Query() query: Record<string, unknown>) {
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
  getStats() {
    return firstValueFrom(this.client.send(PATTERNS.CONTACTS_GET_STATS, {}));
  }

  @Get(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getById(@Param('id') id: string) {
    return firstValueFrom(this.client.send(PATTERNS.CONTACTS_FIND_BY_ID, { id }));
  }

  @Patch(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  update(@Param('id') id: string, @Body() dto: unknown) {
    return firstValueFrom(this.client.send(PATTERNS.CONTACTS_UPDATE, { id, ...dto as object }));
  }

  @Delete(':id')
  @UseGuards(GatewayAuthGuard, GatewayRolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  delete(@Param('id') id: string) {
    return firstValueFrom(this.client.send(PATTERNS.CONTACTS_DELETE, { id }));
  }
}
