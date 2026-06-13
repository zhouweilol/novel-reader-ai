import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Book } from '../books/book.entity';
import { Chapter } from '../chapters/chapter.entity';
import { User } from '../users/user.entity';

@Entity('if_stories')
export class IfStory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookId: number;

  @Column()
  chapterId: number;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: ['ai', 'reader'], default: 'ai', comment: 'ai生成或读者续写' })
  source: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  wordCount: number;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending', comment: '审核状态' })
  status: string;

  @Column({ default: 0, comment: '打赏总数' })
  tipsCount: number;

  @Column({ default: 0, comment: '点赞总数' })
  likesCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @ManyToOne(() => Chapter)
  @JoinColumn({ name: 'chapterId' })
  chapter: Chapter;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
