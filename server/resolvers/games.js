import transaction from './helpers/transaction';
import Game from '../models/Game';

export default {
    Mutation: {
        createGame: (parent, { input }, context, info) => (
            transaction((trx) => (
                Game
                    .query(trx)
                    .graphqlEager(info)
                    .insertGraphAndFetch(input, {
                        relate: ['lists', 'system', 'developer', 'genres', 'compilation'],
                    })
            ))
        ),
        updateGame: (parent, { input }, context, info) => (
            transaction((trx) => (
                Game
                    .query(trx)
                    .graphqlEager(info)
                    .upsertGraphAndFetch(input, {
                        relate: ['lists', 'system', 'developer', 'genres', 'compilation'],
                        unrelate: ['lists', 'system', 'developer', 'genres', 'compilation'],
                    })
            ))
        ),
    },
};
