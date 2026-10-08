import { pruneCache } from './cache';

// In the order the rows have to be restored in, because of the foreign keys
export const TABLES = ['system', 'developer', 'compilation', 'genre', 'franchise', 'game', 'dlc', 'genre_game_xref', 'game_franchise_xref'];

const KEEP_DAYS = 30;

// Writes every row of every table to R2 as backups/<date>.json, in the same format the migration
// from Postgres used ({ tables: { game: [{ id, title, ... }], ... } }), so scripts/import.js can
// restore it. Runs daily (see triggers in wrangler.jsonc) and keeps the last 30 days.
export const backup = async (env) => {
    const tables = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const table of TABLES) {
        // In the order the rows were added, which restoring preserves
        // eslint-disable-next-line no-await-in-loop
        tables[table] = (await env.DB.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()).results;
    }

    const createdAt = new Date().toISOString();
    const key = `backups/${createdAt.slice(0, 10)}.json`;

    await env.STORAGE.put(key, JSON.stringify({ createdAt, tables }), {
        httpMetadata: { contentType: 'application/json' },
    });

    const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000;
    let cursor;

    do {
        // eslint-disable-next-line no-await-in-loop
        const list = await env.STORAGE.list({ prefix: 'backups/', cursor });
        const outdated = list.objects.filter(({ uploaded }) => uploaded.getTime() < cutoff).map(({ key: name }) => name);

        if (outdated.length > 0) {
            // eslint-disable-next-line no-await-in-loop
            await env.STORAGE.delete(outdated);
        }

        cursor = list.truncated ? list.cursor : undefined;
    } while (cursor);

    await pruneCache(env);

    console.log(`Backup written to ${key}: ${Object.entries(tables).map(([table, rows]) => `${rows.length} ${table}`).join(', ')}`);
};
