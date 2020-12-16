module.exports = {
    up: async (knex) => (
        knex.schema.createTable('compilation', (table) => {
            table.uuid('id').primary();
            table.string('title').notNullable();
            table.timestamps(true, true);
        }).then(() => (
            knex.schema.table('game', (table) => {
                table.uuid('compilation_id').references('compilation.id').onDelete('cascade');
            })
        ))
    ),
    down: (knex) => (
        knex.schema.table('game', (table) => {
            table.dropColumn('compilation_id');
        }).then(() => (
            knex.schema.dropTable('compilation')
        ))
    ),
};
