import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'node:path';

const dbUrl = process.env.DATABASE_URL;
const connConfig = dbUrl
  ? { url: dbUrl }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || process.env.PGUSER || 'postgres',
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'postgres',
      database: process.env.DB_NAME || process.env.PGDATABASE || 'farmacia_dev',
    };

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...connConfig,
  entities: [join(__dirname, 'src/app/common/entities/*.entity.ts')],
  migrations: [join(__dirname, 'src/app/common/migrations/*.ts')],
  synchronize: false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
