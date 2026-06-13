import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BooksModule } from '../books/books.module';
import { ChaptersModule } from '../chapters/chapters.module';
import { IfStoriesModule } from '../if-stories/if-stories.module';
import { AiModule } from '../ai/ai.module';
import { UsersModule } from '../users/users.module';
import { Book } from '../books/book.entity';
import { Chapter } from '../chapters/chapter.entity';
import { IfStory } from '../if-stories/if-story.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Chapter, IfStory, User]),
    BooksModule,
    ChaptersModule,
    IfStoriesModule,
    AiModule,
    UsersModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
