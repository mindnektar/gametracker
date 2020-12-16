module.exports = {
    up: async (knex) => (
        knex.schema.createTable('genre', (table) => {
            table.uuid('id').primary();
            table.string('name').notNullable();
            table.timestamps(true, true);
        }).then(() => (
            knex.schema.createTable('genre_game_xref', (table) => {
                table.uuid('genre_id').references('genre.id').onDelete('cascade');
                table.uuid('game_id').references('game.id').onDelete('cascade');
                table.primary(['genre_id', 'game_id']);
            })
        ))
    ),
    down: (knex) => (
        knex.schema.dropTable('genre_game_xref').then(() => (
            knex.schema.dropTable('genre')
        ))
    ),
};
