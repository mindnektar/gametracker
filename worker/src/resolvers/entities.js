import { all, first, insert, newId, now, remove, update } from '../db';
import { loadGames } from '../games';

// Developers, genres, franchises and compilations all work the same way: a name (or title) and
// the games that reference them.
const entity = ({ table, type, plural, nameKey = 'name', gamesOf }) => {
    const capitalized = type[0].toUpperCase() + type.slice(1);
    const load = (db, id) => first(db, `SELECT * FROM ${table} WHERE id = ?`, id);

    return {
        Query: {
            [plural]: (parent, variables, { db }) => all(db, `SELECT * FROM ${table} ORDER BY rowid`),
        },
        Mutation: {
            [`create${capitalized}`]: async (parent, { input }, { db }) => {
                const id = newId();
                const timestamp = now();

                await insert(db, table, { id, [nameKey]: input[nameKey], createdAt: timestamp, updatedAt: timestamp }).run();

                return load(db, id);
            },
            [`update${capitalized}`]: async (parent, { input }, { db }) => {
                const values = { updatedAt: now() };

                if (nameKey in input) {
                    values[nameKey] = input[nameKey];
                }

                await update(db, table, input.id, values).run();

                return load(db, input.id);
            },
            // Foreign keys cascade like before: deleting a developer or a compilation deletes its
            // games, deleting a genre or franchise only removes it from its games.
            [`delete${capitalized}`]: (parent, { id }, { db }) => remove(db, table, id),
        },
        [capitalized]: {
            games: async (item, variables, { db }) => (await loadGames(db)).filter((game) => gamesOf(game, item.id)),
        },
    };
};

export const developers = entity({
    table: 'developer',
    type: 'developer',
    plural: 'developers',
    gamesOf: (game, id) => game.developerId === id,
});

export const compilations = entity({
    table: 'compilation',
    type: 'compilation',
    plural: 'compilations',
    nameKey: 'title',
    gamesOf: (game, id) => game.compilationId === id,
});

export const genres = entity({
    table: 'genre',
    type: 'genre',
    plural: 'genres',
    gamesOf: (game, id) => game.genres.some((genre) => genre.id === id),
});

export const franchises = entity({
    table: 'franchise',
    type: 'franchise',
    plural: 'franchises',
    gamesOf: (game, id) => game.franchises.some((franchise) => franchise.id === id),
});
