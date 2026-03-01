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
}

@Entity('test_drives')
export class TestDrive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  carId: string;

  @Column('timestamp')
  scheduledAt: Date;

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

  @ManyToOne(() => User, (user) => user.testDrives)
  user: User;

  @ManyToOne(() => Car, (car) => car.testDrives)
  car: Car;
}
