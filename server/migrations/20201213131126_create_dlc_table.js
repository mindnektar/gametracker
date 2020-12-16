module.exports = {
    up: async (knex) => (
        knex.schema.createTable('dlc', (table) => {
            table.uuid('id').primary();
            table.uuid('game_id').references('game.id').notNullable().onDelete('cascade');
            table.string('title').notNullable();
            table.integer('rating').notNullable();
            table.timestamps(true, true);
        })
    ),
    down: (knex) => (
        knex.schema.dropTable('dlc')
    ),
};
