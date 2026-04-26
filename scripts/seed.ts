import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole, NewsStatus, TestDriveStatus, CarStatus } from '@app/shared';
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

const CAR_IMAGES = {
  mercedes: 'https://images.unsplash.com/photo-1618843479313-40f8202f4a70?w=800&q=85',
  bmw: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=85',
  audi: 'https://images.unsplash.com/photo-1603584173870-7f2f3c7b6b7e?w=800&q=85',
  toyota: 'https://images.unsplash.com/photo-1621007947-8be3a1d6a5db?w=800&q=85',
  honda: 'https://images.unsplash.com/photo-1619767888026-0d9a8a5e1f8e?w=800&q=85',
  porsche: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=85',
  rangeRover: 'https://images.unsplash.com/photo-1606016255306-4a128a84b8d3?w=800&q=85',
  lexus: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=85',
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
    {
      make: 'Mercedes-Benz',
      model: 'E 300',
      year: 2023,
      price: 185000,
      slug: 'mercedes-benz-e-300-2023',
      description: 'Berline premium avec moteur 2.0L turbo, intérieur cuir Nappa, système MBUX, écran 12.3", caméra 360°, toit panoramique. Véhicule en parfait état avec historique complet.',
      image: CAR_IMAGES.mercedes,
      color: 'Noir Obsidien',
      fuelType: 'Essence',
      transmission: 'Automatique 9G-TRONIC',
      mileage: 15000,
      status: CarStatus.AVAILABLE,
      specs: { 'Moteur': '2.0L Turbo 258ch', '0-100 km/h': '6.2s', 'Consommation': '7.5L/100km', 'Boîte': '9 rapports' },
    },
    {
      make: 'BMW',
      model: '530i M Sport',
      year: 2024,
      price: 195000,
      slug: 'bmw-530i-m-sport-2024',
      description: 'Série 5 M Sport avec pack Innovation, écrans BMW Curved Display, sièges sport en cuir Vernasca, assistant de conduite Professional. Véhicule comme neuf.',
      image: CAR_IMAGES.bmw,
      color: 'Blanc Alpin',
      fuelType: 'Essence',
      transmission: 'Automatique Steptronic 8 rapports',
      mileage: 5200,
      status: CarStatus.AVAILABLE,
      specs: { 'Moteur': '2.0L Turbo 252ch', '0-100 km/h': '6.2s', 'Consommation': '6.8L/100km', 'Boîte': '8 rapports' },
    },
    {
      make: 'Audi',
      model: 'A6 50 TDI',
      year: 2023,
      price: 178000,
      slug: 'audi-a6-50-tdi-2023',
      description: 'A6 Quattro avec moteur V6 TDI 3.0L, transmission S tronic, virtual cockpit plus, phares Matrix LED, intérieur cuir Valcona. Très faible kilométrage.',
      image: CAR_IMAGES.audi,
      color: 'Gris Nardo',
      fuelType: 'Diesel',
      transmission: 'S tronic 7 rapports',
      mileage: 8500,
      status: CarStatus.AVAILABLE,
      specs: { 'Moteur': 'V6 TDI 286ch', '0-100 km/h': '5.6s', 'Consommation': '6.2L/100km', 'Boîte': '7 rapports' },
    },
    {
      make: 'Toyota',
      model: 'Camry Hybrid',
      year: 2024,
      price: 85000,
      slug: 'toyota-camry-hybrid-2024',
      description: 'Camry Hybrid économique et fiable avec intérieur premium, écran 12.3", Toyota Safety Sense 3.0, sièges chauffants. Hybride essence-électrique.',
      image: CAR_IMAGES.toyota,
      color: 'Bleu Attirant',
      fuelType: 'Hybride',
      transmission: 'CVT',
      mileage: 12000,
      status: CarStatus.AVAILABLE,
      specs: { 'Moteur': '2.5L Hybrid 208ch', '0-100 km/h': '8.3s', 'Consommation': '4.5L/100km', 'Boîte': 'CVT' },
    },
    {
      make: 'Honda',
      model: 'Accord Sport',
      year: 2023,
      price: 72000,
      slug: 'honda-accord-sport-2023',
      description: 'Accord Sport avec intérieur cuir, système audio premium, écran 8" avec Apple CarPlay/Android Auto, Honda Sensing complet. Excellent rapport qualité/prix.',
      image: CAR_IMAGES.honda,
      color: 'Gris Platinum',
      fuelType: 'Essence',
      transmission: 'Automatique 10 rapports',
      mileage: 22000,
      status: CarStatus.AVAILABLE,
      specs: { 'Moteur': '1.5L Turbo 192ch', '0-100 km/h': '7.8s', 'Consommation': '7.1L/100km', 'Boîte': '10 rapports' },
    },
    {
      make: 'Porsche',
      model: 'Cayenne',
      year: 2024,
      price: 320000,
      slug: 'porsche-cayenne-2024',
      description: 'Cayenne avec pack Sport Chrono, toit panoramique, intérieur cuir étendu, système Porsche Communication Management, phares Matrix LED. Véhicule d\'exception.',
      image: CAR_IMAGES.porsche,
      color: 'Blanc Carrara',
      fuelType: 'Essence',
      transmission: 'Tiptronic S 8 rapports',
      mileage: 3800,
      status: CarStatus.AVAILABLE,
      specs: { 'Moteur': 'V6 3.0L Turbo 340ch', '0-100 km/h': '6.0s', 'Consommation': '10.2L/100km', 'Boîte': '8 rapports' },
    },
    {
      make: 'Land Rover',
      model: 'Range Rover Sport',
      year: 2024,
      price: 285000,
      slug: 'range-rover-sport-2024',
      description: 'Range Rover Sport avec suspension pneumatique, Terrain Response 2, intérieur cuir graine, toit panoramique coulissant, système Meridian Premium Audio.',
      image: CAR_IMAGES.rangeRover,
      color: 'Noir Santorini',
      fuelType: 'Diesel',
      transmission: 'Automatique 8 rapports',
      mileage: 6000,
      status: CarStatus.AVAILABLE,
      specs: { 'Moteur': 'V6 Diesel 300ch', '0-100 km/h': '6.8s', 'Consommation': '8.5L/100km', 'Boîte': '8 rapports' },
    },
    {
      make: 'Lexus',
      model: 'ES 300h',
      year: 2023,
      price: 125000,
      slug: 'lexus-es-300h-2023',
      description: 'Lexus ES hybride avec intérieur cuir premium, système Mark Levinson Audio, écran 12.3", Lexus Safety System+ 2.5, sièges chauffants et ventilés.',
      image: CAR_IMAGES.lexus,
      color: 'Blanc Nuage',
      fuelType: 'Hybride',
      transmission: 'CVT',
      mileage: 18000,
      status: CarStatus.AVAILABLE,
      specs: { 'Moteur': '2.5L Hybrid 218ch', '0-100 km/h': '8.9s', 'Consommation': '4.8L/100km', 'Boîte': 'CVT' },
    },
  ];

  for (const car of cars) {
    await carRepo.save(car);
  }

  console.log('Cars: Seeded 8 cars with images and specs');
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
    {
      slug: 'grand-opening-2024',
      title: 'Grand Opening 2024 - Notre Nouveau Showroom',
      excerpt: 'Découvrez notre nouveau showroom et fêtez notre ouverture avec des offres exceptionnelles.',
      content: `Nous avons le plaisir de vous annoncer l'ouverture de notre nouveau showroom Baccouche Motors!

Venez découvrir notre espace entièrement rénové avec plus de 500m² dédiés à nos véhicules premium. Notre équipe experte sera ravie de vous accompagner dans votre recherche du véhicule idéal.

**Avantages exclusifs pour l'ouverture:**
- Jusqu'à 15% de réduction sur notre collection
- Garantie étendue offerte
- Financement à taux préférentiel
- Reprise de votre véhicule actuel

N'attendez plus pour nous rendre visite et profiter de ces offres exceptionnelles jusqu'à fin du mois.`,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=85',
      date: new Date('2024-01-15'),
      status: NewsStatus.PUBLISHED,
    },
    {
      slug: 'summer-promotions-2024',
      title: 'Promotions Été 2024 - Offres Irrésistibles',
      excerpt: 'Profitez de nos offres estivales sur une large sélection de véhicules.',
      content: `L'été arrive et avec lui, des promotions exceptionnelles chez Baccouche Motors!

**Offres valides de juin à août 2024:**

**Sur les véhicules neufs:**
- Jusqu'à 20% sur Mercedes-Benz Classe E
- 15% sur BMW Série 5
- Remise spéciale sur Audi A6

**Sur les véhicules d'occasion:**
- Tous nos véhicules certifiés avec 10% de réduction
- Garantie 24 mois incluse
- Contrôle technique offert

**Services:**
- Premier entretien gratuit
- Livraison à domicile disponible
- Financement sur mesure

Contactez-nous pour plus d'informations ou prenez rendez-vous pour un essai gratuit!`,
      image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=85',
      date: new Date('2024-06-01'),
      status: NewsStatus.PUBLISHED,
    },
    {
      slug: 'new-arrival-porsche-cayenne',
      title: 'Nouvelle Arrivée: Porsche Cayenne 2024',
      excerpt: 'Découvrez le nouveau Porsche Cayenne 2024 disponible dans notre showroom.',
      content: `Baccouche Motors est fier de vous présenter le nouveau Porsche Cayenne 2024!

Ce SUV de luxe allie performance, confort et technologie de pointe. Avec son design affiné et ses nouvelles fonctionnalités, il redéfinit l'expérience de conduite premium.

**Caractéristiques principales:**
- Moteur V6 3.0L Turbo de 340ch
- Intérieur entièrement digital avec PCM
- Pack Sport Chrono
- Phares Matrix LED
- Toit panoramique

Venez le découvrir dans notre showroom ou réservez votre essai dès maintenant.`,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=85',
      date: new Date('2024-09-15'),
      status: NewsStatus.PUBLISHED,
    },
  ]);

  console.log('News: Seeded 3 news articles with images');
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
