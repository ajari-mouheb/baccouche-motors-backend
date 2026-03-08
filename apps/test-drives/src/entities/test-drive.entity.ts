import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TestDriveStatus } from '@app/shared';

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
}
