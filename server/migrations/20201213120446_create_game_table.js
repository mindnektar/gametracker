module.exports = {
    up: async (knex) => (
        knex.schema.createTable('game', (table) => {
            table.uuid('id').primary();
            table.string('title').notNullable();
            table.integer('rating').notNullable();
            table.integer('release').notNullable();
            table.text('description').notNullable();
            table.text('you_tube_id').notNullable();
            table.timestamps(true, true);
        }).then(() => (
            knex.schema.createTable('list_game_xref', (table) => {
                table.uuid('list_id').references('list.id').onDelete('cascade');
                table.uuid('game_id').references('game.id').onDelete('cascade');
                table.primary(['list_id', 'game_id']);
            })
        ))
    ),
    down: (knex) => (
        knex.schema.dropTable('list_game_xref').then(() => (
            knex.schema.dropTable('game')
        ))
    ),
};
