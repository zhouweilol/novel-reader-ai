import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/book.entity';
import { Chapter } from '../chapters/chapter.entity';
import { IfStory } from '../if-stories/if-story.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Chapter)
    private chaptersRepository: Repository<Chapter>,
    @InjectRepository(IfStory)
    private ifStoriesRepository: Repository<IfStory>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getStats() {
    const [bookCount, chapterCount, userCount, ifStoryCount, pendingReviewCount] =
      await Promise.all([
        this.booksRepository.count(),
        this.chaptersRepository.count(),
        this.usersRepository.count(),
        this.ifStoriesRepository.count({ where: { status: 'approved' } }),
        this.ifStoriesRepository.count({ where: { status: 'pending' } }),
      ]);

    return {
      bookCount,
      chapterCount,
      userCount,
      ifStoryCount,
      pendingReviewCount,
    };
  }
}
