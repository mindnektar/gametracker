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
    adminKey: {
        format: String,
        default: '',
        env: 'ADMIN_KEY',
    },
    youTube: {
        apiKey: {
            format: String,
            default: '',
            env: 'YOU_TUBE_API_KEY',
        },
    },
    ai: {
        apiKey: {
            format: String,
            default: '',
            env: 'AI_API_KEY',
        },
    },
});

config.validate({ allowed: 'strict' });

module.exports = config.getProperties();
