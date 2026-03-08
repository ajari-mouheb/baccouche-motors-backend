import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EVENT_PATTERNS, PATTERNS } from '@app/shared';

@Injectable()
export class AdminService implements OnModuleInit {
  private stats = {
    cars: 0,
    pendingTestDrives: 0,
    unreadContacts: 0,
    news: 0,
  };

  constructor(
    @Inject('CARS_SERVICE') private readonly carsClient: ClientKafka,
    @Inject('NEWS_SERVICE') private readonly newsClient: ClientKafka,
    @Inject('TEST_DRIVES_SERVICE') private readonly testDrivesClient: ClientKafka,
    @Inject('CONTACTS_SERVICE') private readonly contactsClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.carsClient.subscribeToResponseOf(PATTERNS.CARS_GET_STATS);
    this.newsClient.subscribeToResponseOf(PATTERNS.NEWS_GET_STATS);
    this.testDrivesClient.subscribeToResponseOf(PATTERNS.TEST_DRIVES_GET_STATS);
    this.contactsClient.subscribeToResponseOf(PATTERNS.CONTACTS_GET_STATS);
    await this.carsClient.connect();
    await this.newsClient.connect();
    await this.testDrivesClient.connect();
    await this.contactsClient.connect();
    await this.syncStats();
  }

  async syncStats(): Promise<void> {
    try {
      const [carsRes, newsRes, testDrivesRes, contactsRes] = await Promise.allSettled([
        firstValueFrom(this.carsClient.send(PATTERNS.CARS_GET_STATS, {})),
        firstValueFrom(this.newsClient.send(PATTERNS.NEWS_GET_STATS, {})),
        firstValueFrom(this.testDrivesClient.send(PATTERNS.TEST_DRIVES_GET_STATS, {})),
        firstValueFrom(this.contactsClient.send(PATTERNS.CONTACTS_GET_STATS, {})),
      ]);

      if (carsRes.status === 'fulfilled') this.stats.cars = carsRes.value?.total ?? 0;
      if (newsRes.status === 'fulfilled') this.stats.news = newsRes.value?.total ?? 0;
      if (testDrivesRes.status === 'fulfilled')
        this.stats.pendingTestDrives = testDrivesRes.value?.pending ?? 0;
      if (contactsRes.status === 'fulfilled')
        this.stats.unreadContacts = contactsRes.value?.unread ?? 0;
    } catch (err) {
      console.warn('[AdminService] Initial sync failed:', (err as Error).message);
    }
  }

  getDashboardStats() {
    return { ...this.stats };
  }

  updateFromEvent(pattern: string, _payload: unknown): void {
    if (pattern === EVENT_PATTERNS.CAR_CREATED) this.stats.cars++;
    else if (pattern === EVENT_PATTERNS.CAR_DELETED) this.stats.cars = Math.max(0, this.stats.cars - 1);
    else if (pattern === EVENT_PATTERNS.NEWS_CREATED) this.stats.news++;
    else if (pattern === EVENT_PATTERNS.NEWS_DELETED) this.stats.news = Math.max(0, this.stats.news - 1);
    else if (pattern === EVENT_PATTERNS.TEST_DRIVE_CREATED) this.stats.pendingTestDrives++;
    else if (pattern === EVENT_PATTERNS.TEST_DRIVE_STATUS_CHANGED)
      this.stats.pendingTestDrives = Math.max(0, this.stats.pendingTestDrives - 1);
    else if (pattern === EVENT_PATTERNS.CONTACT_CREATED) this.stats.unreadContacts++;
    else if (pattern === EVENT_PATTERNS.CONTACT_UPDATED)
      this.stats.unreadContacts = Math.max(0, this.stats.unreadContacts - 1);
  }
}
