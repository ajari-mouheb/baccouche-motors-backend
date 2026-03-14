import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { of, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { GatewayModule } from '../src/gateway.module';
import { RpcExceptionFilter } from '../src/filters/rpc-exception.filter';
import { PATTERNS, UserRole, signJwt } from '@app/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'e2e-test-secret';

export const TEST_USERS = {
  [UserRole.ADMIN]: {
    id: 'admin-uuid',
    email: 'admin@baccouche-motors.com',
    role: UserRole.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
  },
  [UserRole.STAFF]: {
    id: 'staff-uuid',
    email: 'staff@baccouche-motors.com',
    role: UserRole.STAFF,
    firstName: 'Staff',
    lastName: 'User',
  },
  [UserRole.CUSTOMER]: {
    id: 'customer-uuid',
    email: 'customer@baccouche-motors.com',
    role: UserRole.CUSTOMER,
    firstName: 'John',
    lastName: 'Customer',
  },
};

/** Generate a valid JWT for the given role (for use with Authorization header) */
export function getAuthToken(role: UserRole): string {
  const user = TEST_USERS[role];
  return signJwt(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    } as { sub: string; email: string; role?: UserRole; firstName?: string; lastName?: string },
    JWT_SECRET,
    '1h',
  );
}

/** Default mock responses for each RPC pattern */
export const mockResponses: Record<string, unknown> = {
  // Auth
  [PATTERNS.AUTH_REGISTER]: { id: 'new-user-uuid', email: 'new@example.com', firstName: 'New', lastName: 'User', role: UserRole.CUSTOMER },
  [PATTERNS.AUTH_LOGIN]: {
    success: true,
    user: { id: 'user-1', email: 'admin@baccouche-motors.com', firstName: 'Admin', lastName: 'User', role: UserRole.ADMIN },
    auth_token: 'mock-jwt-token',
  },
  [PATTERNS.AUTH_LOGOUT]: { message: 'Logged out successfully' },
  [PATTERNS.AUTH_ME]: { id: 'user-1', email: 'admin@baccouche-motors.com', firstName: 'Admin', lastName: 'User', role: UserRole.ADMIN },
  [PATTERNS.AUTH_FORGOT_PASSWORD]: { message: 'If the email exists, a reset link has been sent' },
  [PATTERNS.AUTH_RESET_PASSWORD]: { message: 'Password reset successfully' },
  // Customers
  [PATTERNS.CUSTOMERS_ME]: { id: 'user-1', email: 'customer@baccouche-motors.com', firstName: 'John', lastName: 'Customer', role: UserRole.CUSTOMER },
  [PATTERNS.CUSTOMERS_UPDATE_ME]: { id: 'user-1', email: 'customer@baccouche-motors.com', firstName: 'John', lastName: 'Customer', role: UserRole.CUSTOMER },
  [PATTERNS.CUSTOMERS_CHANGE_PASSWORD]: { message: 'Password changed successfully' },
  // Cars
  [PATTERNS.CARS_FIND_ALL]: { data: [{ id: 'car-1', make: 'Mercedes-Benz', model: 'E 300', year: 2023, slug: 'mercedes-benz-e-300-2023' }], total: 1, page: 1, limit: 10, totalPages: 1 },
  [PATTERNS.CARS_FIND_BY_ID]: { id: 'car-1', make: 'Mercedes-Benz', model: 'E 300', year: 2023, slug: 'mercedes-benz-e-300-2023', price: 65000 },
  [PATTERNS.CARS_FIND_BY_SLUG]: { id: 'car-1', make: 'Mercedes-Benz', model: 'E 300', year: 2023, slug: 'mercedes-benz-e-300-2023', price: 65000 },
  [PATTERNS.CARS_CREATE]: { id: 'car-new', make: 'Tesla', model: 'Model 3', year: 2024, slug: 'tesla-model-3-2024' },
  [PATTERNS.CARS_UPDATE]: { id: 'car-1', make: 'Mercedes-Benz', model: 'E 300', year: 2023, price: 66000 },
  [PATTERNS.CARS_DELETE]: { message: 'Car deleted' },
  [PATTERNS.CARS_UPLOAD_IMAGE]: { id: 'car-1', imagePath: '/uploads/cars/image.jpg' },
  [PATTERNS.CARS_GET_STATS]: { total: 5, available: 4, sold: 1 },
  // News
  [PATTERNS.NEWS_FIND_ALL]: { data: [{ id: 'news-1', slug: 'grand-opening-2024', title: 'Grand Opening 2024' }], total: 1, page: 1, limit: 10, totalPages: 1 },
  [PATTERNS.NEWS_FIND_BY_ID]: { id: 'news-1', slug: 'grand-opening-2024', title: 'Grand Opening 2024', content: 'Content' },
  [PATTERNS.NEWS_FIND_BY_SLUG]: { id: 'news-1', slug: 'grand-opening-2024', title: 'Grand Opening 2024', content: 'Content' },
  [PATTERNS.NEWS_CREATE]: { id: 'news-new', slug: 'new-article', title: 'New Article' },
  [PATTERNS.NEWS_UPDATE]: { id: 'news-1', slug: 'grand-opening-2024', title: 'Updated Title' },
  [PATTERNS.NEWS_DELETE]: { message: 'News deleted' },
  [PATTERNS.NEWS_UPLOAD_IMAGE]: { id: 'news-1', imagePath: '/uploads/news/image.jpg' },
  [PATTERNS.NEWS_GET_STATS]: { total: 2, published: 2, draft: 0 },
  // Test drives
  [PATTERNS.TEST_DRIVES_SCHEDULE]: { id: 'td-1', status: 'pending', carId: 'car-1', preferredDate: '2025-03-20' },
  [PATTERNS.TEST_DRIVES_FIND_ALL]: { data: [{ id: 'td-1', status: 'pending' }], total: 1, page: 1, limit: 10, totalPages: 1 },
  [PATTERNS.TEST_DRIVES_FIND_BY_ID]: { id: 'td-1', status: 'pending', carId: 'car-1', userId: 'user-1' },
  [PATTERNS.TEST_DRIVES_UPDATE_STATUS]: { id: 'td-1', status: 'confirmed' },
  [PATTERNS.TEST_DRIVES_DELETE]: { message: 'Test drive cancelled' },
  [PATTERNS.TEST_DRIVES_GET_STATS]: { total: 2, pending: 1, confirmed: 1 },
  // Contacts
  [PATTERNS.CONTACTS_CREATE]: { id: 'contact-1', name: 'John', email: 'john@example.com', subject: 'Inquiry' },
  [PATTERNS.CONTACTS_FIND_ALL]: { data: [{ id: 'contact-1', name: 'Sample Contact', email: 'sample@example.com' }], total: 1, page: 1, limit: 10, totalPages: 1 },
  [PATTERNS.CONTACTS_FIND_BY_ID]: { id: 'contact-1', name: 'Sample Contact', email: 'sample@example.com', subject: 'Inquiry', message: 'Message' },
  [PATTERNS.CONTACTS_UPDATE]: { id: 'contact-1', name: 'Updated Name', email: 'sample@example.com' },
  [PATTERNS.CONTACTS_DELETE]: { message: 'Contact deleted' },
  [PATTERNS.CONTACTS_GET_STATS]: { total: 1 },
  // Admin
  [PATTERNS.ADMIN_GET_DASHBOARD]: { cars: 5, news: 2, testDrives: 2, contacts: 1 },
};

