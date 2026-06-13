import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IfStory } from './if-story.entity';
import { AiService } from '../ai/ai.service';
import { ChaptersService } from '../chapters/chapters.service';

@Injectable()
export class IfStoriesService {
  constructor(
    @InjectRepository(IfStory)
    private ifStoriesRepository: Repository<IfStory>,
    private aiService: AiService,
    private chaptersService: ChaptersService,
  ) {}

  async generateByAi(chapterId: number, userId: number): Promise<IfStory> {
    const content = await this.aiService.generateIfStory(chapterId);
    const chapter = await this.chaptersService.findById(chapterId);

    const ifStory = this.ifStoriesRepository.create({
      bookId: chapter.bookId,
      chapterId,
      userId,
      source: 'ai',
      content,
      wordCount: content.length,
      status: 'pending',
    });

    return this.ifStoriesRepository.save(ifStory);
  }

  async submitByReader(chapterId: number, userId: number, content: string): Promise<IfStory> {
    const chapter = await this.chaptersService.findById(chapterId);

    const ifStory = this.ifStoriesRepository.create({
      bookId: chapter.bookId,
      chapterId,
      userId,
      source: 'reader',
      content,
      wordCount: content.length,
      status: 'pending',
    });

    return this.ifStoriesRepository.save(ifStory);
  }

  async findByChapterId(chapterId: number): Promise<IfStory[]> {
    return this.ifStoriesRepository.find({
      where: { chapterId, status: 'approved' },
      order: { tipsCount: 'DESC' },
    });
  }

  async findById(id: number): Promise<IfStory> {
    const ifStory = await this.ifStoriesRepository.findOne({ where: { id } });
    if (!ifStory) {
      throw new NotFoundException('IF线作品不存在');
    }
    return ifStory;
  }

  async tip(id: number, points: number): Promise<IfStory> {
    const ifStory = await this.findById(id);
    ifStory.tipsCount += points;
    return this.ifStoriesRepository.save(ifStory);
  }

  async like(id: number): Promise<IfStory> {
    const ifStory = await this.findById(id);
    ifStory.likesCount += 1;
    return this.ifStoriesRepository.save(ifStory);
  }

  async getRanking(): Promise<IfStory[]> {
    return this.ifStoriesRepository.find({
      where: { status: 'approved' },
      order: { tipsCount: 'DESC' },
      take: 10,
    });
  }

  async getPendingList(): Promise<IfStory[]> {
    return this.ifStoriesRepository.find({
      where: { status: 'pending' },
      order: { createdAt: 'ASC' },
    });
  }

  async review(id: number, status: 'approved' | 'rejected'): Promise<IfStory> {
    const ifStory = await this.findById(id);
    ifStory.status = status;
    ifStory.reviewedAt = new Date();
    return this.ifStoriesRepository.save(ifStory);
  }
}
