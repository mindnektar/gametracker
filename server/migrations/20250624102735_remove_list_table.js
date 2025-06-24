module.exports = {
    up: async (knex) => {
        await knex.schema.table('list_game_xref', (table) => {
            table.dropForeign(['game_id']);
        });

        await knex.schema.dropTable('list_game_xref');
        await knex.schema.dropTable('list');
    },
    down: async (knex) => {
        await knex.schema.createTable('list', (table) => {
            table.uuid('id').primary();
            table.string('name').notNullable();
            table.timestamps(true, true);
        });

        await knex.schema.createTable('list_game_xref', (table) => {
            table.uuid('list_id').references('list.id').onDelete('cascade');
            table.uuid('game_id').references('game.id').onDelete('cascade');
            table.primary(['list_id', 'game_id']);
        });
    },
};
