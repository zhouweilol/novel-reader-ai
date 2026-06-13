import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './chapter.entity';
import { Book } from '../books/book.entity';
import { IfStory } from '../if-stories/if-story.entity';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private chaptersRepository: Repository<Chapter>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(IfStory)
    private ifStoryRepository: Repository<IfStory>,
  ) {}

  async findByBookId(bookId: number): Promise<Chapter[]> {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book || !book.isActive) {
      throw new NotFoundException('图书不存在');
    }
    return this.chaptersRepository.find({
      where: { bookId },
      order: { chapterNum: 'ASC' },
      select: {
        id: true,
        chapterNum: true,
        title: true,
        wordCount: true,
      },
    });
  }

  async findById(id: number): Promise<Chapter> {
    const chapter = await this.chaptersRepository.findOne({ where: { id } });
    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }
    const book = await this.bookRepository.findOne({ where: { id: chapter.bookId } });
    if (!book || !book.isActive) {
      throw new NotFoundException('章节不存在');
    }
    return chapter;
  }

  async create(chapterData: Partial<Chapter>): Promise<Chapter> {
    if (chapterData.bookId && chapterData.chapterNum) {
      // 从大到小移位，避免唯一约束冲突
      await this.chaptersRepository
        .createQueryBuilder()
        .update(Chapter)
        .set({ chapterNum: () => 'chapterNum + 1' })
        .where('bookId = :bookId', { bookId: chapterData.bookId })
        .andWhere('chapterNum >= :num', { num: chapterData.chapterNum })
        .orderBy('chapterNum', 'DESC')
        .execute();
    }
    const chapter = this.chaptersRepository.create(chapterData);
    return this.chaptersRepository.save(chapter);
  }

  async update(id: number, chapterData: Partial<Chapter>): Promise<Chapter> {
    const existing = await this.findById(id);
    if (chapterData.chapterNum && chapterData.chapterNum !== existing.chapterNum) {
      const bookId = chapterData.bookId || existing.bookId;
      const oldNum = existing.chapterNum;
      const newNum = chapterData.chapterNum;
      if (newNum < oldNum) {
        // 向前移动：中间章节序号 +1，从大到小防止冲突
        await this.chaptersRepository
          .createQueryBuilder()
          .update(Chapter)
          .set({ chapterNum: () => 'chapterNum + 1' })
          .where('bookId = :bookId', { bookId })
          .andWhere('chapterNum >= :newNum', { newNum })
          .andWhere('chapterNum < :oldNum', { oldNum })
          .andWhere('id != :id', { id })
          .orderBy('chapterNum', 'DESC')
          .execute();
      } else {
        // 向后移动：中间章节序号 -1，从小到大防止冲突
        await this.chaptersRepository
          .createQueryBuilder()
          .update(Chapter)
          .set({ chapterNum: () => 'chapterNum - 1' })
          .where('bookId = :bookId', { bookId })
          .andWhere('chapterNum > :oldNum', { oldNum })
          .andWhere('chapterNum <= :newNum', { newNum })
          .andWhere('id != :id', { id })
          .orderBy('chapterNum', 'ASC')
          .execute();
      }
    }
    await this.chaptersRepository.update(id, chapterData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const chapter = await this.findById(id);
    await this.ifStoryRepository.delete({ chapterId: id });
    await this.chaptersRepository.delete(id);
    // 后续章节序号 -1，从小到大防止冲突
    await this.chaptersRepository
      .createQueryBuilder()
      .update(Chapter)
      .set({ chapterNum: () => 'chapterNum - 1' })
      .where('bookId = :bookId', { bookId: chapter.bookId })
      .andWhere('chapterNum > :num', { num: chapter.chapterNum })
      .orderBy('chapterNum', 'ASC')
      .execute();
  }
}
