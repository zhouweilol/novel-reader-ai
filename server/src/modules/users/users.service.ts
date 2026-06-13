import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserPoint } from './user-point.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserPoint)
    private userPointsRepository: Repository<UserPoint>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phone } });
  }

  async create(phone: string, passwordHash: string): Promise<User> {
    const user = this.usersRepository.create({ phone, passwordHash });
    const savedUser = await this.usersRepository.save(user);

    // 新用户赠送初始积分
    await this.userPointsRepository.save({
      userId: savedUser.id,
      points: 100, // 初始赠送100积分
    });

    return savedUser;
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
