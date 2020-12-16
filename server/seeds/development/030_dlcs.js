const uuid = require('uuid').v4;
const { data: { game } } = require('./020_games');
const games = require('../games');

const dlc = games.reduce((result, current) => ({
    ...result,
    ...current.dlcs.reduce((res, cur) => ({
        ...res,
        [cur.title]: {
            id: uuid(),
            title: cur.title,
            rating: cur.rating,
            game_id: game[`${current.title}${current.release}${current.rating}`].id,
        },
    }), {}),
}), {});

exports.data = {
    dlc,
};

exports.seed = (knex) => (
    knex('dlc').insert(Object.values(dlc))
);
