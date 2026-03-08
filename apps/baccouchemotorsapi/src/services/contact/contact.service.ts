import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from 'src/email/email.service';
import { CreateContactDto } from 'src/dto/create-contact.dto';
import { UpdateContactDto } from 'src/dto/update-contact.dto';
import { Contact } from 'src/entities/contact.entity';
import { PaginatedResponseDto } from 'src/dto/paginated-response.dto';
import { PaginationDto } from 'src/dto/pagination.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      subject: dto.subject,
      message: dto.message,
    });
    const saved = await this.contactRepository.save(contact);
    await this.emailService.sendContactConfirmationEmail(dto.name, dto.email, dto.subject);
    return saved;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto<Contact>> {
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
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    if (dto.read !== undefined) contact.read = dto.read;
    return this.contactRepository.save(contact);
  }

  async delete(id: string): Promise<void> {
    const result = await this.contactRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Contact not found');
    }
  }
}
