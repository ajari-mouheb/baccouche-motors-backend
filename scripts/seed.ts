import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole, NewsStatus, TestDriveStatus } from '@app/shared';
import { User } from '../apps/auth/src/entities/user.entity';
import { Car } from '../apps/cars/src/entities/car.entity';
import { News } from '../apps/news/src/entities/news.entity';
import { Contact } from '../apps/contacts/src/entities/contact.entity';
import { TestDrive } from '../apps/test-drives/src/entities/test-drive.entity';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

const commonOptions = {
  type: 'postgres' as const,
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  synchronize: false,
  logging: false,
};

async function seedAuth() {
  const ds = new DataSource({
    ...commonOptions,
    database: 'baccouche_auth',
    entities: [User],
  });
  await ds.initialize();

  const userRepo = ds.getRepository(User);
  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@baccouche-motors.com' } });
  if (existingAdmin) {
    console.log('Auth: Admin user already exists, skipping');
    await ds.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  await userRepo.save({
    email: 'admin@baccouche-motors.com',
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
  });

  await userRepo.save({
    email: 'staff@baccouche-motors.com',
    password: hashedPassword,
    firstName: 'Staff',
    lastName: 'User',
    role: UserRole.STAFF,
  });

  await userRepo.save({
    email: 'customer@baccouche-motors.com',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Customer',
    role: UserRole.CUSTOMER,
  });

  console.log('Auth: Seeded 3 users (admin, staff, customer)');
  await ds.destroy();
}

async function seedCars() {
  const ds = new DataSource({
    ...commonOptions,
    database: 'baccouche_cars',
    entities: [Car],
  });
  await ds.initialize();

  const carRepo = ds.getRepository(Car);
  const count = await carRepo.count();
  if (count > 0) {
    console.log('Cars: Already seeded, skipping');
    await ds.destroy();
    return;
  }

  const cars = [
    { make: 'Mercedes-Benz', model: 'E 300', year: 2023, price: 65000, slug: 'mercedes-benz-e-300-2023', description: 'Luxury sedan with premium features', color: 'Black', fuelType: 'Petrol', transmission: 'Automatic' },
    { make: 'BMW', model: '530i', year: 2022, price: 58000, slug: 'bmw-530i-2022', description: 'Sporty executive sedan', color: 'White', fuelType: 'Petrol', transmission: 'Automatic' },
    { make: 'Audi', model: 'A6', year: 2023, price: 62000, slug: 'audi-a6-2023', description: 'Elegant and powerful', color: 'Silver', fuelType: 'Petrol', transmission: 'Automatic' },
    { make: 'Toyota', model: 'Camry', year: 2024, price: 32000, slug: 'toyota-camry-2024', description: 'Reliable family sedan', color: 'Blue', fuelType: 'Petrol', transmission: 'Automatic' },
    { make: 'Honda', model: 'Accord', year: 2023, price: 31000, slug: 'honda-accord-2023', description: 'Comfortable and efficient', color: 'Grey', fuelType: 'Petrol', transmission: 'CVT' },
  ];

  for (const car of cars) {
    await carRepo.save(car);
  }

  console.log('Cars: Seeded 5 cars');
  await ds.destroy();
}

async function seedNews() {
  const ds = new DataSource({
    ...commonOptions,
    database: 'baccouche_news',
    entities: [News],
  });
  await ds.initialize();

  const newsRepo = ds.getRepository(News);
  const count = await newsRepo.count();
  if (count > 0) {
    console.log('News: Already seeded, skipping');
    await ds.destroy();
    return;
  }

  await newsRepo.save([
    { slug: 'grand-opening-2024', title: 'Grand Opening 2024', excerpt: 'Visit our new showroom', content: 'We are pleased to announce the opening of our new showroom. Visit us for the best selection of premium vehicles.', date: new Date('2024-01-15'), status: NewsStatus.PUBLISHED },
    { slug: 'summer-promotions', title: 'Summer Promotions', excerpt: 'Special offers this season', content: 'Take advantage of our summer promotions. Flexible financing and attractive trade-in values.', date: new Date('2024-06-01'), status: NewsStatus.PUBLISHED },
  ]);

  console.log('News: Seeded 2 news items');
  await ds.destroy();
}

async function seedContacts() {
  const ds = new DataSource({
    ...commonOptions,
    database: 'baccouche_contacts',
    entities: [Contact],
  });
  await ds.initialize();

  const contactRepo = ds.getRepository(Contact);
  const count = await contactRepo.count();
  if (count > 0) {
    console.log('Contacts: Already seeded, skipping');
    await ds.destroy();
    return;
  }

  await contactRepo.save([
    { name: 'Sample Contact', email: 'sample@example.com', subject: 'Inquiry', message: 'Sample contact message for testing.' },
  ]);

  console.log('Contacts: Seeded 1 contact');
  await ds.destroy();
}

async function seedTestDrives() {
  const authDs = new DataSource({
    ...commonOptions,
    database: 'baccouche_auth',
    entities: [User],
  });
  await authDs.initialize();

  const carsDs = new DataSource({
    ...commonOptions,
    database: 'baccouche_cars',
    entities: [Car],
  });
  await carsDs.initialize();

  const testDrivesDs = new DataSource({
    ...commonOptions,
    database: 'baccouche_test_drives',
    entities: [TestDrive],
  });
  await testDrivesDs.initialize();

  const userRepo = authDs.getRepository(User);
  const carRepo = carsDs.getRepository(Car);
  const testDriveRepo = testDrivesDs.getRepository(TestDrive);

  const count = await testDriveRepo.count();
  if (count > 0) {
    console.log('Test Drives: Already seeded, skipping');
    await authDs.destroy();
    await carsDs.destroy();
    await testDrivesDs.destroy();
    return;
  }

  const users = await userRepo.find({ take: 1 });
  const cars = await carRepo.find({ take: 2 });
  if (users.length > 0 && cars.length > 0) {
    await testDriveRepo.save([
      { userId: users[0].id, carId: cars[0].id, name: 'John Doe', email: 'john@example.com', status: TestDriveStatus.PENDING, preferredDate: new Date(), timeSlot: '10:00' },
      { userId: users[0].id, carId: cars[1].id, name: 'Jane Smith', email: 'jane@example.com', status: TestDriveStatus.CONFIRMED, preferredDate: new Date(), timeSlot: '14:00' },
    ]);
    console.log('Test Drives: Seeded 2 test drives');
  } else {
    console.log('Test Drives: Skipped (no users or cars found - run auth and cars seed first)');
  }

  await authDs.destroy();
  await carsDs.destroy();
  await testDrivesDs.destroy();
}

async function main() {
  console.log('Starting seed...');
  try {
    await seedAuth();
    await seedCars();
    await seedNews();
    await seedContacts();
    await seedTestDrives();
    console.log('Seed completed successfully.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

main();
