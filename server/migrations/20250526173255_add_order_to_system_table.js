exports.up = async (knex) => {
    await knex.schema.table('system', (table) => {
        table.integer('order').defaultTo(0).notNullable();
    });

    const systems = await knex('system').select('id').orderBy('id');
    const updates = systems.map((system, index) => (
        knex('system')
            .where('id', system.id)
            .update({ order: index })
    ));

    await Promise.all(updates);
};

exports.down = async (knex) => {
    await knex.schema.table('system', (table) => {
        table.dropColumn('order');
    });
};
