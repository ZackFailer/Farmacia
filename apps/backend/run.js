#!/usr/bin/env node
const { chdir } = require('process');

const serverDir = __dirname;
chdir(serverDir);

console.log('[run.js] Starting ApoPharma backend...');

require('./dist/main.js');
