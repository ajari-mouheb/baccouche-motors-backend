/**
 * Message patterns for @nestjs/microservices (MessagePattern - request/response)
 * Used for both Kafka and (legacy) RabbitMQ RPC
 */
export const PATTERNS = {
  // Auth
  AUTH_REGISTER: 'auth.register',
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_ME: 'auth.me',
  AUTH_FORGOT_PASSWORD: 'auth.forgot-password',
  AUTH_RESET_PASSWORD: 'auth.reset-password',
  // Customers (auth service)
  CUSTOMERS_ME: 'customers.me',
  CUSTOMERS_UPDATE_ME: 'customers.updateMe',
  CUSTOMERS_CHANGE_PASSWORD: 'customers.changePassword',
  // Cars
  CARS_FIND_ALL: 'cars.findAll',
  CARS_FIND_BY_ID: 'cars.findById',
  CARS_FIND_BY_SLUG: 'cars.findBySlug',
  CARS_CREATE: 'cars.create',
  CARS_UPDATE: 'cars.update',
  CARS_DELETE: 'cars.delete',
  CARS_UPLOAD_IMAGE: 'cars.uploadImage',
  CARS_GET_STATS: 'cars.getStats',
  // News
  NEWS_FIND_ALL: 'news.findAll',
  NEWS_FIND_BY_ID: 'news.findById',
  NEWS_FIND_BY_SLUG: 'news.findBySlug',
  NEWS_CREATE: 'news.create',
  NEWS_UPDATE: 'news.update',
  NEWS_DELETE: 'news.delete',
  NEWS_UPLOAD_IMAGE: 'news.uploadImage',
  NEWS_GET_STATS: 'news.getStats',
  // Test-drives
  TEST_DRIVES_SCHEDULE: 'test-drives.schedule',
  TEST_DRIVES_FIND_ALL: 'test-drives.findAll',
  TEST_DRIVES_FIND_BY_USER: 'test-drives.findByUser',
  TEST_DRIVES_FIND_BY_ID: 'test-drives.findById',
  TEST_DRIVES_UPDATE_STATUS: 'test-drives.updateStatus',
  TEST_DRIVES_DELETE: 'test-drives.delete',
  TEST_DRIVES_GET_STATS: 'test-drives.getStats',
  // Contacts
  CONTACTS_CREATE: 'contacts.create',
  CONTACTS_FIND_ALL: 'contacts.findAll',
  CONTACTS_FIND_BY_ID: 'contacts.findById',
  CONTACTS_UPDATE: 'contacts.update',
  CONTACTS_DELETE: 'contacts.delete',
  CONTACTS_GET_STATS: 'contacts.getStats',
  // Admin
  ADMIN_GET_DASHBOARD: 'admin.getDashboard',
} as const;

export const QUEUES = {
  AUTH: 'auth_queue',
  CARS: 'cars_queue',
  NEWS: 'news_queue',
  TEST_DRIVES: 'test_drives_queue',
  CONTACTS: 'contacts_queue',
  ADMIN: 'admin_queue',
  NOTIFICATIONS: 'notifications_queue',
} as const;
