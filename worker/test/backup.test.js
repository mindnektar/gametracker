import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, it } from 'node:test';
import { createState, runScript, sleep, startWorker, wrangler } from './support/worker.js';

let worker;
let dir;

before(async () => {
    worker = await startWorker();
    dir = await mkdtemp(join(tmpdir(), 'gametracker-backup-'));
});

after(async () => {
    await worker?.stop();
    await rm(dir, { recursive: true, force: true });
});

const request = async (query, variables) => {
    const result = await worker.graphql(query, variables);

    assert.equal(result.errors, undefined, JSON.stringify(result.errors));

    return result.data;
};

const addGames = async () => {
    const { createSystem: system } = await request('mutation { createSystem(input: { name: "PC" }) { id } }');

    for (const [index, title] of ['Disco Elysium', 'Outer Wilds', 'Return of the Obra Dinn'].entries()) {
        // eslint-disable-next-line no-await-in-loop
        const { createGame: game } = await request('mutation ($input: CreateGameInput!) { createGame(input: $input) { id } }', {
            input: {
                title,
                rating: 90 + index,
                release: 2018 + index,
                description: `It's "${title}".\nWith ümlauts, emoji 👾 and a backslash \\`,
                youTubeId: `video${index}`,
                status: 'completed',
                system: { id: system.id },
                developer: { name: `Developer ${index}` },
                genres: [{ name: `Genre ${index}` }, { name: `Other genre ${index}` }],
                franchises: index === 0 ? [{ name: 'Elysium' }] : [],
                compilation: index === 1 ? { title: 'Compilation' } : null,
                timeToBeat: 12.5,
                completedAt: '2024-05-01',
            },
        });

        // eslint-disable-next-line no-await-in-loop
        await request('mutation ($input: CreateDlcInput!) { createDlc(input: $input) { id } }', {
            input: { gameId: game.id, title: `${title} DLC`, rating: 80, release: 2024, description: 'More', youTubeId: 'dlc' },
        });
    }
};

it('backs up every table to R2 every day, and the backup can be restored', async () => {
    await addGames();

    // What the cron trigger does every day
    await fetch(`${worker.baseUrl}/cdn-cgi/local/scheduled?cron=${encodeURIComponent('0 3 * * *')}`);

    let key;

    for (let attempt = 0; attempt < 100 && !key; attempt += 1) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(100);
        [, key] = worker.output().match(/Backup written to (backups\/\d{4}-\d{2}-\d{2}\.json)/) || [];
    }

    assert.ok(key, `No backup written:\n${worker.output()}`);

    // Another run on the same day leaves it alone
    await fetch(`${worker.baseUrl}/cdn-cgi/local/scheduled?cron=${encodeURIComponent('0 3 * * *')}`);

    for (let attempt = 0; attempt < 100 && !worker.output().includes(`Backup ${key} exists already`); attempt += 1) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(100);
    }

    assert.match(worker.output(), new RegExp(`Backup ${key} exists already`));

    const file = join(dir, 'backup.json');

    wrangler(['r2', 'object', 'get', `gametracker/${key}`, '--local', '--persist-to', worker.state, '--file', file]);

    const backup = JSON.parse(await readFile(file, 'utf8'));

    assert.equal(backup.tables.game.length, 3);
    assert.equal(backup.tables.genre_game_xref.length, 6);
    assert.equal(backup.tables.dlc.length, 3);

    // The backup matches the database, and restoring it into an empty one gives the same data, in
    // the same order
    assert.equal(runScript('verify.js', [file, '--local', '--persist-to', worker.state]).code, 0);

    const restored = await createState();

    try {
        const imported = runScript('import.js', [file, '--local', '--persist-to', restored]);

        assert.equal(imported.code, 0, imported.output);

        const verified = runScript('verify.js', [file, '--local', '--persist-to', restored]);

        assert.equal(verified.code, 0, verified.output);
        assert.match(verified.output, /Every row and column matches, in the same order/);

        // Importing again needs --replace
        const refused = runScript('import.js', [file, '--local', '--persist-to', restored]);

        assert.equal(refused.code, 1);
        assert.match(refused.output, /already has 3 games/);

        // Differences are found: a changed value, a missing row and a different order
        const changed = structuredClone(backup);

        changed.tables.game[0].rating = 1;
        changed.tables.dlc.pop();
        changed.tables.genre.reverse();
        await writeFile(join(dir, 'changed.json'), JSON.stringify(changed));

        const different = runScript('verify.js', [join(dir, 'changed.json'), '--local', '--persist-to', restored]);

        assert.equal(different.code, 1);
        assert.match(different.output, /rating is 90, expected 1/);
        assert.match(different.output, /dlc .*: not in the source/);
        assert.match(different.output, /genre: the rows are not in the order of the source/);

        // --replace makes the database exactly like the source again
        assert.equal(runScript('import.js', [join(dir, 'changed.json'), '--local', '--persist-to', restored, '--replace']).code, 0);
        assert.equal(runScript('verify.js', [join(dir, 'changed.json'), '--local', '--persist-to', restored]).code, 0);
    } finally {
        await rm(restored, { recursive: true, force: true });
    }
});

it('reads exports with one file per table as well', async () => {
    const backupFile = join(dir, 'backup.json');
    const { tables } = JSON.parse(await readFile(backupFile, 'utf8'));
    const exportDir = await mkdtemp(join(dir, 'export-'));

    await Promise.all(Object.entries(tables).map(([table, rows]) => writeFile(join(exportDir, `${table}.json`), JSON.stringify(rows))));

    assert.equal(runScript('verify.js', [exportDir, '--local', '--persist-to', worker.state]).code, 0);
});
