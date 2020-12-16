const uuid = require('uuid').v4;
const systems = require('../systems');

const system = systems.reduce((result, current) => ({
    ...result,
    [current.name]: {
        id: uuid(),
        name: current.name,
    },
}), {});

exports.data = {
    system,
};

exports.seed = (knex) => (
    knex('system').insert(Object.values(system))
);
