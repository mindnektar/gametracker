import axios from 'axios';
import config from '../config';

export default async (input) => {
    if (!input.types.includes('youTubeId')) {
        return {};
    }

    if (!config.youTube.apiKey) {
        throw new Error('No YOU_TUBE_API_KEY environment variable found. See: https://developers.google.com/youtube/v3/getting-started');
    }

    const youTubeSearch = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
            key: config.youTube.apiKey,
            q: input.type === 'dlc' ? `${input.game.title}: ${input.title} DLC longplay` : `${input.title} ${input.system} longplay`,
            type: 'video',
            maxResults: 1,
            part: 'snippet',
        },
    });

    return {
        youTubeId: youTubeSearch.data.items[0].id.videoId,
    };
};
