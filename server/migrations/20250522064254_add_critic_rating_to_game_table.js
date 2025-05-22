module.exports = {
    up: async (knex) => (
        knex.schema.table('game', (table) => {
            table.integer('critic_rating');
        })
    ),
    down: async (knex) => (
        knex.schema.table('game', (table) => {
            table.dropColumn('critic_rating');
        })
    ),
};
