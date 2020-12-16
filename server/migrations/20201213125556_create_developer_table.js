module.exports = {
    up: async (knex) => (
        knex.schema.createTable('developer', (table) => {
            table.uuid('id').primary();
            table.string('name').notNullable();
            table.timestamps(true, true);
        }).then(() => (
            knex.schema.table('game', (table) => {
                table.uuid('developer_id').references('developer.id').notNullable().onDelete('cascade');
            })
        ))
    ),
    down: (knex) => (
        knex.schema.table('game', (table) => {
            table.dropColumn('developer_id');
        }).then(() => (
            knex.schema.dropTable('developer')
        ))
    ),
};
