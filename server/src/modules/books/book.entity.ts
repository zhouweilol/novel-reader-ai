import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Chapter } from '../chapters/chapter.entity';
import { User } from '../users/user.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 100 })
  author: string;

  @Column({ length: 500, nullable: true })
  coverUrl: string;

  @Column({ length: 500, nullable: true, comment: '原文档地址，AES加密存储' })
  filePath: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Chapter, (chapter) => chapter.book)
  chapters: Chapter[];
}
