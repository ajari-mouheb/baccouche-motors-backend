import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../entities/contact.entity';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';
import { EVENT_PATTERNS } from '@app/shared';

@Injectable()
export class ContactsService implements OnModuleInit {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @Inject('EVENTS_CLIENT') private readonly eventsClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.eventsClient.connect();
  }

  async create(dto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      subject: dto.subject,
      message: dto.message,
    });
    const saved = await this.contactRepository.save(contact);
    this.eventsClient.emit(EVENT_PATTERNS.CONTACT_CREATED, {
      id: saved.id,
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
    });
    return saved;
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResponseDto<Contact>> {
    const skip = (page - 1) * limit;
    const [items, total] = await this.contactRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return new PaginatedResponseDto(items, total, page, limit);
  }

  async findById(id: string): Promise<Contact | null> {
    return this.contactRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateContactDto): Promise<Contact> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) throw new NotFoundException('Contact not found');
    if (dto.read !== undefined) contact.read = dto.read;
    const saved = await this.contactRepository.save(contact);
    this.eventsClient.emit(EVENT_PATTERNS.CONTACT_UPDATED, { id });
    return saved;
  }

  async delete(id: string): Promise<void> {
    const result = await this.contactRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Contact not found');
  }

  async getStats(): Promise<{ unread: number }> {
    const unread = await this.contactRepository.count({
      where: { read: false },
    });
    return { unread };
  }
}
