import { Controller, Get, UseGuards } from '@nestjs/common';
import { WritersService } from './writers.service';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/writer')
@UseGuards(OptionalAuthGuard)
export class WritersController {
  constructor(private writersService: WritersService) {}

  @Get('upload-stats')
  async getStats(@CurrentUser() user?: { userId: number; role: string }) {
    if (!user) return { used: 0, limit: 10, isAdmin: false, loggedIn: false };
    if (user.role === 'admin') return { used: 0, limit: Infinity, isAdmin: true };
    return this.writersService.getTodayStats(user.userId);
  }
}
