import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('writer_daily_uploads')
export class WriterDailyUpload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'date' })
  uploadDate: string;

  @Column({ default: 0 })
  chapterCount: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
