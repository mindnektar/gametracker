import transaction from './helpers/transaction';
import Dlc from '../models/Dlc';
import Game from '../models/Game';
import fetchAiData from '../services/ai';
import fetchYouTubeData from '../services/youTube';
import fetchHowLongToBeatData from '../services/howlongtobeat';
import fetchMetacriticData from '../services/metacritic';

export default {
    Mutation: {
        createDlc: (parent, { input }, context, info) => (
            transaction((trx) => (
                Dlc
                    .query(trx)
                    .graphqlEager(info)
                    .insertGraphAndFetch(input)
            ))
        ),
        updateDlc: (parent, { input }, context, info) => (
            transaction((trx) => (
                Dlc
                    .query(trx)
                    .graphqlEager(info)
                    .upsertGraphAndFetch(input, {
                        noGraphTransform: true,
                    })
            ))
        ),
        fetchDlcData: async (parent, { input }) => {
            const game = await Game.query().findById(input.gameId).withGraphFetched('system');
            const modifiedInput = { ...input, game, type: 'dlc' };
            const result = await Promise.all([
                fetchAiData(modifiedInput),
                fetchYouTubeData(modifiedInput),
                fetchHowLongToBeatData(modifiedInput),
                fetchMetacriticData(modifiedInput),
            ]);
            const [aiData, youTubeData, hltbData, metacriticData] = result;

            return {
                ...aiData,
                ...youTubeData,
                ...hltbData,
                ...metacriticData,
            };
        },
        deleteDlc: (parent, { id }) => (
            transaction((trx) => (
                Dlc
                    .query(trx)
                    .deleteById(id)
                    .returning('*')
            ))
        ),
    },
};
