const uuid = require('uuid').v4;
const games = require('../games');

const compilation = games.reduce((result, current) => {
    if (!current.compilation) {
        return result;
    }

    return {
        ...result,
        [current.compilation]: {
            id: uuid(),
            title: current.compilation,
        },
    };
}, {});

exports.data = {
    compilation,
};

exports.seed = (knex) => (
    knex('compilation').insert(Object.values(compilation))
);
