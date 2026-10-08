// Small helpers around the D1 binding. Columns are snake_case in the database and camelCase in
// the API, like knexSnakeCaseMappers did before.

export const now = () => new Date().toISOString();

export const newId = () => crypto.randomUUID();

const toCamelCase = (key) => key.replace(/_([a-z])/g, (_, character) => character.toUpperCase());

const toSnakeCase = (key) => key.replace(/[A-Z]/g, (character) => `_${character.toLowerCase()}`);

// "order" is an SQL keyword, so quote all column names
const column = (key) => `"${toSnakeCase(key)}"`;

export const fromRow = (row) => (
    row ? Object.fromEntries(Object.entries(row).map(([key, value]) => [toCamelCase(key), value])) : null
);

export const all = async (db, sql, ...params) => (
    (await db.prepare(sql).bind(...params).all()).results.map(fromRow)
);

export const first = async (db, sql, ...params) => (
    fromRow(await db.prepare(sql).bind(...params).first())
);

export const insert = (db, table, values) => {
    const keys = Object.keys(values).filter((key) => values[key] !== undefined);

    return db
        .prepare(`INSERT INTO ${table} (${keys.map(column).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`)
        .bind(...keys.map((key) => values[key]));
};

// Only changes the given values, like Objection's patch
export const update = (db, table, id, values) => {
    const keys = Object.keys(values).filter((key) => values[key] !== undefined);

    return db
        .prepare(`UPDATE ${table} SET ${keys.map((key) => `${column(key)} = ?`).join(', ')} WHERE id = ?`)
        .bind(...keys.map((key) => values[key]), id);
};

// Deletes a row and returns it, like `.deleteById(id).returning('*')` did
export const remove = async (db, table, id) => {
    const row = await first(db, `SELECT * FROM ${table} WHERE id = ?`, id);

    if (!row) {
        throw new Error(`No ${table} with id ${id}`);
    }

    await db.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();

    return row;
};
