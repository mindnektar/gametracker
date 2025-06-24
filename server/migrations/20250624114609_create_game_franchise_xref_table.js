module.exports = {
    up: async (knex) => {
        await knex.schema.createTable('game_franchise_xref', (table) => {
            table.uuid('game_id').references('game.id').onDelete('cascade');
            table.uuid('franchise_id').references('franchise.id').onDelete('cascade');
            table.primary(['game_id', 'franchise_id']);
        });

        const games = await knex('game').whereNotNull('franchise_id');

        await knex('game_franchise_xref').insert(games.map((game) => ({
            game_id: game.id,
            franchise_id: game.franchise_id,
        })));

        await knex.schema.alterTable('game', (table) => {
            table.dropColumn('franchise_id');
        });
    },
    down: async (knex) => {
        await knex.schema.table('game', (table) => {
            table.uuid('franchise_id').references('franchise.id').onDelete('cascade');
        });

        await knex.schema.dropTable('game_franchise_xref');
    },
};
