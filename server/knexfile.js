const config = require('./config');

const knexconf = {
    client: config.knex.client,
    connection: `${config.knex.connection}?sslmode=require`,
    migrations: config.knex.migrations,
    debug: config.knex.debug,
    seeds: {
        directory: `./seeds/${config.environment}`,
    },
};

module.exports = {
    development: knexconf,
    production: knexconf,
    test: knexconf,
};
