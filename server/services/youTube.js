import axios from 'axios';
import config from '../config';

export default async (input) => {
    if (!input.types.includes('youTubeId')) {
        return {};
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
