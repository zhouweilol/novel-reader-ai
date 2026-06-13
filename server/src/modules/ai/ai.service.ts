import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiConfig } from './ai-config.entity';
import { ChaptersService } from '../chapters/chapters.service';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiConfig)
    private aiConfigRepository: Repository<AiConfig>,
    private chaptersService: ChaptersService,
  ) {}

  async getConfig(): Promise<AiConfig | null> {
    return this.aiConfigRepository.findOne({ where: {} });
  }

  async saveConfig(config: Partial<AiConfig>): Promise<AiConfig | null> {
    const existing = await this.aiConfigRepository.findOne({ where: {} });
    if (existing) {
      // 用 save 而非 update，确保 TypeORM transformer 生效
      Object.assign(existing, config);
      return this.aiConfigRepository.save(existing);
    }
    const newConfig = this.aiConfigRepository.create(config as AiConfig);
    return this.aiConfigRepository.save(newConfig);
  }

  async generateIfStory(chapterId: number): Promise<string> {
    const chapter = await this.chaptersService.findById(chapterId);
    const config = await this.getConfig();

    if (!config) {
      throw new Error('AI配置未设置');
    }

    // 这里调用DeepSeek/Mimo API生成续写
    // 实际实现时需要替换为真实的API调用
    const prompt = `请基于以下小说章节内容，续写一个1000-2000字的IF线故事。\n\n章节标题：${chapter.title}\n章节内容：${chapter.content}\n\n请续写一个有趣的故事分支：`;

    // TODO: 调用真实的AI API
    // const response = await this.callAiApi(config, prompt);

    // 临时返回示例内容
    return `【AI续写示例】\n\n基于"${chapter.title}"的续写内容...\n\n（待接入真实AI API后将生成实际内容）`;
  }

  async chatWithBot(chapterContent: string, userMessage: string): Promise<string> {
    const config = await this.getConfig();

    if (!config) {
      throw new Error('AI配置未设置');
    }

    const prompt = `你是一个幽默的小说吐槽机器人。请对以下小说内容进行吐槽，风格要搞笑、犀利。\n\n小说内容：${chapterContent}\n\n用户问题：${userMessage}`;

    // TODO: 调用真实的AI API
    return `🤖 吐槽机器人：哈哈，这段内容太有意思了！（待接入真实AI API）`;
  }
}
