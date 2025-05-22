module.exports = {
    up: async (knex) => (
        knex.schema.table('dlc', (table) => {
            table.integer('release');
            table.text('description');
            table.text('you_tube_id');
            table.integer('critic_rating');
            table.float('time_to_beat');
        })
    ),
    down: async (knex) => (
        knex.schema.table('dlc', (table) => {
            table.dropColumn('critic_rating');
            table.dropColumn('time_to_beat');
            table.dropColumn('you_tube_id');
            table.dropColumn('description');
            table.dropColumn('release');
        })
    ),
};
