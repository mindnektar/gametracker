const uuid = require('uuid').v4;
const { data: { list } } = require('./010_lists');
const { data: { system } } = require('./015_systems');
const { data: { compilation } } = require('./016_compilations');
const { data: { genre } } = require('./017_genres');
const { data: { developer } } = require('./018_developers');
const games = require('../games');
const systems = require('../systems');

const game = games.reduce((result, current) => {
    const gameSystem = systems.find((item) => item._id.$oid === current.systemId.$oid).name;

    return {
        ...result,
        [`${current.title}${current.release}${current.rating}`]: {
            id: uuid(),
            title: current.title,
            rating: current.rating,
            release: current.release,
            description: current.description,
            you_tube_id: current.youTubeId,
            system_id: system[gameSystem].id,
            developer_id: developer[current.developer].id,
            compilation_id: compilation[current.compilation]?.id,
        },
    };
}, {});

const listGameXref = Object.values(game).reduce((result, current) => [
    ...result,
    {
        game_id: current.id,
        list_id: list.completedGames.id,
    },
], []);

const genreGameXref = games.reduce((result, current) => [
    ...result,
    ...current.genre.split(',').map((item) => ({
        game_id: game[`${current.title}${current.release}${current.rating}`].id,
        genre_id: genre[item].id,
    })),
], []);

exports.data = {
    game,
};

exports.seed = (knex) => (
    knex('game').insert(Object.values(game)).then(() => (
        knex('list_game_xref').insert(Object.values(listGameXref))
    )).then(() => (
        knex('genre_game_xref').insert(Object.values(genreGameXref))
    ))
);
