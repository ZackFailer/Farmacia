const { execSync } = require('child_process');
const { existsSync, copyFileSync, cpSync, mkdirSync } = require('fs');
const { join } = require('path');

const distDir = join(__dirname, '..', 'dist', 'apps', 'backend');
const sourceDir = join(__dirname, '..', 'apps', 'backend');

// Copy start.js
copyFileSync(join(sourceDir, 'start.js'), join(distDir, 'start.js'));

// Copy certs if they exist
const certsDir = join(sourceDir, 'certs');
if (existsSync(certsDir)) {
  const destCerts = join(distDir, 'certs');
  if (!existsSync(destCerts)) mkdirSync(destCerts, { recursive: true });
  cpSync(certsDir, destCerts, { recursive: true });
}

// Install production dependencies in dist
execSync('npm install --omit=dev --ignore-scripts --no-audit --no-fund', {
  cwd: distDir,
  stdio: 'ignore',
});
