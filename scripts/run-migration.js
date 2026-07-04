require('ts-node').register({
  project: 'apps/backend/tsconfig.app.json',
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  },
});

require('reflect-metadata');

const { AppDataSource } = require('../apps/backend/typeorm-data-source');

const command = process.argv[2] || 'run';

async function main() {
  await AppDataSource.initialize();
  console.log(`Data Source initialized. Running migration:${command}...`);

  if (command === 'run') {
    const migrations = await AppDataSource.runMigrations();
    console.log(`Ran migrations:`, migrations.map((m) => m.name).join(', '));
  } else if (command === 'revert') {
    const migration = await AppDataSource.undoLastMigration();
    console.log(`Reverted migration:`, migration?.name ?? 'none');
  } else if (command === 'show') {
    const pending = await AppDataSource.showMigrations();
    console.log(`Pending migrations:`, pending);
  }

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
