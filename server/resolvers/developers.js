import transaction from './helpers/transaction';
import Developer from '../models/Developer';

export default {
    Query: {
        developers: (parent, variables, context, info) => (
            Developer.query().graphqlEager(info)
        ),
    },
    Mutation: {
        createDeveloper: (parent, { input }, context, info) => (
            transaction(async (trx) => (
                Developer
                    .query(trx)
                    .graphqlEager(info)
                    .insertGraphAndFetch(input)
            ))
        ),
        updateDeveloper: (parent, { input }, context, info) => (
            transaction(async (trx) => (
                Developer
                    .query(trx)
                    .graphqlEager(info)
                    .upsertGraphAndFetch(input)
            ))
        ),
        deleteDeveloper: (parent, { id }) => (
            transaction(async (trx) => (
                Developer
                    .query(trx)
                    .deleteById(id)
                    .returning('*')
            ))
        ),
    },
};
