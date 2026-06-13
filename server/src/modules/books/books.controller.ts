import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(@CurrentUser() user?: { userId: number; role: string }) {
    return this.booksService.findAll(user);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async findById(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: { userId: number; role: string }) {
    return this.booksService.findById(id, user);
  }

  @Post()
  @UseGuards(OptionalAuthGuard)
  async create(@Body() bookData: any, @CurrentUser() user?: { userId: number; role: string }) {
    if (user) {
      bookData.userId = user.userId;
    }
    return this.booksService.create(bookData);
  }

  @Put(':id')
  @UseGuards(OptionalAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() bookData: any,
    @CurrentUser() user?: { userId: number; role: string },
  ) {
    return this.booksService.update(id, bookData, user);
  }

  @Delete(':id')
  @UseGuards(OptionalAuthGuard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: { userId: number; role: string },
  ) {
    return this.booksService.delete(id, user);
  }
}
