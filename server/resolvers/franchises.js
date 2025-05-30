import transaction from './helpers/transaction';
import Franchise from '../models/Franchise';

export default {
    Query: {
        franchises: (parent, variables, context, info) => (
            Franchise.query().graphqlEager(info)
        ),
    },
    Mutation: {
        createFranchise: (parent, { input }, context, info) => (
            transaction(async (trx) => (
                Franchise
                    .query(trx)
                    .graphqlEager(info)
                    .insertGraphAndFetch(input)
            ))
        ),
        updateFranchise: (parent, { input }, context, info) => (
            transaction(async (trx) => (
                Franchise
                    .query(trx)
                    .graphqlEager(info)
                    .upsertGraphAndFetch(input)
            ))
        ),
        deleteFranchise: (parent, { id }) => (
            transaction(async (trx) => (
                Franchise
                    .query(trx)
                    .deleteById(id)
                    .returning('*')
            ))
        ),
    },
};
