import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IfStory } from './if-story.entity';
import { IfStoriesService } from './if-stories.service';
import { IfStoriesController } from './if-stories.controller';
import { AiModule } from '../ai/ai.module';
import { ChaptersModule } from '../chapters/chapters.module';

@Module({
  imports: [TypeOrmModule.forFeature([IfStory]), AiModule, ChaptersModule],
  controllers: [IfStoriesController],
  providers: [IfStoriesService],
  exports: [IfStoriesService],
})
export class IfStoriesModule {}
