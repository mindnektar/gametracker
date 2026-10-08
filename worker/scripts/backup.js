// Saves a copy of the real database in backups/ (next to worker/, never committed), in the same
// format as the daily backups in R2, so scripts/import.js can restore it:
//
//   node scripts/backup.js [--local]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TABLES, describe, query, workerDir } from './data.js';

const location = process.argv.includes('--local') ? ['--local'] : ['--remote'];
const createdAt = new Date().toISOString();
const tables = Object.fromEntries(TABLES.map((table) => [table, query(location, `SELECT * FROM ${table} ORDER BY rowid`)]));
const dir = join(workerDir, '..', 'backups');
const file = join(dir, `d1-${createdAt.slice(0, 19).replace(/:/g, '')}Z.json`);

mkdirSync(dir, { recursive: true });
writeFileSync(file, JSON.stringify({ createdAt, tables }));
console.log(`Saved ${TABLES.map((table) => `${tables[table].length} ${table}`).join(', ')} from the ${describe(location)} to`);
console.log(file);
