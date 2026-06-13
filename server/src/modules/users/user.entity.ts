import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255, comment: '手机号，AES加密存储' })
  phone: string;

  @Column({ length: 255, comment: '密码，bcrypt加密存储' })
  passwordHash: string;

  @Column({ length: 20, default: 'user', comment: '角色：user/admin' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}
