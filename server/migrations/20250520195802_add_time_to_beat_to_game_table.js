module.exports = {
    up: async (knex) => (
        knex.schema.table('game', (table) => {
            table.float('time_to_beat');
        })
    ),
    down: async (knex) => (
        knex.schema.table('game', (table) => {
            table.dropColumn('time_to_beat');
        })
    ),
};
