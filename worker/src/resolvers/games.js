import { first, insert, newId, now, remove, update } from '../db';
import { loadGame, loadGames } from '../games';
import fetchYouTubeData from '../services/youTube';
import fetchHowLongToBeatData from '../services/howlongtobeat';
import fetchMetacriticData from '../services/metacritic';
import { fetchGameInfo, fetchDescriptorData } from '../services/ai';

const SCALAR_FIELDS = [
    'title', 'rating', 'release', 'description', 'youTubeId', 'status', 'timeToBeat', 'criticRating', 'country',
    'completedAt', 'atmosphere', 'mood', 'pacing', 'complexity', 'playerAgency', 'narrativeStructure', 'challengeFocus',
    'challengeIntensity',
];

const pick = (input, keys) => Object.fromEntries(keys.filter((key) => key in input).map((key) => [key, input[key]]));

// Relation inputs either reference an existing entry ({ id }) or name a new one ({ name } or
// { title }), which is created on the fly, like Objection's insertGraph/upsertGraph with `relate`
// did. Statements are collected so everything is written in one atomic batch.
const relateOne = (db, statements, table, input, nameKey = 'name') => {
    if (!input) {
        return null;
    }

    if (input.id) {
        return input.id;
    }

    const id = newId();
    const timestamp = now();

    statements.push(insert(db, table, { id, [nameKey]: input[nameKey], createdAt: timestamp, updatedAt: timestamp }));

    return id;
};

const relateMany = (db, statements, table, inputs) => (
    inputs.filter(Boolean).map((input) => relateOne(db, statements, table, input))
);

const linkStatements = (db, gameId, genreIds, franchiseIds) => [
    ...(genreIds || []).map((genreId) => insert(db, 'genre_game_xref', { genreId, gameId })),
    ...(franchiseIds || []).map((franchiseId) => insert(db, 'game_franchise_xref', { gameId, franchiseId })),
];

export default {
    Query: {
        games: (parent, variables, { db }) => loadGames(db),
    },
    Mutation: {
        createGame: async (parent, { input }, { db }) => {
            const statements = [];
            const id = newId();
            const timestamp = now();
            const systemId = relateOne(db, statements, 'system', input.system);
            const developerId = relateOne(db, statements, 'developer', input.developer);
            const compilationId = relateOne(db, statements, 'compilation', input.compilation, 'title');
            const genreIds = relateMany(db, statements, 'genre', input.genres || []);
            const franchiseIds = relateMany(db, statements, 'franchise', input.franchises || []);

            statements.push(insert(db, 'game', {
                id,
                ...pick(input, SCALAR_FIELDS),
                systemId,
                developerId,
                compilationId,
                createdAt: timestamp,
                updatedAt: timestamp,
            }));
            statements.push(...linkStatements(db, id, genreIds, franchiseIds));

            await db.batch(statements);

            return loadGame(db, id);
        },
        // Only changes what's in the input. Relations that are given replace the existing ones.
        updateGame: async (parent, { input }, { db }) => {
            const statements = [];
            const values = { ...pick(input, SCALAR_FIELDS), updatedAt: now() };

            if ('system' in input) {
                values.systemId = relateOne(db, statements, 'system', input.system);
            }

            if ('developer' in input) {
                values.developerId = relateOne(db, statements, 'developer', input.developer);
            }

            if ('compilation' in input) {
                values.compilationId = relateOne(db, statements, 'compilation', input.compilation, 'title');
            }

            const genreIds = 'genres' in input && input.genres ? relateMany(db, statements, 'genre', input.genres) : null;
            const franchiseIds = 'franchises' in input && input.franchises ? relateMany(db, statements, 'franchise', input.franchises) : null;

            statements.push(update(db, 'game', input.id, values));

            if (genreIds) {
                statements.push(db.prepare('DELETE FROM genre_game_xref WHERE game_id = ?').bind(input.id));
            }

            if (franchiseIds) {
                statements.push(db.prepare('DELETE FROM game_franchise_xref WHERE game_id = ?').bind(input.id));
            }

            statements.push(...linkStatements(db, input.id, genreIds, franchiseIds));

            await db.batch(statements);

            return loadGame(db, input.id);
        },
        fetchGameData: async (parent, { input }, { env }) => {
            const [aiData, youTubeData, hltbData, metacriticData] = await Promise.all([
                fetchGameInfo(env, input),
                fetchYouTubeData(env, input),
                fetchHowLongToBeatData(input),
                fetchMetacriticData(env, input),
            ]);

            return {
                ...aiData,
                ...youTubeData,
                ...hltbData,
                ...metacriticData,
            };
        },
        fetchDescriptorData: async (parent, { input }, { db, env }) => {
            const game = await loadGame(db, input.gameId);

            return fetchDescriptorData(env, { ...input, game });
        },
        skipGame: async (parent, { id }, { db }) => {
            await db
                .prepare('UPDATE game SET skip_count = skip_count + 1, updated_at = ? WHERE id = ?')
                .bind(now(), id)
                .run();

            return loadGame(db, id);
        },
        deleteGame: (parent, { id }, { db }) => remove(db, 'game', id),
    },
    Game: {
        // Only needed if a game is loaded without its relations, e.g. the one returned by deleteGame.
        // Preloaded relations are returned as they are, not wrapped in a promise, which saves CPU
        // with over a thousand games and keeps the fields of each game in the order of the query.
        system: (game, variables, { db }) => (
            game.system !== undefined ? game.system : first(db, 'SELECT * FROM system WHERE id = ?', game.systemId)
        ),
        developer: (game, variables, { db }) => (
            game.developer !== undefined ? game.developer : first(db, 'SELECT * FROM developer WHERE id = ?', game.developerId)
        ),
        compilation: (game, variables, { db }) => {
            if (game.compilation !== undefined) {
                return game.compilation;
            }

            return game.compilationId ? first(db, 'SELECT * FROM compilation WHERE id = ?', game.compilationId) : null;
        },
        genres: (game, variables, { db }) => (
            game.genres !== undefined ? game.genres : loadGame(db, game.id).then(({ genres }) => genres)
        ),
        franchises: (game, variables, { db }) => (
            game.franchises !== undefined ? game.franchises : loadGame(db, game.id).then(({ franchises }) => franchises)
        ),
        dlcs: (game, variables, { db }) => (
            game.dlcs !== undefined ? game.dlcs : loadGame(db, game.id).then(({ dlcs }) => dlcs)
        ),
    },
};
