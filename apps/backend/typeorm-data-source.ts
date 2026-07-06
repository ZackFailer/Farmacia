import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { NodeSqliteCompat } from './src/app/common/node-sqlite-compat';

const mockSqlite = {
  verbose: () => ({
    Database: class Mock {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(..._args: any[]) {}
      run() { return this; }
      close() {}
    },
  }),
};

const options = {
  type: 'sqlite' as const,
  database: 'apps/backend/data/farmacia.sqlite',
  entities: ['apps/backend/src/app/common/entities/*.entity.ts'],
  migrations: ['apps/backend/src/app/common/migrations/*.ts'],
  synchronize: false,
  driver: mockSqlite,
} as any;

export const AppDataSource = new DataSource(options);

const driver = AppDataSource.driver as unknown as { connect: () => Promise<void>; disconnect: () => Promise<void>; databaseConnection: NodeSqliteCompat | undefined };
driver.connect = async () => {
  driver.databaseConnection = new NodeSqliteCompat(options.database);
};
driver.disconnect = async () => {
  const compat = driver.databaseConnection;
  if (compat) {
    await new Promise<void>((resolve, reject) => {
      compat.close((err) => (err ? reject(err) : resolve()));
    });
  }
};
