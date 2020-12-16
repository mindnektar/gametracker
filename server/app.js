import path from 'path';
import cors from 'cors';
import pg from 'pg';
import express from 'express';
import { GraphQLServer } from 'graphql-yoga';
import { mergeTypes, mergeResolvers, fileLoader } from 'merge-graphql-schemas';
import aliasResolver from './middleware/graphql/aliasResolver';
import config from './config';

// postgres returns decimal types as strings because the values could potentially become larger than
// fit into a JS variable. it is suggested to parse them to float manually if it is certain that the
// values can never become so large: https://github.com/brianc/node-postgres/issues/811
pg.types.setTypeParser(1700, (value) => parseFloat(value));

const server = new GraphQLServer({
    typeDefs: mergeTypes(fileLoader(path.join(__dirname, 'typeDefs'))),
    resolvers: mergeResolvers(fileLoader(path.join(__dirname, 'resolvers/!(*.test).js'))),
    middlewares: [aliasResolver],
});

server.express.use(
    cors(),
);

server.express.use(express.static(path.join(__dirname, '../client/public')));

const options = {
    port: config.port.express,
    endpoint: '/api/',
    formatError: (error) => {
        if (error.originalError) {
            const { isCustomError, ...originalError } = error.originalError;
            return isCustomError ? { ...originalError, message: error.message } : error;
        }
        return error;
    },
    formatResponse: (response) => response,
    playground: false,
};

server.start(
    options,
    () => console.log(`Server is running on http://localhost:${config.port.express}`),
);
