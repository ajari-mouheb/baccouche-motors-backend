import {
  Controller,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateContactDto, UpdateContactDto } from '@app/shared';
import { ContactsService } from './contacts.service';
import { PATTERNS } from '@app/shared';

@Controller()
export class ContactsController {
  constructor(private readonly contactService: ContactsService) {}

  @MessagePattern(PATTERNS.CONTACTS_CREATE)
  create(@Payload() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @MessagePattern(PATTERNS.CONTACTS_FIND_ALL)
  async list(@Payload() payload: { page?: number; limit?: number }) {
    const page = payload.page ?? 1;
    const limit = payload.limit ?? 10;
    return this.contactService.findAll(page, limit);
  }

  @MessagePattern(PATTERNS.CONTACTS_GET_STATS)
  getStats() {
    return this.contactService.getStats();
  }

  @MessagePattern(PATTERNS.CONTACTS_FIND_BY_ID)
  async getById(@Payload() payload: { id: string }) {
    const contact = await this.contactService.findById(payload.id);
    if (!contact) return { success: false, message: 'Contact not found' };
    return { success: true, contact };
  }

  @MessagePattern(PATTERNS.CONTACTS_UPDATE)
  update(@Payload() payload: { id: string } & UpdateContactDto) {
    const { id, ...dto } = payload;
    return this.contactService.update(id, dto);
  }

  @MessagePattern(PATTERNS.CONTACTS_DELETE)
  async delete(@Payload() payload: { id: string }) {
    await this.contactService.delete(payload.id);
    return { success: true, message: 'Contact deleted' };
  }
}
