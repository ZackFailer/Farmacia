const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');
const { chdir } = require('process');

const serverDir = __dirname;
const dataDir = join(serverDir, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

process.env.DB_PATH = join(dataDir, 'farmacia.sqlite');

chdir(serverDir);

require('./main.js');
