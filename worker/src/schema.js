import { createSchema } from 'graphql-yoga';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';
import basics from './schema/basics.graphql';
import compilationTypes from './schema/compilations.graphql';
import developerTypes from './schema/developers.graphql';
import dlcTypes from './schema/dlcs.graphql';
import franchiseTypes from './schema/franchises.graphql';
import gameTypes from './schema/games.graphql';
import genreTypes from './schema/genres.graphql';
import systemTypes from './schema/systems.graphql';
import games from './resolvers/games';
import dlcs from './resolvers/dlcs';
import systems from './resolvers/systems';
import { compilations, developers, franchises, genres } from './resolvers/entities';

const toIsoString = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new GraphQLError(`Invalid date: ${value}`);
    }

    return date.toISOString();
};

// Timestamps are stored as ISO strings (the migrated ones with the microseconds Postgres had).
// The API always returned them with milliseconds, which is what JSON gave for the Dates pg returned.
const DateTime = new GraphQLScalarType({
    name: 'DateTime',
    serialize: (value) => (value === null ? null : toIsoString(value)),
    parseValue: toIsoString,
    parseLiteral: (ast) => {
        if (ast.kind !== Kind.STRING) {
            throw new GraphQLError('DateTime must be a string');
        }

        return toIsoString(ast.value);
    },
});

// Reading is public, changing anything needs the admin key, like before
const requireAdmin = (mutations) => Object.fromEntries(Object.entries(mutations).map(([name, resolve]) => [
    name,
    (parent, args, context, info) => {
        if (!context.isAdmin) {
            throw new GraphQLError('Unauthorized');
        }

        return resolve(parent, args, context, info);
    },
]));

const modules = [games, dlcs, systems, compilations, developers, franchises, genres];
const { Query, Mutation, ...types } = modules.reduce((result, { Query: query, Mutation: mutation, ...rest }) => ({
    ...result,
    ...rest,
    Query: { ...result.Query, ...query },
    Mutation: { ...result.Mutation, ...mutation },
}), { Query: {}, Mutation: {} });

export default createSchema({
    typeDefs: [basics, compilationTypes, developerTypes, dlcTypes, franchiseTypes, gameTypes, genreTypes, systemTypes],
    resolvers: {
        ...types,
        Query,
        Mutation: requireAdmin(Mutation),
        DateTime,
    },
});
