import transaction from './helpers/transaction';
import System from '../models/System';

export default {
    Query: {
        systems: (parent, variables, context, info) => (
            System.query().graphqlEager(info)
        ),
    },
    Mutation: {
        createSystem: (parent, { input }, context, info) => (
            transaction(async (trx) => (
                System
                    .query(trx)
                    .graphqlEager(info)
                    .insertGraphAndFetch({
                        ...input,
                        order: (await System.query(trx).max('order').first()).max + 1,
                    })
            ))
        ),
        updateSystem: (parent, { input }, context, info) => (
            transaction(async (trx) => (
                System
                    .query(trx)
                    .graphqlEager(info)
                    .upsertGraphAndFetch(input)
            ))
        ),
        updateSystemOrder: (parent, { input }, context, info) => (
            transaction(async (trx) => {
                const system = await System.query(trx).findById(input.id);

                if (input.order > system.order) {
                    await System
                        .query(trx)
                        .decrement('order', 1)
                        .where('order', '<=', input.order)
                        .where('order', '>', system.order);
                } else {
                    await System
                        .query(trx)
                        .increment('order', 1)
                        .where('order', '>=', input.order)
                        .where('order', '<', system.order);
                }

                await system.$query(trx).update({ order: input.order });

                return System
                    .query(trx)
                    .graphqlEager(info);
            })
        ),
        deleteSystem: (parent, { id }) => (
            transaction(async (trx) => (
                System
                    .query(trx)
                    .deleteById(id)
                    .returning('*')
            ))
        ),
    },
};
