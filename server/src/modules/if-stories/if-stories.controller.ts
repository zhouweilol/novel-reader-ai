import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { IfStoriesService } from './if-stories.service';

@Controller('api/if-stories')
export class IfStoriesController {
  constructor(private ifStoriesService: IfStoriesService) {}

  @Post('generate')
  async generateByAi(@Body() body: { chapterId: number; userId: number }) {
    return this.ifStoriesService.generateByAi(body.chapterId, body.userId);
  }

  @Post('submit')
  async submitByReader(@Body() body: { chapterId: number; userId: number; content: string }) {
    return this.ifStoriesService.submitByReader(body.chapterId, body.userId, body.content);
  }

  @Get('chapter/:chapterId')
  async findByChapterId(@Param('chapterId', ParseIntPipe) chapterId: number) {
    return this.ifStoriesService.findByChapterId(chapterId);
  }

  @Get('ranking')
  async getRanking() {
    return this.ifStoriesService.getRanking();
  }

  @Post(':id/tip')
  async tip(@Param('id', ParseIntPipe) id: number, @Body() body: { points: number }) {
    return this.ifStoriesService.tip(id, body.points);
  }

  @Post(':id/like')
  async like(@Param('id', ParseIntPipe) id: number) {
    return this.ifStoriesService.like(id);
  }

  @Get('pending')
  async getPendingList() {
    return this.ifStoriesService.getPendingList();
  }

  @Put(':id/review')
  async review(@Param('id', ParseIntPipe) id: number, @Body() body: { status: 'approved' | 'rejected' }) {
    return this.ifStoriesService.review(id, body.status);
  }
}
