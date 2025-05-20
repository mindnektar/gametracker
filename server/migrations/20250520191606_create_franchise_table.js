module.exports = {
    up: async (knex) => {
        await knex.schema.createTable('franchise', (table) => {
            table.uuid('id').primary();
            table.string('name').notNullable();
            table.timestamps(true, true);
        });

        await knex.schema.table('game', (table) => {
            table.uuid('franchise_id').references('franchise.id').onDelete('set null');
        });
    },
    down: async (knex) => {
        await knex.schema.table('game', (table) => {
            table.dropColumn('franchise_id');
        });

        await knex.schema.dropTable('franchise');
    },
};
