/**
 * Exporta datos de SQLite a sentencias INSERT para PostgreSQL.
 * Lee las 5 tablas semilla del archivo farmacia.sqlite existente
 * y genera INSERTs PostgreSQL-compatibles.
 *
 * Uso: node scripts/exportar-seed.js
 *
 * Variables de entorno:
 *   DB_PATH — ruta al archivo SQLite (default: apps/backend/data/farmacia.sqlite)
 *   REASSIGN_USER_IDS — si es "true", reinicia secuencia de usuario.id (default: false)
 */

const { join } = require('node:path');
const { readFileSync, existsSync } = require('node:fs');

const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'apps', 'backend', 'data', 'farmacia.sqlite');
const REASSIGN_IDS = process.env.REASSIGN_USER_IDS === 'true';

if (!existsSync(DB_PATH)) {
  console.error(`No se encuentra la base de datos SQLite en: ${DB_PATH}`);
  process.exit(1);
}

// Cargar sql.js (SQLite compilado a WASM para Node)
let initSqlJs;
try {
  initSqlJs = require('sql.js');
} catch {
  console.error(`
  ERROR: Falta la dependencia "sql.js". Instálela:
    npm install --save-dev sql.js
`);
  process.exit(1);
}

// Funciones helpers de escape para PostgreSQL
function pgEscape(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

function pgEscapeByteA(val) {
  if (val === null || val === undefined) return 'NULL';
  const hex = Buffer.from(val, 'utf-8').toString('hex');
  return `decode('${hex}', 'hex')`;
}

function boolToPg(val) {
  if (val === null || val === undefined) return 'NULL';
  const n = Number(val);
  return n === 1 || n === true ? 'TRUE' : 'FALSE';
}

const TABLES = ['medicamento', 'catalogo_patologia', 'catalogo_necesidad', 'usuario', 'configuracion'];

async function main() {
  const SQL = await initSqlJs();
  const buffer = readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);

  console.log('-- Seed data exported from SQLite');
  console.log(`-- Source: ${DB_PATH}`);
  console.log(`-- Date: ${new Date().toISOString()}`);
  console.log();

  for (const table of TABLES) {
    const rows = db.exec(`SELECT * FROM "${table}"`);

    if (rows.length === 0) {
      console.log(`-- Table "${table}": no data`);
      console.log();
      continue;
    }

    const { columns, values } = rows[0];
    console.log(`-- Table: "${table}" (${values.length} rows)`);

    // Reiniciar secuencia antes de insertar
    console.log(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), 1, false);`);
    console.log();

    for (const row of values) {
      const colNames = columns.map((c) => `"${c}"`).join(', ');
      const colVals = row
        .map((val, idx) => {
          const col = columns[idx];

          // Boolean columns
          if (col === 'activo' || col === 'es_vital' || col === 'es_recien_nacido' ||
              col === 'es_damnificado' || col === 'tiene_carga_familiar' ||
              col === 'tiene_discapacidad_motora' || col === 'suplida') {
            return boolToPg(val);
          }

          // Timestamp columns — usar NOW() para valores por defecto
          if ((col === 'created_at' || col === 'updated_at') && val === null) {
            return 'NULL';
          }

          // Handle recien_nacido and es_vital which are stored as 0/1
          if (typeof val === 'number' && (col.includes('activo') || col.includes('es_') || col.includes('tiene_') || col === 'suplida')) {
            return boolToPg(val);
          }

          // BLOBs / buffers
          if (val instanceof Uint8Array) {
            return pgEscapeByteA(val);
          }

          return pgEscape(val);
        })
        .join(', ');

      console.log(`INSERT INTO "${table}" (${colNames}) VALUES (${colVals});`);
    }

    console.log();
    console.log(`UPDATE "${table}" SET id = DEFAULT WHERE id = 0; -- force serial on any zero-id row`);
    console.log();
  }

  db.close();
  console.log('-- Export complete.');
}

main().catch((err) => {
  console.error('Export failed:', err.message);
  process.exit(1);
});
