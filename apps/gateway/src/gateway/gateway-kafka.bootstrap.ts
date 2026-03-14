import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PATTERNS } from '@app/shared';

@Injectable()
export class GatewayKafkaBootstrap implements OnModuleInit {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
    @Inject('CARS_SERVICE') private readonly carsClient: ClientKafka,
    @Inject('NEWS_SERVICE') private readonly newsClient: ClientKafka,
    @Inject('TEST_DRIVES_SERVICE') private readonly testDrivesClient: ClientKafka,
    @Inject('CONTACTS_SERVICE') private readonly contactsClient: ClientKafka,
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const authPatterns = [
      PATTERNS.AUTH_REGISTER,
      PATTERNS.AUTH_LOGIN,
      PATTERNS.AUTH_LOGOUT,
      PATTERNS.AUTH_ME,
      PATTERNS.AUTH_FORGOT_PASSWORD,
      PATTERNS.AUTH_RESET_PASSWORD,
      PATTERNS.CUSTOMERS_ME,
      PATTERNS.CUSTOMERS_UPDATE_ME,
      PATTERNS.CUSTOMERS_CHANGE_PASSWORD,
    ];
    authPatterns.forEach((p) => this.authClient.subscribeToResponseOf(p));
    await this.authClient.connect();

    const carsPatterns = [
      PATTERNS.CARS_FIND_ALL,
      PATTERNS.CARS_GET_STATS,
      PATTERNS.CARS_FIND_BY_SLUG,
      PATTERNS.CARS_FIND_BY_ID,
      PATTERNS.CARS_CREATE,
      PATTERNS.CARS_UPDATE,
      PATTERNS.CARS_DELETE,
      PATTERNS.CARS_UPLOAD_IMAGE,
    ];
    carsPatterns.forEach((p) => this.carsClient.subscribeToResponseOf(p));
    await this.carsClient.connect();

    const newsPatterns = [
      PATTERNS.NEWS_FIND_ALL,
      PATTERNS.NEWS_GET_STATS,
      PATTERNS.NEWS_FIND_BY_SLUG,
      PATTERNS.NEWS_FIND_BY_ID,
      PATTERNS.NEWS_CREATE,
      PATTERNS.NEWS_UPDATE,
      PATTERNS.NEWS_DELETE,
      PATTERNS.NEWS_UPLOAD_IMAGE,
    ];
    newsPatterns.forEach((p) => this.newsClient.subscribeToResponseOf(p));
    await this.newsClient.connect();

    const testDrivesPatterns = [
      PATTERNS.TEST_DRIVES_SCHEDULE,
      PATTERNS.TEST_DRIVES_FIND_ALL,
      PATTERNS.TEST_DRIVES_GET_STATS,
      PATTERNS.TEST_DRIVES_FIND_BY_ID,
      PATTERNS.TEST_DRIVES_UPDATE_STATUS,
      PATTERNS.TEST_DRIVES_DELETE,
    ];
    testDrivesPatterns.forEach((p) => this.testDrivesClient.subscribeToResponseOf(p));
    await this.testDrivesClient.connect();

    const contactsPatterns = [
      PATTERNS.CONTACTS_CREATE,
      PATTERNS.CONTACTS_FIND_ALL,
      PATTERNS.CONTACTS_GET_STATS,
      PATTERNS.CONTACTS_FIND_BY_ID,
      PATTERNS.CONTACTS_UPDATE,
      PATTERNS.CONTACTS_DELETE,
    ];
    contactsPatterns.forEach((p) => this.contactsClient.subscribeToResponseOf(p));
    await this.contactsClient.connect();

    this.adminClient.subscribeToResponseOf(PATTERNS.ADMIN_GET_DASHBOARD);
    await this.adminClient.connect();
  }
}
