export const EXCHANGE = 'baccouche.events';

/** @deprecated Use EVENT_PATTERNS for Kafka */
export const ROUTING_KEYS = {
  AUTH_FORGOT_PASSWORD: 'auth.forgot-password-requested',
  TEST_DRIVE_CREATED: 'test-drive.created',
  TEST_DRIVE_STATUS_CHANGED: 'test-drive.status-changed',
  CONTACT_CREATED: 'contact.created',
  CONTACT_UPDATED: 'contact.updated',
  CAR_CREATED: 'car.created',
  CAR_UPDATED: 'car.updated',
  CAR_DELETED: 'car.deleted',
  NEWS_CREATED: 'news.created',
  NEWS_UPDATED: 'news.updated',
  NEWS_DELETED: 'news.deleted',
} as const;

/** Event patterns for @EventPattern (fire-and-forget to baccouche.events topic) */
export const EVENT_PATTERNS = {
  AUTH_FORGOT_PASSWORD_REQUESTED: 'auth.forgot-password-requested',
  TEST_DRIVE_CREATED: 'test-drive.created',
  TEST_DRIVE_STATUS_CHANGED: 'test-drive.status-changed',
  CONTACT_CREATED: 'contact.created',
  CONTACT_UPDATED: 'contact.updated',
  CAR_CREATED: 'car.created',
  CAR_UPDATED: 'car.updated',
  CAR_DELETED: 'car.deleted',
  NEWS_CREATED: 'news.created',
  NEWS_UPDATED: 'news.updated',
  NEWS_DELETED: 'news.deleted',
} as const;

/** Kafka topic names */
export const KAFKA_TOPICS = {
  AUTH: 'auth',
  CARS: 'cars',
  NEWS: 'news',
  TEST_DRIVES: 'test-drives',
  CONTACTS: 'contacts',
  ADMIN: 'admin',
  EVENTS: 'baccouche.events',
} as const;

export interface ForgotPasswordEvent {
  email: string;
  resetToken: string;
  resetLink: string;
}

export interface TestDriveCreatedEvent {
  id: string;
  email: string;
  name: string;
  model: string;
  preferredDate: string;
  timeSlot: string;
}

export interface TestDriveStatusChangedEvent {
  id: string;
  email: string;
  name: string;
  model: string;
  status: string;
}

export interface ContactCreatedEvent {
  id: string;
  name: string;
  email: string;
  subject: string;
}

export interface CarEvent {
  id: string;
}

export interface NewsEvent {
  id: string;
}
