import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NewsStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('news')
export class News {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column('text')
  excerpt: string;

  @Column('text')
  content: string;

  @Column('date')
  date: Date;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({
    type: 'enum',
    enum: NewsStatus,
    default: NewsStatus.PUBLISHED,
  })
  status: NewsStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
