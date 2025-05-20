import transaction from './helpers/transaction';
import fetchGiantbombData from '../services/giantbomb';
import fetchYouTubeData from '../services/youTube';
import fetchAiData from '../services/ai';
import developerMap from '../services/developerMap';
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
            const aiData = await fetchAiData(input.title, input.system, input.compilation, input.aiInstructions);
            const giantbombData = await fetchGiantbombData(input.title);
            const youTubeData = await fetchYouTubeData(input.title, input.system);
            const description = `## Story & Theme

${aiData.story}

## Gameplay

${aiData.gameplay}

## History

${aiData.history}`;
            const release = aiData.releaseYear;
            const developer = aiData.developer;

            return {
                description,
                release,
                developer: developerMap[developer] || developer,
                genres: giantbombData?.genres || [],
                youTubeId: youTubeData.youTubeId || '',
                franchise: aiData.franchise,
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
