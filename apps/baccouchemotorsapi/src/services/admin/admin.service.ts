import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from 'src/entities/car.entity';
import { Contact } from 'src/entities/contact.entity';
import { News } from 'src/entities/news.entity';
import { TestDrive, TestDriveStatus } from 'src/entities/test-drive.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(TestDrive)
    private readonly testDriveRepository: Repository<TestDrive>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
  ) {}

  async getDashboardStats() {
    const [carsTotal, pendingTestDrives, unreadContacts, newsTotal] =
      await Promise.all([
        this.carRepository.count(),
        this.testDriveRepository.count({
          where: { status: TestDriveStatus.PENDING },
        }),
        this.contactRepository.count({
          where: { read: false },
        }),
        this.newsRepository.count(),
      ]);

    return {
      cars: carsTotal,
      pendingTestDrives,
      unreadContacts,
      news: newsTotal,
    };
  }
}
