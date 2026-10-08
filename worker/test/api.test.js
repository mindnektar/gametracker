import assert from 'node:assert/strict';
import { after, before, it } from 'node:test';
import { sleep, startWorker } from './support/worker.js';

let worker;

before(async () => {
    worker = await startWorker();
});

after(async () => {
    await worker?.stop();
});

const SYSTEM = 'id name order company';
const DLC = 'id title rating release description youTubeId criticRating timeToBeat';
const GAME = `id title rating release description youTubeId status skipCount updatedAt timeToBeat criticRating country
    completedAt atmosphere mood pacing complexity playerAgency narrativeStructure challengeFocus challengeIntensity
    system { id name } developer { id name } compilation { id title } genres { id name } franchises { id name }
    dlcs { ${DLC} }`;

// Sends a request that has to succeed and returns its data
const request = async (query, variables, options) => {
    const result = await worker.graphql(query, variables, options);

    assert.equal(result.errors, undefined, JSON.stringify(result.errors));

    return result.data;
};

const createSystem = async (name) => (
    (await request(`mutation ($input: CreateSystemInput!) { createSystem(input: $input) { ${SYSTEM} } }`, { input: { name } })).createSystem
);

const createGame = async (input) => (
    (await request(`mutation ($input: CreateGameInput!) { createGame(input: $input) { ${GAME} } }`, {
        input: {
            rating: 80,
            release: 2020,
            description: 'A game',
            youTubeId: 'xyz',
            status: 'planned',
            genres: [],
            ...input,
        },
    })).createGame
);

const updateGame = async (input) => (
    (await request(`mutation ($input: UpdateGameInput!) { updateGame(input: $input) { ${GAME} } }`, { input })).updateGame
);

const games = async () => (await request(`{ games { ${GAME} } }`)).games;

it('lets anyone read but only the admin change things', async () => {
    const mutation = 'mutation { createSystem(input: { name: "Not allowed" }) { id } }';

    for (const key of [null, 'wrong-key']) {
        // eslint-disable-next-line no-await-in-loop
        const result = await worker.graphql(mutation, {}, { key });

        assert.equal(result.errors?.[0]?.message, 'Unauthorized');
    }

    const { systems } = await request('{ systems { name } }', {}, { key: null });

    assert.ok(!systems.some(({ name }) => name === 'Not allowed'));

    // Mutations can't be sent with GET
    const response = await fetch(`${worker.baseUrl}/api?query=${encodeURIComponent(mutation)}`, { headers: { 'X-Auth-Key': 'test-admin-key' } });

    assert.equal(response.status, 405);
});

it('creates games with existing and new relations', async () => {
    const system = await createSystem('Switch');
    const { createGenre: action } = await request('mutation { createGenre(input: { name: "Action" }) { id name } }');
    const game = await createGame({
        title: 'Metroid Dread',
        description: 'It\'s "dreadful".\nÜmlauts, emoji 👾 and a backslash \\ too',
        status: 'completed',
        system: { id: system.id },
        developer: { name: 'MercurySteam' },
        genres: [{ name: 'Metroidvania' }, { id: action.id }],
        franchises: [{ name: 'Metroid' }],
        compilation: { title: 'Metroid Collection' },
        timeToBeat: 8.5,
        criticRating: 88,
        country: 'es',
        completedAt: '2024-05-01',
        atmosphere: 3,
    });

    assert.equal(game.title, 'Metroid Dread');
    assert.equal(game.description, 'It\'s "dreadful".\nÜmlauts, emoji 👾 and a backslash \\ too');
    assert.equal(game.status, 'completed');
    assert.equal(game.timeToBeat, 8.5);
    assert.equal(game.completedAt, '2024-05-01T00:00:00.000Z');
    assert.equal(game.skipCount, 0);
    assert.equal(game.atmosphere, 3);
    assert.equal(game.mood, null);
    assert.deepEqual(game.system, { id: system.id, name: 'Switch' });
    assert.equal(game.developer.name, 'MercurySteam');
    // In the order they were given
    assert.deepEqual(game.genres.map(({ name }) => name), ['Metroidvania', 'Action']);
    assert.equal(game.genres[1].id, action.id);
    assert.deepEqual(game.franchises.map(({ name }) => name), ['Metroid']);
    assert.equal(game.compilation.title, 'Metroid Collection');
    assert.deepEqual(game.dlcs, []);

    // The new developer, genre, franchise and compilation exist on their own
    const lists = await request('{ developers { id } genres { id } franchises { id } compilations { id } }');

    assert.ok(lists.developers.some(({ id }) => id === game.developer.id));
    assert.ok(lists.genres.some(({ id }) => id === game.genres[0].id));
    assert.ok(lists.franchises.some(({ id }) => id === game.franchises[0].id));
    assert.ok(lists.compilations.some(({ id }) => id === game.compilation.id));
    assert.deepEqual((await games()).find(({ id }) => id === game.id), game);
});

