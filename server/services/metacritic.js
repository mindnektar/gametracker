import axios from 'axios';
import { closest } from 'fastest-levenshtein';

const systemMap = {
    Switch: 'Nintendo Switch',
    'PlayStation Portable': 'PSP',
};

export default async (input) => {
    if (!input.types.includes('criticRating')) {
        return {};
    }

    try {
        const apiKey = '1MOZgmNFxvmljaQR1X9KAij9Mo4xAY3u';
        const systemName = input.type === 'dlc' ? input.game.system.name : input.system;
        const system = systemMap[systemName] || systemName;
        const title = input.type === 'dlc' ? `${input.game.title}: ${input.title}` : input.title;
        const url = `https://backend.metacritic.com/finder/metacritic/autosuggest/${encodeURIComponent(title)}?apiKey=${apiKey}`;
        const { data } = await axios.get(url);
        const items = data.data.items.filter(({ type, platforms }) => (
            type === 'game-title'
            && platforms.some(({ name }) => system === name)
        ));
        const closestTitle = closest(title, items.map((item) => item.title));
        const result = items.find((item) => item.title === closestTitle);

        return {
            criticRating: result?.criticScoreSummary.score || 0,
        };
    } catch (error) {
        console.error(error);
        return {};
    }
};
