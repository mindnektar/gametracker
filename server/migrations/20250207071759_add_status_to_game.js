module.exports = {
    up: async (knex) => (
        knex.schema.table('game', (table) => {
            table.string('status').notNullable().defaultTo('completed');
        })
    ),
    down: async (knex) => (
        knex.schema.table('game', (table) => {
            table.dropColumn('status');
        })
    ),
};
