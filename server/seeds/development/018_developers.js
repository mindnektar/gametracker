const uuid = require('uuid').v4;
const games = require('../games');

const developer = games.reduce((result, current) => {
    if (result[current.developer]) {
        return result;
    }

    return {
        ...result,
        [current.developer]: {
            id: uuid(),
            name: current.developer,
        },
    };
}, {});

exports.data = {
    developer,
};

exports.seed = (knex) => (
    knex('developer').insert(Object.values(developer))
);
