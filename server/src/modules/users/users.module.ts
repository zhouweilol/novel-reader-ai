import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserPoint } from './user-point.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPoint])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