it('only changes what an update contains', async () => {
    const system = await createSystem('Game Boy');
    const game = await createGame({
        title: 'Link\'s Awakening',
        system: { id: system.id },
        developer: { name: 'Nintendo' },
        genres: [{ name: 'Adventure' }, { name: 'Puzzle' }],
        franchises: [{ name: 'Zelda' }],
        compilation: { title: 'Zelda Collection' },
        completedAt: '2020-01-02T03:04:05.678Z',
    });

    await sleep(5);

    const rated = await updateGame({ id: game.id, rating: 95, completedAt: null });

    assert.equal(rated.rating, 95);
    assert.equal(rated.completedAt, null);
    assert.ok(rated.updatedAt > game.updatedAt);
    assert.deepEqual({ ...rated, rating: game.rating, completedAt: game.completedAt, updatedAt: game.updatedAt }, game);

    // Relations that are given replace the existing ones
    const relinked = await updateGame({
        id: game.id,
        genres: [{ id: game.genres[1].id }, { name: 'Remake' }],
        franchises: [],
        compilation: null,
        developer: { name: 'Grezzo' },
    });

    assert.deepEqual(relinked.genres.map(({ name }) => name), ['Puzzle', 'Remake']);
    assert.deepEqual(relinked.franchises, []);
    assert.equal(relinked.compilation, null);
    assert.equal(relinked.developer.name, 'Grezzo');
    assert.equal(relinked.title, 'Link\'s Awakening');
    assert.equal(relinked.rating, 95);

    // Invalid dates are rejected and nothing changes
    const invalid = await worker.graphql('mutation ($input: UpdateGameInput!) { updateGame(input: $input) { id } }', {
        input: { id: game.id, title: 'Changed', completedAt: 'not a date' },
    });

    assert.ok(invalid.errors?.length > 0);
    assert.equal((await games()).find(({ id }) => id === game.id).title, 'Link\'s Awakening');
});

