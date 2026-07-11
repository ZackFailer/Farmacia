const { execSync } = require('child_process');
const script = `
async function test() {
  try {
    const m = await import('C:\\\\farmacia\\\\Farmacia-master\\\\Farmacia-master\\\\apps\\\\backend\\\\src\\\\app\\\\common\\\\node-sqlite-compat');
    console.log('OK - module loaded');
  } catch(e) {
    console.log('FAIL:', e.message);
  }
}
test();
`;

try {
  const result = execSync('npx ts-node -e "' + script.replace(/"/g, '\\"') + '"', {
    cwd: 'C:\\farmacia\\Farmacia-master\\Farmacia-master',
    encoding: 'utf-8',
    shell: true,
    timeout: 20000
  });
  console.log(result);
} catch(e) {
  console.log('stdout:', e.stdout || '');
  console.log('stderr:', e.stderr || '');
}
