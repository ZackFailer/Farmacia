const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');
const { chdir } = require('process');

const projectRoot = join(__dirname, '..', '..', '..');
const dataDir = join(projectRoot, 'apps', 'backend', 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

if (!process.env.DB_PATH) {
  process.env.DB_PATH = join(dataDir, 'farmacia.sqlite');
}

// Ensure parent directory of DB_PATH exists (handles Railway volume mount)
const dbDir = join(process.env.DB_PATH, '..');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

chdir(projectRoot);

require('./main.js');
