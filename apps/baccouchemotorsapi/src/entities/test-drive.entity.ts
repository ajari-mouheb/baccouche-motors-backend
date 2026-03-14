import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Car } from './car.entity';
import { User } from './user.entity';

export enum TestDriveStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

@Entity('test_drives')
export class TestDrive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  userId: string | null;

  @Column('uuid', { nullable: true })
  carId: string | null;

  @Column('timestamp', { nullable: true })
  scheduledAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  model: string | null;

  @Column({ type: 'date', nullable: true })
  preferredDate: Date | null;

  @Column({ type: 'varchar', nullable: true })
  timeSlot: string | null;

  @Column({
    type: 'enum',
    enum: TestDriveStatus,
    default: TestDriveStatus.PENDING,
  })
  status: TestDriveStatus;

  @Column({ type: 'varchar', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.testDrives, { nullable: true })
  user: User | null;

  @ManyToOne(() => Car, (car) => car.testDrives, { nullable: true })
  car: Car | null;
}
