const { execSync } = require('child_process');
const { existsSync, copyFileSync } = require('fs');
const { join } = require('path');

const distDir = join(__dirname, '..', 'dist', 'apps', 'backend');
const sourceDir = join(__dirname, '..', 'apps', 'backend');

// Copy start.js
copyFileSync(join(sourceDir, 'start.js'), join(distDir, 'start.js'));

// Install production dependencies in dist
execSync('npm install --omit=dev --ignore-scripts --no-audit --no-fund', {
  cwd: distDir,
  stdio: 'ignore',
});
