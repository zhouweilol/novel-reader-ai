import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe,
  UseInterceptors, UploadedFile, BadRequestException, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ChaptersService } from './chapters.service';
import { WritersService } from '../writers/writers.service';
import { parseDocument } from '../../common/doc-parser.utils';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import * as fs from 'fs';

const ALLOWED_EXTS = ['.md', '.txt', '.markdown'];

@Controller('api')
export class ChaptersController {
  constructor(
    private chaptersService: ChaptersService,
    private writersService: WritersService,
  ) {}

  @Get('books/:bookId/chapters')
  async findByBookId(@Param('bookId', ParseIntPipe) bookId: number) {
    return this.chaptersService.findByBookId(bookId);
  }

  @Get('chapters/:id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.findById(id);
  }

  @Post('chapters')
  async create(@Body() chapterData: any) {
    return this.chaptersService.create(chapterData);
  }

  @Post('chapters/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, name + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (ALLOWED_EXTS.includes(ext)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`不支持的文件格式，仅支持: ${ALLOWED_EXTS.join(', ')}`), false);
        }
      },
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: { bookId?: string }) {
    if (!file) throw new BadRequestException('请上传文件');
    const content = fs.readFileSync(file.path, 'utf-8');
    const chapters = parseDocument(file.originalname, content);
    // 清理上传的临时文件
    fs.unlink(file.path, () => {});
    return {
      filename: file.originalname,
      chapters,
      bookId: body.bookId ? parseInt(body.bookId, 10) : null,
    };
  }

  @Post('chapters/batch')
  @UseGuards(OptionalAuthGuard)
  async batchCreate(
    @Body() body: { chapters: any[]; bookId: number },
    @CurrentUser() user?: { userId: number; role: string },
  ) {
    if (!body.chapters || body.chapters.length === 0) {
      throw new BadRequestException('请提供要导入的章节');
    }
    // 检查上传限制
    if (user) {
      await this.writersService.checkUploadLimit(user.userId, user.role);
    }
    const results: any[] = [];
    for (const ch of body.chapters) {
      const created = await this.chaptersService.create({
        ...ch,
        bookId: body.bookId,
      });
      results.push(created);
    }
    // 记录上传计数
    if (user && user.role !== 'admin') {
      await this.writersService.recordUpload(user.userId, results.length);
    }
    return { count: results.length, chapters: results };
  }

  @Put('chapters/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() chapterData: any) {
    return this.chaptersService.update(id, chapterData);
  }

  @Delete('chapters/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.delete(id);
  }
}
