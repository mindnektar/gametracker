module.exports = {
    up: async (knex) => (
        knex.schema.table('game', (table) => {
            table.timestamp('completed_at');
        })
    ),
    down: async (knex) => (
        knex.schema.table('game', (table) => {
            table.dropColumn('completed_at');
        })
    ),
};
