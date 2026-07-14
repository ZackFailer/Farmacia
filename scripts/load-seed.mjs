import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DB_PATH || join(__dirname, '..', 'apps', 'backend', 'data', 'farmacia.sqlite');

const SEED_TABLES = ['medicamento', 'catalogo_patologia', 'catalogo_necesidad', 'usuario', 'configuracion'];

function pgEscape(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

function boolToPg(val) {
  if (val === null || val === undefined) return 'NULL';
  const n = Number(val);
  return n === 1 || n === true ? 'TRUE' : 'FALSE';
}

function generateInserts(rows, columns, table) {
  const colNames = columns.map((c) => `"${c}"`).join(', ');
  const inserts = [];

  for (const row of rows) {
    const colVals = row
      .map((val, idx) => {
        const col = columns[idx];
        if (col === 'activo' || col === 'es_vital' || col === 'es_recien_nacido' ||
            col === 'es_damnificado' || col === 'tiene_carga_familiar' ||
            col === 'tiene_discapacidad_motora' || col === 'suplida') {
          return boolToPg(val);
        }
        if (typeof val === 'number' && (col.includes('activo') || col.includes('es_') || col.includes('tiene_') || col === 'suplida')) {
          return boolToPg(val);
        }
        if (val instanceof Uint8Array) {
          return `decode('${Buffer.from(val, 'utf-8').toString('hex')}', 'hex')`;
        }
        return pgEscape(val);
      })
      .join(', ');
    inserts.push(`INSERT INTO "${table}" (${colNames}) VALUES (${colVals});`);
  }
  return inserts;
}

async function main() {
  if (!existsSync(DB_PATH)) {
    console.error(`No se encuentra SQLite en: ${DB_PATH}`);
    process.exit(1);
  }

  let initSqlJs;
  try {
    initSqlJs = (await import('sql.js')).default;
  } catch {
    console.error(`
  ERROR: Falta la dependencia "sql.js". Instálela:
    npm install --save-dev sql.js
`);
    process.exit(1);
  }

  const SQL = await initSqlJs();
  const buffer = readFileSync(DB_PATH);
  const sqliteDb = new SQL.Database(buffer);

  const dbUrl = process.env.DATABASE_URL;
  const pgConfig = dbUrl
    ? { connectionString: dbUrl }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USERNAME || process.env.PGUSER || 'postgres',
        password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'postgres',
        database: process.env.DB_NAME || process.env.PGDATABASE || 'farmacia_dev',
      };

  const pool = new pg.Pool(pgConfig);
  const client = await pool.connect();

  try {
    for (const table of SEED_TABLES) {
      const rows = sqliteDb.exec(`SELECT * FROM "${table}"`);
      if (rows.length === 0) {
        console.log(`  Table "${table}": no data, skipping.`);
        continue;
      }

      const { columns, values } = rows[0];
      console.log(`  Table "${table}": ${values.length} rows`);

      await client.query(`DELETE FROM "${table}"`);
      await client.query(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), 1, false)`);

      const inserts = generateInserts(values, columns, table);
      for (const sql of inserts) {
        await client.query(sql);
      }
    }

    console.log('\nSeed data loaded successfully.');
  } finally {
    client.release();
    await pool.end();
    sqliteDb.close();
  }
}

main().catch((err) => {
  console.error('Seed load failed:', err.message);
  process.exit(1);
});
