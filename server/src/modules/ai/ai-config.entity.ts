import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { encrypt, decrypt } from '../../common/crypto.utils';

@Entity('ai_config')
export class AiConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 500,
    comment: 'API Key，AES加密存储',
    transformer: {
      to: (value: string) => (value ? encrypt(value) : value),
      from: (value: string) => (value ? decrypt(value) : value),
    },
  })
  apiKey: string;

  @Column({ length: 100, default: 'deepseek', comment: 'deepseek / mimo' })
  modelName: string;

  @Column({ type: 'text', nullable: true })
  promptTemplate: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true, comment: 'IF续写功能开关' })
  ifEnabled: boolean;

  @Column({ default: true, comment: '吐槽机器人功能开关' })
  chatEnabled: boolean;
}