it('skips and deletes games', async () => {
    const system = await createSystem('NES');
    const { createGenre: genre } = await request('mutation { createGenre(input: { name: "Platformer" }) { id } }');
    const kept = await createGame({ title: 'Kept', system: { id: system.id }, developer: { name: 'Nintendo R&D1' }, genres: [{ id: genre.id }] });
    const game = await createGame({ title: 'Skipped', system: { id: system.id }, developer: { id: kept.developer.id }, genres: [{ id: genre.id }] });

    await sleep(5);

    const { skipGame: skipped } = await request(`mutation ($id: ID!) { skipGame(id: $id) { ${GAME} } }`, { id: game.id });

    assert.equal(skipped.skipCount, 1);
    assert.ok(skipped.updatedAt > game.updatedAt);
    assert.equal((await request('mutation ($id: ID!) { skipGame(id: $id) { skipCount } }', { id: game.id })).skipGame.skipCount, 2);

    await request(`mutation ($input: CreateDlcInput!) { createDlc(input: $input) { id } }`, {
        input: { gameId: game.id, title: 'DLC', rating: 70, release: 2021, description: 'More', youTubeId: 'dlc' },
    });

    const { deleteGame: deleted } = await request('mutation ($id: ID!) { deleteGame(id: $id) { id title } }', { id: game.id });

    assert.deepEqual(deleted, { id: game.id, title: 'Skipped' });

    const after = await games();

    assert.ok(!after.some(({ id }) => id === game.id));
    // The genre is still there and still linked to the other game
    assert.deepEqual(after.find(({ id }) => id === kept.id).genres.map(({ id }) => id), [genre.id]);

    const { genres } = await request('{ genres { id games { id } } }');

    assert.deepEqual(genres.find(({ id }) => id === genre.id).games, [{ id: kept.id }]);

    const missing = await worker.graphql('mutation ($id: ID!) { deleteGame(id: $id) { id } }', { id: game.id });

    assert.match(missing.errors?.[0]?.message, /No game with id/);
});

it('adds, changes and deletes DLCs', async () => {
    const system = await createSystem('PlayStation 4');
    const game = await createGame({ title: 'Bloodborne', system: { id: system.id }, developer: { name: 'FromSoftware' } });
    const input = { gameId: game.id, title: 'The Old Hunters', rating: 90, release: 2015, description: 'Hunters', youTubeId: 'hunt', timeToBeat: 10.5 };
    const { createDlc: dlc } = await request(`mutation ($input: CreateDlcInput!) { createDlc(input: $input) { ${DLC} game { id title } } }`, { input });

    assert.deepEqual(dlc, { id: dlc.id, title: 'The Old Hunters', rating: 90, release: 2015, description: 'Hunters', youTubeId: 'hunt', criticRating: null, timeToBeat: 10.5, game: { id: game.id, title: 'Bloodborne' } });

    const { updateDlc: updated } = await request(`mutation ($input: UpdateDlcInput!) { updateDlc(input: $input) { ${DLC} } }`, { input: { id: dlc.id, criticRating: 91 } });
    const { game: dlcGame, ...fields } = dlc;

    assert.deepEqual(updated, { ...fields, criticRating: 91 });
    assert.deepEqual((await games()).find(({ id }) => id === game.id).dlcs, [{ ...fields, criticRating: 91 }]);

    await request('mutation ($id: ID!) { deleteDlc(id: $id) { id } }', { id: dlc.id });
    assert.deepEqual((await games()).find(({ id }) => id === game.id).dlcs, []);
});

it('keeps systems in order and deletes their games with them', async () => {
    const [a, b, c] = [await createSystem('A'), await createSystem('B'), await createSystem('C')];

    assert.equal(b.order, a.order + 1);
    assert.equal(c.order, a.order + 2);

    // Moves C to A's position, A and B move down
    const { updateSystemOrder: systems } = await request(`mutation ($input: UpdateSystemOrderInput!) { updateSystemOrder(input: $input) { ${SYSTEM} } }`, {
        input: { id: c.id, order: a.order },
    });
    const orderOf = (id) => systems.find((system) => system.id === id).order;

    assert.deepEqual([orderOf(c.id), orderOf(a.id), orderOf(b.id)], [a.order, a.order + 1, a.order + 2]);

    const { updateSystem: renamed } = await request(`mutation { updateSystem(input: { id: "${a.id}", company: "Acme" }) { ${SYSTEM} } }`);

    assert.deepEqual(renamed, { ...a, order: a.order + 1, company: 'Acme' });

    const game = await createGame({ title: 'On C', system: { id: c.id }, developer: { name: 'Someone' } });

    await request('mutation ($id: ID!) { deleteSystem(id: $id) { id } }', { id: c.id });
    assert.ok(!(await games()).some(({ id }) => id === game.id));
});

