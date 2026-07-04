import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'apps/backend/data/farmacia.sqlite',
  entities: ['apps/backend/src/app/common/entities/*.entity.ts'],
  migrations: ['apps/backend/src/app/common/migrations/*.ts'],
  synchronize: false,
});
