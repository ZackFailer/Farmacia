const { execSync } = require('child_process');
try {
  const result = execSync('npx ts-node -e "console.log(require.resolve(\'./src/app/common/node-sqlite-compat\', { paths: [\'.\\\'] }))" 2>&1', {
    cwd: 'C:\\farmacia\\Farmacia-master\\Farmacia-master\\apps\\backend',
    encoding: 'utf-8',
    shell: true,
    timeout: 15000
  });
  console.log('Success:', result);
} catch(e) {
  console.log('stdout:', e.stdout || '');
  console.log('stderr:', e.stderr || '');
  console.log('Error:', e.message);
}
