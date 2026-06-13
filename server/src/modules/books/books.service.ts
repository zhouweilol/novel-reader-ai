import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  async findAll(user?: { userId: number; role: string }): Promise<Book[]> {
    if (!user) {
      return this.booksRepository.find({ where: { isActive: true } });
    }
    if (user.role === 'admin') {
      return this.booksRepository.find();
    }
    // 普通用户：所有上架的书 + 自己的书（含下架）
    return this.booksRepository.createQueryBuilder('book')
      .where('book.isActive = :active', { active: true })
      .orWhere('book.userId = :userId', { userId: user.userId })
      .getMany();
  }

  async findById(id: number, user?: { userId: number; role: string }): Promise<Book> {
    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book || (!book.isActive && (!user || user.role !== 'admin'))) {
      throw new NotFoundException('图书不存在');
    }
    return book;
  }

  async create(bookData: Partial<Book>): Promise<Book> {
    const book = this.booksRepository.create(bookData);
    return this.booksRepository.save(book);
  }

  async update(id: number, bookData: Partial<Book>, user?: { userId: number; role: string }): Promise<Book> {
    const book = await this.findById(id, user);
    if (user && user.role !== 'admin' && book.userId !== user.userId) {
      throw new ForbiddenException('无权修改此图书');
    }
    await this.booksRepository.update(id, bookData);
    return this.findById(id);
  }

  async delete(id: number, user?: { userId: number; role: string }): Promise<void> {
    const book = await this.findById(id, user);
    if (user && user.role !== 'admin' && book.userId !== user.userId) {
      throw new ForbiddenException('无权删除此图书');
    }
    await this.booksRepository.delete(id);
  }
}
