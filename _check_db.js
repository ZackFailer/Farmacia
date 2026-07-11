const { join } = require('path');
const { DatabaseSync } = require('node:sqlite');

function checkDB(label, dbPath) {
  try {
    const conn = new DatabaseSync(dbPath);
    conn.exec('PRAGMA journal_mode=WAL');
    conn.exec('PRAGMA wal_checkpoint(TRUNCATE)');

    const tables = conn.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log('=== ' + label + ' ===');
    console.log('Tablas:', tables.map(t => t.name).join(', '));

    for (const t of tables) {
      if (t.name === 'migrations') continue;
      const count = conn.prepare('SELECT COUNT(*) as c FROM "' + t.name + '"').get();
      console.log('  ' + t.name + ': ' + count.c + ' registros');
    }
    console.log('Tamaño archivo:', require('fs').statSync(dbPath).size + ' bytes');
    conn.close();
    console.log('');
  } catch(e) {
    console.log('ERROR ' + label + ':', e.message);
  }
}

checkDB('apps/backend/data', join('apps', 'backend', 'data', 'farmacia.sqlite'));
checkDB('dist/apps/backend/data', join('dist', 'apps', 'backend', 'data', 'farmacia.sqlite'));
