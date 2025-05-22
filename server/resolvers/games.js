import transaction from './helpers/transaction';
import fetchGiantbombData from '../services/giantbomb';
import fetchYouTubeData from '../services/youTube';
import fetchHowLongToBeatData from '../services/howlongtobeat';
import fetchMetacriticData from '../services/metacritic';
import fetchAiData from '../services/ai';
import Game from '../models/Game';

export default {
    Mutation: {
        createGame: (parent, { input }, context, info) => (
            transaction((trx) => (
                Game
                    .query(trx)
                    .graphqlEager(info)
                    .insertGraphAndFetch(input, {
                        relate: ['lists', 'system', 'developer', 'genres', 'compilation', 'franchise'],
                    })
            ))
        ),
        updateGame: (parent, { input }, context, info) => (
            transaction((trx) => (
                Game
                    .query(trx)
                    .graphqlEager(info)
                    .upsertGraphAndFetch(input, {
                        relate: ['lists', 'system', 'developer', 'genres', 'compilation', 'franchise'],
                        unrelate: ['lists', 'system', 'developer', 'genres', 'compilation', 'franchise'],
                        noGraphTransform: true,
                    })
            ))
        ),
        fetchGameData: async (parent, { input }) => {
            const result = await Promise.all([
                fetchAiData(input),
                fetchGiantbombData(input),
                fetchYouTubeData(input),
                fetchHowLongToBeatData(input),
                fetchMetacriticData(input),
            ]);
            const [aiData, giantbombData, youTubeData, hltbData, metacriticData] = result;

            return {
                ...aiData,
                ...giantbombData,
                ...youTubeData,
                ...hltbData,
                ...metacriticData,
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
