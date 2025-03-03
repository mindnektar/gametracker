import transaction from './helpers/transaction';
import fetchGiantbombData from '../services/giantbomb';
import fetchYouTubeData from '../services/youTube';
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
        fetchGameData: async (parent, { input }) => {
            const giantbombData = await fetchGiantbombData(input.title);
            const youTubeData = await fetchYouTubeData(input.title, input.system);

            return {
                description: giantbombData.description,
                release: giantbombData.release,
                developer: giantbombData.developer,
                genres: giantbombData.genres,
                youTubeId: youTubeData.youTubeId,
            };
        },
        skipGame: (parent, { id }, context, info) => (
            transaction((trx) => (
                Game
                    .query(trx)
                    .graphqlEager(info)
                    .findById(id)
                    .increment('skipCount', 1)
                    .returning('*')
            ))
        ),
        deleteGame: (parent, { id }) => (
            transaction((trx) => (
                Game
                    .query(trx)
                    .deleteById(id)
                    .returning('*')
            ))
        ),
    },
};
