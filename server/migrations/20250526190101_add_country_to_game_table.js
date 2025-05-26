module.exports = {
    up: async (knex) => (
        knex.schema.table('game', (table) => {
            table.string('country');
        })
    ),
    down: async (knex) => (
        knex.schema.table('game', (table) => {
            table.dropColumn('country');
        })
    ),
};
