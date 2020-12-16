module.exports = {
    up: async (knex) => (
        knex.schema.createTable('list', (table) => {
            table.uuid('id').primary();
            table.string('name').notNullable();
            table.timestamps(true, true);
        })
    ),
    down: (knex) => (
        knex.schema.dropTable('list')
    ),
};
