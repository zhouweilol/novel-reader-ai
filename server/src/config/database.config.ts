import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'novel_reader',
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  synchronize: process.env.DB_SYNC !== 'false',
  logging: process.env.DB_LOGGING === 'true',
};
