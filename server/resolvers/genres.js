import transaction from './helpers/transaction';
import Genre from '../models/Genre';

export default {
    Query: {
        genres: (parent, variables, context, info) => (
            Genre.query().graphqlEager(info)
        ),
    },
    Mutation: {
        createGenre: (parent, { input }, context, info) => (
            transaction(async (trx) => (
                Genre
                    .query(trx)
                    .graphqlEager(info)
                    .insertGraphAndFetch(input)
            ))
        ),
        updateGenre: (parent, { input }, context, info) => (
            transaction(async (trx) => (
                Genre
                    .query(trx)
                    .graphqlEager(info)
                    .upsertGraphAndFetch(input)
            ))
        ),
        deleteGenre: (parent, { id }) => (
            transaction((trx) => (
                Genre
                    .query(trx)
                    .deleteById(id)
                    .returning('*')
            ))
        ),
    },
};
