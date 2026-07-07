#!/usr/bin/env node
const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');
const { chdir } = require('process');

const serverDir = __dirname;

const dataDir = join(serverDir, 'dist', 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

process.env.DB_PATH = join(dataDir, 'farmacia.sqlite');

chdir(serverDir);

console.log('[run.js] Server directory:', serverDir);
console.log('[run.js] Database path:', process.env.DB_PATH);
console.log('[run.js] Starting ApoPharma backend...');

require('./dist/main.js');
