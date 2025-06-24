module.exports = {
    up: async (knex) => (
        knex.schema.table('system', (table) => {
            table.string('company');
        })
    ),
    down: async (knex) => (
        knex.schema.table('system', (table) => {
            table.dropColumn('company');
        })
    ),
};
