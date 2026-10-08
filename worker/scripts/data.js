import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const workerDir = join(dirname(fileURLToPath(import.meta.url)), '..');

// Tables in the order they have to be filled in, because of the foreign keys
export const TABLES = ['system', 'developer', 'compilation', 'genre', 'franchise', 'game', 'dlc', 'genre_game_xref', 'game_franchise_xref'];

export const PRIMARY_KEYS = {
    genre_game_xref: ['genre_id', 'game_id'],
    game_franchise_xref: ['game_id', 'franchise_id'],
};

export const primaryKey = (table) => PRIMARY_KEYS[table] || ['id'];

// Reads either an export directory with one JSON array per table (what scripts/export-heroku.sh
// writes) or a backup file with all tables ({ tables: { game: [...], ... } }, what the daily
// backup writes to R2).
export const readSource = (source) => {
    if (statSync(source).isDirectory()) {
        return Object.fromEntries(TABLES.map((table) => {
            const file = join(source, `${table}.json`);

            if (!existsSync(file)) {
                throw new Error(`${file} is missing`);
            }

            return [table, JSON.parse(readFileSync(file, 'utf8'))];
        }));
    }

    const { tables } = JSON.parse(readFileSync(source, 'utf8'));

    TABLES.forEach((table) => {
        if (!Array.isArray(tables?.[table])) {
            throw new Error(`${source} has no ${table} table`);
        }
    });

    return tables;
};

export const wrangler = (args, options = {}) => execFileSync(
    join(workerDir, 'node_modules/.bin/wrangler'),
    args,
    { cwd: workerDir, encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024, env: { ...process.env, WRANGLER_SEND_METRICS: 'false' }, ...options },
);

// The wrangler arguments for the database to use: --remote (the real one) or --local (the one of
// `wrangler dev`, in .wrangler or in the directory given with --persist-to)
export const target = (args) => {
    if (args.includes('--remote')) {
        return ['--remote'];
    }

    if (args.includes('--local')) {
        const persistTo = args.indexOf('--persist-to');

        return persistTo === -1 ? ['--local'] : ['--local', '--persist-to', args[persistTo + 1]];
    }

    throw new Error('Pass --local (wrangler dev database) or --remote (the real one)');
};

export const describe = (location) => `${location[0].slice(2)} database`;

export const query = (location, sql) => {
    const output = wrangler(['d1', 'execute', 'gametracker', ...location, '--json', '--command', sql]);

    return JSON.parse(output)[0].results;
};