it('deletes the games of a deleted developer, but only unlinks deleted genres and franchises', async () => {
    const system = await createSystem('Genesis');
    const game = await createGame({
        title: 'Sonic',
        system: { id: system.id },
        developer: { name: 'Sonic Team' },
        genres: [{ name: 'Speed' }, { name: 'Platforming' }],
        franchises: [{ name: 'Sonic' }],
    });

    await request('mutation ($id: ID!) { deleteGenre(id: $id) { id } }', { id: game.genres[0].id });
    await request('mutation ($id: ID!) { deleteFranchise(id: $id) { id } }', { id: game.franchises[0].id });

    const unlinked = (await games()).find(({ id }) => id === game.id);

    assert.deepEqual(unlinked.genres.map(({ name }) => name), ['Platforming']);
    assert.deepEqual(unlinked.franchises, []);

    const { updateDeveloper: developer } = await request(`mutation { updateDeveloper(input: { id: "${game.developer.id}", name: "SEGA" }) { id name } }`);

    assert.equal(developer.name, 'SEGA');
    assert.equal((await games()).find(({ id }) => id === game.id).developer.name, 'SEGA');

    await request('mutation ($id: ID!) { deleteDeveloper(id: $id) { id } }', { id: game.developer.id });
    assert.ok(!(await games()).some(({ id }) => id === game.id));
});

it('caches the lists until something changes', async () => {
    const query = '{ games { id title } systems { id name } }';
    const read = () => worker.graphql(query, {}, { key: null });
    const first = await read();

    assert.equal(first.cache, null);

    // The response is stored in the background
    let cached;

    for (let attempt = 0; attempt < 50 && cached?.cache !== 'hit'; attempt += 1) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(50);
        // eslint-disable-next-line no-await-in-loop
        cached = await read();
    }

    assert.equal(cached.cache, 'hit');
    assert.deepEqual(cached.data, first.data);

    // A change is visible right away
    const system = await createSystem('Dreamcast');
    const changed = await read();

    assert.equal(changed.cache, null);
    assert.ok(changed.data.systems.some(({ id }) => id === system.id));

    // Requests that aren't admin requests can't invalidate the cache
    await sleep(200);
    assert.equal((await read()).cache, 'hit');

    for (const [body, contentType] of [
        ['mutation { createSystem(input: { name: "X" }) { id } }', 'application/graphql'],
        [JSON.stringify({ query: 'mutation { createSystem(input: { name: "X" }) { id } }' }), 'application/json'],
        ['not json', 'application/json'],
    ]) {
        // eslint-disable-next-line no-await-in-loop
        await fetch(`${worker.baseUrl}/api`, { method: 'POST', headers: { 'Content-Type': contentType }, body });
        // eslint-disable-next-line no-await-in-loop
        assert.equal((await read()).cache, 'hit');
    }

    // Changes in other formats than JSON are noticed too
    const response = await fetch(`${worker.baseUrl}/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/graphql', 'X-Auth-Key': 'test-admin-key' },
        body: 'mutation { createSystem(input: { name: "Saturn" }) { id } }',
    });
    const { data: { createSystem: saturn } } = await response.json();
    const afterRawChange = await read();

    assert.equal(afterRawChange.cache, null);
    assert.ok(afterRawChange.data.systems.some(({ id }) => id === saturn.id));

    // Failed requests and requests with variables are never cached
    for (const [uncached, variables] of [['{ nope }', {}], ['query ($skip: Boolean!) { systems @skip(if: $skip) { id } }', { skip: false }]]) {
        // eslint-disable-next-line no-await-in-loop
        await worker.graphql(uncached, variables);
        // eslint-disable-next-line no-await-in-loop
        await sleep(200);
        // eslint-disable-next-line no-await-in-loop
        assert.equal((await worker.graphql(uncached, variables)).cache, null);
    }
});
