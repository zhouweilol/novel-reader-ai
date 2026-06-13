import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WriterDailyUpload } from './writer-daily-upload.entity';
import { WritersService } from './writers.service';
import { WritersController } from './writers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WriterDailyUpload])],
  controllers: [WritersController],
  providers: [WritersService],
  exports: [WritersService],
})
export class WritersModule {}
