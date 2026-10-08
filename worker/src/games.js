import { all } from './db';

const groupBy = (rows, key) => {
    const groups = new Map();

    rows.forEach((row) => {
        if (!groups.has(row[key])) {
            groups.set(row[key], []);
        }

        groups.get(row[key]).push(row);
    });

    return groups;
};

const byId = (rows) => new Map(rows.map((row) => [row.id, row]));

// Loads games with all their relations in a fixed number of queries. Without ids, it loads all
// games, which is what the list needs on every page load.
//
// Rows come in the order they were added (rowid), which is the order the old server returned them
// in (Postgres' storage order, which the migration preserved). The client shows a game's genres
// and DLCs in that order.
export const loadGames = async (db, ids) => {
    const filter = ids ? `WHERE id IN (${ids.map(() => '?').join(', ')})` : '';
    const gameFilter = ids ? `WHERE game_id IN (${ids.map(() => '?').join(', ')})` : '';
    const params = ids || [];
    const [games, systems, developers, compilations, genres, franchises, dlcs, genreLinks, franchiseLinks] = await Promise.all([
        all(db, `SELECT * FROM game ${filter} ORDER BY rowid`, ...params),
        all(db, 'SELECT * FROM system ORDER BY rowid'),
        all(db, 'SELECT * FROM developer ORDER BY rowid'),
        all(db, 'SELECT * FROM compilation ORDER BY rowid'),
        all(db, 'SELECT * FROM genre ORDER BY rowid'),
        all(db, 'SELECT * FROM franchise ORDER BY rowid'),
        all(db, `SELECT * FROM dlc ${gameFilter} ORDER BY rowid`, ...params),
        all(db, `SELECT * FROM genre_game_xref ${gameFilter} ORDER BY rowid`, ...params),
        all(db, `SELECT * FROM game_franchise_xref ${gameFilter} ORDER BY rowid`, ...params),
    ]);
    const systemsById = byId(systems);
    const developersById = byId(developers);
    const compilationsById = byId(compilations);
    const genresById = byId(genres);
    const franchisesById = byId(franchises);
    const dlcsByGame = groupBy(dlcs, 'gameId');
    const genreLinksByGame = groupBy(genreLinks, 'gameId');
    const franchiseLinksByGame = groupBy(franchiseLinks, 'gameId');

    return games.map((game) => ({
        ...game,
        system: systemsById.get(game.systemId),
        developer: developersById.get(game.developerId),
        compilation: game.compilationId ? compilationsById.get(game.compilationId) : null,
        genres: (genreLinksByGame.get(game.id) || []).map(({ genreId }) => genresById.get(genreId)),
        franchises: (franchiseLinksByGame.get(game.id) || []).map(({ franchiseId }) => franchisesById.get(franchiseId)),
        dlcs: dlcsByGame.get(game.id) || [],
    }));
};

export const loadGame = async (db, id) => {
    const [game] = await loadGames(db, [id]);

    if (!game) {
        throw new Error(`No game with id ${id}`);
    }

    return game;
};
