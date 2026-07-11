const { join } = require('path');
const { DatabaseSync } = require('node:sqlite');
const conn = new DatabaseSync(join('apps', 'backend', 'data', 'farmacia.sqlite'));

const columns = conn.prepare("PRAGMA table_info(paciente_necesidad)").all();
console.log('=== Columnas de paciente_necesidad ===');
for (const c of columns) {
  console.log(`  ${c.name} (${c.type}) ${c.notnull ? 'NOT NULL' : 'NULL'} default=${c.dflt_value}`);
}

const migraciones = conn.prepare("SELECT * FROM migrations ORDER BY id").all();
console.log('\n=== Migraciones ejecutadas ===');
for (const m of migraciones) {
  console.log(`  ${m.id}: ${m.name} (timestamp: ${m.timestamp})`);
}

const count = conn.prepare('SELECT COUNT(*) as c FROM paciente_necesidad').get();
console.log(`\nRegistros en paciente_necesidad: ${count.c}`);

conn.close();
