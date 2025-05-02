import axios from 'axios';
import config from '../config';

export default async (title) => {
    try {
        const giantBombSearch = await axios.get('https://www.giantbomb.com/api/search', {
            params: {
                api_key: config.giantbomb.apiKey,
                query: title,
                resources: 'game',
                limit: 1,
                field_list: 'guid',
                format: 'json',
            },
        });
        const { guid } = giantBombSearch.data.results[0];
        const giantBombGame = await axios.get(`https://www.giantbomb.com/api/game/${guid}`, {
            params: {
                api_key: config.giantbomb.apiKey,
                field_list: 'genres',
                format: 'json',
            },
        });
        const { results } = giantBombGame.data;

        return {
            genres: results.genres
                ? results.genres.map((genre) => genre.name)
                : [],
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};
