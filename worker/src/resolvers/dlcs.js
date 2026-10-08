import { first, insert, newId, now, remove, update } from '../db';
import { loadGame } from '../games';
import fetchYouTubeData from '../services/youTube';
import fetchHowLongToBeatData from '../services/howlongtobeat';
import fetchMetacriticData from '../services/metacritic';
import { fetchGameInfo } from '../services/ai';

const FIELDS = ['title', 'rating', 'criticRating', 'release', 'description', 'youTubeId', 'timeToBeat'];

const pick = (input, keys) => Object.fromEntries(keys.filter((key) => key in input).map((key) => [key, input[key]]));

const loadDlc = (db, id) => first(db, 'SELECT * FROM dlc WHERE id = ?', id);

export default {
    Mutation: {
        createDlc: async (parent, { input }, { db }) => {
            const id = newId();
            const timestamp = now();

            await insert(db, 'dlc', {
                id,
                gameId: input.gameId,
                ...pick(input, FIELDS),
                createdAt: timestamp,
                updatedAt: timestamp,
            }).run();

            return loadDlc(db, id);
        },
        updateDlc: async (parent, { input }, { db }) => {
            await update(db, 'dlc', input.id, { ...pick(input, FIELDS), updatedAt: now() }).run();

            return loadDlc(db, input.id);
        },
        fetchDlcData: async (parent, { input }, { db, env }) => {
            const game = await loadGame(db, input.gameId);
            const dlcInput = { ...input, game, type: 'dlc' };
            // The old server called a default export of the AI service that didn't exist, so
            // fetching data for DLCs failed. fetchGameInfo handles DLCs.
            const [aiData, youTubeData, hltbData, metacriticData] = await Promise.all([
                fetchGameInfo(env, dlcInput),
                fetchYouTubeData(env, dlcInput),
                fetchHowLongToBeatData(dlcInput),
                fetchMetacriticData(env, dlcInput),
            ]);

            return {
                ...aiData,
                ...youTubeData,
                ...hltbData,
                ...metacriticData,
            };
        },
        deleteDlc: (parent, { id }, { db }) => remove(db, 'dlc', id),
    },
    Dlc: {
        game: (dlc, variables, { db }) => loadGame(db, dlc.gameId),
    },
};
