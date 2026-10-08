import { all, first, insert, newId, now, remove, update } from '../db';
import { loadGames } from '../games';

const loadSystem = (db, id) => first(db, 'SELECT * FROM system WHERE id = ?', id);

export default {
    Query: {
        systems: (parent, variables, { db }) => all(db, 'SELECT * FROM system ORDER BY rowid'),
    },
    Mutation: {
        createSystem: async (parent, { input }, { db }) => {
            const id = newId();
            const timestamp = now();
            // Like before: one more than the highest order, or 1 for the first system
            const { maxOrder } = await first(db, 'SELECT MAX("order") AS max_order FROM system');

            await insert(db, 'system', {
                id,
                name: input.name,
                company: input.company,
                order: (maxOrder ?? 0) + 1,
                createdAt: timestamp,
                updatedAt: timestamp,
            }).run();

            return loadSystem(db, id);
        },
        updateSystem: async (parent, { input }, { db }) => {
            const values = { updatedAt: now() };

            ['name', 'company'].filter((key) => key in input).forEach((key) => { values[key] = input[key]; });

            await update(db, 'system', input.id, values).run();

            return loadSystem(db, input.id);
        },
        // Moves a system to a new position and shifts the ones in between
        updateSystemOrder: async (parent, { input }, { db }) => {
            const system = await loadSystem(db, input.id);
            const timestamp = now();
            const shift = input.order > system.order
                ? db
                    .prepare('UPDATE system SET "order" = "order" - 1, updated_at = ? WHERE "order" <= ? AND "order" > ?')
                    .bind(timestamp, input.order, system.order)
                : db
                    .prepare('UPDATE system SET "order" = "order" + 1, updated_at = ? WHERE "order" >= ? AND "order" < ?')
                    .bind(timestamp, input.order, system.order);

            await db.batch([
                shift,
                update(db, 'system', system.id, { order: input.order, updatedAt: timestamp }),
            ]);

            return all(db, 'SELECT * FROM system ORDER BY rowid');
        },
        // Deleting a system deletes all of its games, like before (foreign keys cascade)
        deleteSystem: (parent, { id }, { db }) => remove(db, 'system', id),
    },
    System: {
        games: async (system, variables, { db }) => (
            (await loadGames(db)).filter(({ systemId }) => systemId === system.id)
        ),
    },
};
