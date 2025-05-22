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
        const url = `https://backend.metacritic.com/finder/metacritic/autosuggest/${encodeURIComponent(input.title)}?apiKey=${apiKey}`;
        const { data } = await axios.get(url);
        const items = data.data.items.filter(({ type, platforms }) => (
            type === 'game-title'
            && platforms.some(({ name }) => (systemMap[input.system] || input.system) === name)
        ));
        const closestTitle = closest(input.title, items.map(({ title }) => title));
        const item = items.find(({ title }) => title === closestTitle);

        return {
            criticRating: item?.criticScoreSummary.score || 0,
        };
    } catch (error) {
        console.error(error);
        return {};
    }
};
