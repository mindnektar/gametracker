const uuid = require('uuid').v4;

const list = {
    completedGames: {
        id: uuid(),
        name: 'Game Tracker',
    },
};

exports.data = {
    list,
};

exports.seed = (knex) => (
    knex('list').insert(Object.values(list))
);
