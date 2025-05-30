import transaction from './helpers/transaction';
import Compilation from '../models/Compilation';

export default {
    Query: {
        compilations: (parent, variables, context, info) => (
            Compilation.query().graphqlEager(info)
        ),
    },
    Mutation: {
        createCompilation: (parent, { input }, context, info) => (
            transaction(async (trx) => (
                Compilation
                    .query(trx)
                    .graphqlEager(info)
                    .insertGraphAndFetch(input)
            ))
        ),
        updateCompilation: (parent, { input }, context, info) => (
            transaction(async (trx) => (
                Compilation
                    .query(trx)
                    .graphqlEager(info)
                    .upsertGraphAndFetch(input)
            ))
        ),
        deleteCompilation: (parent, { id }) => (
            transaction(async (trx) => (
                Compilation
                    .query(trx)
                    .deleteById(id)
                    .returning('*')
            ))
        ),
    },
};