/** Create a mock ClientProxy that returns configured responses (or throws RpcException for error overrides) */
export function createMockClient(overrides?: Partial<Record<string, unknown>>) {
  const responses = { ...mockResponses, ...overrides };
  return {
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    subscribeToResponseOf: jest.fn(),
    send: jest.fn((pattern: string) => {
      const response = responses[pattern];
      if (response && typeof response === 'object' && 'statusCode' in response && (response as { statusCode?: number }).statusCode >= 400) {
        const err = response as { statusCode: number; message?: string; error?: string };
        return throwError(() => new RpcException({ statusCode: err.statusCode, message: err.message || 'Error', error: err.error }));
      }
      return of(response ?? {});
    }),
  };
}

/** Create and initialize the Gateway app for E2E tests with optional mock overrides */
export async function createTestApp(overrides?: Partial<Record<string, unknown>>): Promise<INestApplication> {
  const mockClient = createMockClient(overrides);

  process.env.JWT_SECRET = JWT_SECRET;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [GatewayModule],
  })
    .overrideProvider('AUTH_SERVICE')
    .useValue(mockClient)
    .overrideProvider('CARS_SERVICE')
    .useValue(mockClient)
    .overrideProvider('NEWS_SERVICE')
    .useValue(mockClient)
    .overrideProvider('TEST_DRIVES_SERVICE')
    .useValue(mockClient)
    .overrideProvider('CONTACTS_SERVICE')
    .useValue(mockClient)
    .overrideProvider('ADMIN_SERVICE')
    .useValue(mockClient)
    .compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>();

  const uploadsDir = join(__dirname, '..', 'uploads');
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
  const carsDir = join(uploadsDir, 'cars');
  const newsDir = join(uploadsDir, 'news');
  if (!existsSync(carsDir)) mkdirSync(carsDir, { recursive: true });
  if (!existsSync(newsDir)) mkdirSync(newsDir, { recursive: true });
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new RpcExceptionFilter());
  app.enableCors({ origin: '*' });

  await app.init();
  return app;
}
