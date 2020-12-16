exports.seed = (knex) => (
    knex('list').del()
        .then(() => knex('system').del())
        .then(() => knex('compilation').del())
        .then(() => knex('genre').del())
        .then(() => knex('developer').del())
        .then(() => knex('game').del())
        .then(() => knex('dlc').del())
);
