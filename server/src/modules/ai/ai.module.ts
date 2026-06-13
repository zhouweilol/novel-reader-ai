import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiConfig } from './ai-config.entity';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ChaptersModule } from '../chapters/chapters.module';

@Module({
  imports: [TypeOrmModule.forFeature([AiConfig]), ChaptersModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
