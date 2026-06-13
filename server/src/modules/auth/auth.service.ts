import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(phone: string, password: string) {
    const existingUser = await this.usersService.findByPhone(phone);
    if (existingUser) {
      throw new ConflictException('该手机号已注册');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(phone, passwordHash);

    const token = this.jwtService.sign({ userId: user.id, phone: user.phone, role: user.role });
    return { user: { id: user.id, phone: user.phone, role: user.role }, token };
  }

  async login(phone: string, password: string) {
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const token = this.jwtService.sign({ userId: user.id, phone: user.phone, role: user.role });
    return { user: { id: user.id, phone: user.phone, role: user.role }, token };
  }
}
