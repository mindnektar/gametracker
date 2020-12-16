const uuid = require('uuid').v4;
const games = require('../games');

const genre = games.reduce((result, current) => {
    const genres = current.genre.split(',').filter((item) => !result[item]);

    return {
        ...result,
        ...genres.reduce((res, cur) => ({
            ...res,
            [cur]: {
                id: uuid(),
                name: cur,
            },
        }), {}),
    };
}, {});

exports.data = {
    genre,
};

exports.seed = (knex) => (
    knex('genre').insert(Object.values(genre))
);
