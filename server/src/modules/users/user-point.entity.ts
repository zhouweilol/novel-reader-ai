import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('user_points')
export class UserPoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column({ default: 0 })
  points: number;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
