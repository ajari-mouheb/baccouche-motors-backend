import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_PATTERNS } from '@app/shared';
import { AdminService } from './admin.service';

@Controller()
export class AdminEventsHandler {
  constructor(private readonly adminService: AdminService) {}

  @EventPattern(EVENT_PATTERNS.CAR_CREATED)
  handleCarCreated() {
    this.adminService.updateFromEvent(EVENT_PATTERNS.CAR_CREATED, {});
  }

  @EventPattern(EVENT_PATTERNS.CAR_DELETED)
  handleCarDeleted() {
    this.adminService.updateFromEvent(EVENT_PATTERNS.CAR_DELETED, {});
  }

  @EventPattern(EVENT_PATTERNS.NEWS_CREATED)
  handleNewsCreated() {
    this.adminService.updateFromEvent(EVENT_PATTERNS.NEWS_CREATED, {});
  }

  @EventPattern(EVENT_PATTERNS.NEWS_DELETED)
  handleNewsDeleted() {
    this.adminService.updateFromEvent(EVENT_PATTERNS.NEWS_DELETED, {});
  }

  @EventPattern(EVENT_PATTERNS.TEST_DRIVE_CREATED)
  handleTestDriveCreated() {
    this.adminService.updateFromEvent(EVENT_PATTERNS.TEST_DRIVE_CREATED, {});
  }

  @EventPattern(EVENT_PATTERNS.TEST_DRIVE_STATUS_CHANGED)
  handleTestDriveStatusChanged() {
    this.adminService.updateFromEvent(EVENT_PATTERNS.TEST_DRIVE_STATUS_CHANGED, {});
  }

  @EventPattern(EVENT_PATTERNS.CONTACT_CREATED)
  handleContactCreated() {
    this.adminService.updateFromEvent(EVENT_PATTERNS.CONTACT_CREATED, {});
  }

  @EventPattern(EVENT_PATTERNS.CONTACT_UPDATED)
  handleContactUpdated() {
    this.adminService.updateFromEvent(EVENT_PATTERNS.CONTACT_UPDATED, {});
  }
}
