import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BooksModule } from './modules/books/books.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { AiModule } from './modules/ai/ai.module';
import { IfStoriesModule } from './modules/if-stories/if-stories.module';
import { AdminModule } from './modules/admin/admin.module';
import { WritersModule } from './modules/writers/writers.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UsersModule,
    BooksModule,
    ChaptersModule,
    AiModule,
    IfStoriesModule,
    AdminModule,
    WritersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
