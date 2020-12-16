const uuid = require('uuid').v4;

const list = {
    completedGames: {
        id: uuid(),
        name: 'Completed games',
    },
};

exports.data = {
    list,
};

exports.seed = (knex) => (
    knex('list').insert(Object.values(list))
);
