import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './chapter.entity';
import { Book } from '../books/book.entity';
import { IfStory } from '../if-stories/if-story.entity';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { WritersModule } from '../writers/writers.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter, Book, IfStory]), WritersModule, AuthModule],
  controllers: [ChaptersController],
  providers: [ChaptersService],
  exports: [ChaptersService],
})
export class ChaptersModule {}
