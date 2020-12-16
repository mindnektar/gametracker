module.exports = {
    up: async (knex) => (
        knex.schema.createTable('system', (table) => {
            table.uuid('id').primary();
            table.string('name').notNullable();
            table.timestamps(true, true);
        }).then(() => (
            knex.schema.table('game', (table) => {
                table.uuid('system_id').references('system.id').notNullable().onDelete('cascade');
            })
        ))
    ),
    down: (knex) => (
        knex.schema.table('game', (table) => {
            table.dropColumn('system_id');
        }).then(() => (
            knex.schema.dropTable('system')
        ))
    ),
};
