// Loads an export (or a backup) into D1:
//
//   node scripts/import.js <export directory or backup file> --local|--remote [--replace]
//
// Without --replace it refuses to write into a database that already has games in it. With
// --replace it deletes everything first, so the database ends up exactly like the source. The rows
// are added in the order of the source, which is the order the API returns them in.
// Run scripts/verify.js afterwards.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TABLES, describe, query, readSource, target, wrangler } from './data.js';

const literal = (value) => {
    if (value === null || value === undefined) {
        return 'NULL';
    }

    if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
            throw new Error(`Can't store ${value}`);
        }

        return String(value);
    }

    if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`;
    }

    throw new Error(`Unexpected value ${JSON.stringify(value)}`);
};

const [source, ...args] = process.argv.slice(2);

if (!source) {
    console.error('Usage: node scripts/import.js <export directory or backup file> --local|--remote [--replace]');
    process.exit(1);
}

const location = target(args);
const replace = args.includes('--replace');
const tables = readSource(source);
const [{ count: existingGames }] = query(location, 'SELECT COUNT(*) AS count FROM game');

if (existingGames > 0 && !replace) {
    console.error(`The ${describe(location)} already has ${existingGames} games. Pass --replace to overwrite it.`);
    process.exit(1);
}

const statements = [];

if (replace) {
    [...TABLES].reverse().forEach((table) => statements.push(`DELETE FROM ${table};`));
}

TABLES.forEach((table) => {
    tables[table].forEach((row) => {
        const columns = Object.keys(row);

        statements.push(
            `INSERT INTO ${table} (${columns.map((column) => `"${column}"`).join(', ')}) VALUES (${columns.map((column) => literal(row[column])).join(', ')});`,
        );
    });
});

// Make sure cached API responses from before the import are never served
statements.push("UPDATE meta SET value = value + 1 WHERE key = 'data_version';");

const file = join(mkdtempSync(join(tmpdir(), 'gametracker-import-')), 'import.sql');

writeFileSync(file, statements.join('\n'));
console.log(`Importing ${TABLES.map((table) => `${tables[table].length} ${table}`).join(', ')} into the ${describe(location)}...`);
wrangler(['d1', 'execute', 'gametracker', ...location, '--file', file, '--yes'], { stdio: 'inherit' });
console.log('Done. Now run: node scripts/verify.js', source, ...location);
