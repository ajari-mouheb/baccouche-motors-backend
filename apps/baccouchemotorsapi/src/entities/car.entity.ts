import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TestDrive } from './test-drive.entity';

export enum CarStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column('int')
  year: number;

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  slug: string | null;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  specs: Record<string, unknown> | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  vin: string | null;

  @Column('int', { nullable: true })
  mileage: number | null;

  @Column({ type: 'varchar', nullable: true })
  color: string | null;

  @Column({ type: 'varchar', nullable: true })
  fuelType: string | null;

  @Column({ type: 'varchar', nullable: true })
  transmission: string | null;

  @Column({
    type: 'enum',
    enum: CarStatus,
    default: CarStatus.AVAILABLE,
  })
  status: CarStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TestDrive, (testDrive) => testDrive.car)
  testDrives: TestDrive[];
}
