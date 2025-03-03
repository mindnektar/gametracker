module.exports = {
    up: async (knex) => (
        knex.schema.table('game', (table) => {
            table.integer('skip_count').notNullable().defaultTo(0);
        })
    ),
    down: async (knex) => (
        knex.schema.table('game', (table) => {
            table.dropColumn('skip_count');
        })
    ),
};
