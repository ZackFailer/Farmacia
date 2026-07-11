import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'node:path';
import { NodeSqliteCompat } from './src/app/common/node-sqlite-compat';

const mockSqlite = {
  verbose: () => ({
    Database: class Mock {
      /* noop */
      run() { return this; }
      close() { /* noop */ }
    },
  }),
};

const options = {
  type: 'sqlite' as const,
  // __dirname = apps/backend/ (ejecutado con ts-node), DB_PATH para override
  database: process.env.DB_PATH || join(__dirname, 'data', 'farmacia.sqlite'),
  entities: ['apps/backend/src/app/common/entities/*.entity.ts'],
  migrations: ['apps/backend/src/app/common/migrations/*.ts'],
  synchronize: false,
  driver: mockSqlite,
} as unknown as DataSourceOptions;

export const AppDataSource = new DataSource(options);

const driver = AppDataSource.driver as unknown as { connect: () => Promise<void>; disconnect: () => Promise<void>; databaseConnection: NodeSqliteCompat | undefined };
driver.connect = async () => {
  driver.databaseConnection = new NodeSqliteCompat(options.database as string);
};
driver.disconnect = async () => {
  const compat = driver.databaseConnection;
  if (compat) {
    await new Promise<void>((resolve, reject) => {
      compat.close((err) => (err ? reject(err) : resolve()));
    });
  }
};
