const { join } = require('path');
const { DatabaseSync } = require('node:sqlite');

function checkDB(label, dbPath) {
  try {
    const conn = new DatabaseSync(dbPath);
    const tables = conn.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('sqlite_sequence', 'migrations') ORDER BY name").all();
    console.log('=== ' + label + ' (' + require('fs').statSync(dbPath).size + ' bytes) ===');
    const results = {};
    for (const t of tables) {
      const count = conn.prepare('SELECT COUNT(*) as c FROM "' + t.name + '"').get();
      results[t.name] = count.c;
      console.log('  ' + t.name + ': ' + count.c);
    }
    conn.close();
    return results;
  } catch(e) {
    console.log('ERROR ' + label + ':', e.message);
    return null;
  }
}

const dist = checkDB('dist (original)', join('dist', 'apps', 'backend', 'data', 'farmacia.sqlite'));
const apps = checkDB('apps/backend (copia)', join('apps', 'backend', 'data', 'farmacia.sqlite'));

if (dist && apps) {
  const keys = Object.keys(dist);
  let match = true;
  for (const k of keys) {
    if (dist[k] !== apps[k]) {
      console.log('DIFERENCIA en ' + k + ': dist=' + dist[k] + ' apps=' + apps[k]);
      match = false;
    }
  }
  if (match) console.log('\n✅ Las bases de datos son IDENTICAS');
} else {
  console.log('\n❌ No se pueden comparar');
}
