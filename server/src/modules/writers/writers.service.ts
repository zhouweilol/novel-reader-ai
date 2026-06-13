import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WriterDailyUpload } from './writer-daily-upload.entity';

const DAILY_LIMIT = 10;

@Injectable()
export class WritersService {
  constructor(
    @InjectRepository(WriterDailyUpload)
    private uploadRepo: Repository<WriterDailyUpload>,
  ) {}

  async checkUploadLimit(userId: number, role: string): Promise<void> {
    if (role === 'admin') return; // 管理员不限制

    const today = new Date().toISOString().slice(0, 10);
    let record = await this.uploadRepo.findOne({ where: { userId, uploadDate: today } });

    if (record && record.chapterCount >= DAILY_LIMIT) {
      throw new ForbiddenException(`今日上传已达上限（${DAILY_LIMIT}章/天），请明天再试`);
    }
  }

  async recordUpload(userId: number, count: number = 1): Promise<void> {
    const today = new Date().toISOString().slice(0, 10);
    let record = await this.uploadRepo.findOne({ where: { userId, uploadDate: today } });

    if (record) {
      record.chapterCount += count;
      await this.uploadRepo.save(record);
    } else {
      await this.uploadRepo.save({ userId, uploadDate: today, chapterCount: count });
    }
  }

  async getTodayStats(userId: number): Promise<{ used: number; limit: number; isAdmin: boolean }> {
    const today = new Date().toISOString().slice(0, 10);
    const record = await this.uploadRepo.findOne({ where: { userId, uploadDate: today } });
    return { used: record?.chapterCount || 0, limit: DAILY_LIMIT, isAdmin: false };
  }
}
