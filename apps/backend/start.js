const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');
const { chdir } = require('process');

const projectRoot = join(__dirname, '..', '..', '..');
const dataDir = join(projectRoot, 'apps', 'backend', 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

process.env.DB_PATH = join(dataDir, 'farmacia.sqlite');

chdir(projectRoot);

require('./main.js');
