import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Book } from '../books/book.entity';

@Entity('chapters')
@Index(['bookId', 'chapterNum'], { unique: true })
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookId: number;

  @Column()
  chapterNum: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ comment: '每章不低于2000字' })
  wordCount: number;

  @ManyToOne(() => Book, (book) => book.chapters)
  @JoinColumn({ name: 'bookId' })
  book: Book;
}
