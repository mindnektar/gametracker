const convict = require('convict');

const config = convict({
    environment: {
        format: String,
        default: 'development',
        env: 'NODE_ENV',
    },
    port: {
        express: {
            format: 'nat',
            default: 5930,
            env: 'PORT',
        },
        webpackDevServer: {
            format: 'nat',
            default: 5931,
            env: 'PORT_WEBPACK_DEV_SERVER',
        },
    },
    knex: {
        client: {
            format: ['pg'],
            default: 'pg',
        },
        connection: {
            format: String,
            default: 'postgresql://localhost:5434/gametracker',
            env: 'POSTGRES_URI',
        },
        migrations: {
            tableName: {
                format: String,
                default: 'migrations',
            },
        },
        debug: {
            format: Boolean,
            default: false,
            env: 'DATABASE_DEBUG',
        },
    },
    redis: {
        uri: {
            format: String,
            default: 'redis://localhost:6390',
            env: 'REDIS_URI',
        },
        retry: {
            maxTotalTime: {
                format: 'nat',
                default: 1000 * 60 * 60,
            },
            maxAttempts: {
                format: 'nat',
                default: 12,
            },
            maxReconnectDelay: {
                format: 'nat',
                default: 1000 * 60,
            },
        },
    },
    giantbomb: {
        apiKey: {
            format: String,
            default: 'aebe8a5bc71b49509966b5ea50e7951d79d99cd8',
            env: 'GIANTBOMB_API_KEY',
        },
    },
    youTube: {
        apiKey: {
            format: String,
            default: 'AIzaSyA07Y1XjytaowyA2F452XpEjtKEOGIAesI',
            env: 'YOU_TUBE_API_KEY',
        },
    },
});

config.validate({ allowed: 'strict' });

module.exports = config.getProperties();
