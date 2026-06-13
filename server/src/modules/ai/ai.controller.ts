import { Controller, Post, Get, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('api/ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('config')
  async getConfig() {
    return this.aiService.getConfig();
  }

  @Post('config')
  async saveConfig(@Body() config: any) {
    return this.aiService.saveConfig(config);
  }

  @Post('generate-if-story')
  async generateIfStory(@Body() body: { chapterId: number }) {
    const content = await this.aiService.generateIfStory(body.chapterId);
    return { content };
  }

  @Post('chat')
  async chat(@Body() body: { chapterContent: string; message: string }) {
    const reply = await this.aiService.chatWithBot(body.chapterContent, body.message);
    return { reply };
  }

  @Get('features')
  async getFeatures() {
    const config = await this.aiService.getConfig();
    return { ifEnabled: config?.ifEnabled ?? true, chatEnabled: config?.chatEnabled ?? true };
  }
}
