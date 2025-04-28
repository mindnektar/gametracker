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
            const aiData = await fetchAiData(input.title, input.system);
            const giantbombData = await fetchGiantbombData(input.title);
            const youTubeData = await fetchYouTubeData(input.title, input.system);
            const description = aiData.story && aiData.gameplay && aiData.history ? `## Story & theme

${aiData.story}

## Gameplay

${aiData.gameplay}

## History

${aiData.history}` : giantbombData.description;
            const release = aiData?.releaseYear || giantbombData.release;
            const developer = aiData?.developer || giantbombData.developer;

            return {
                description,
                release,
                developer: developerMap[developer] || developer,
                genres: giantbombData.genres,
                youTubeId: youTubeData.youTubeId || '',
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
