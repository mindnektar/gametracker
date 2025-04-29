import axios from 'axios';
import config from '../config';

export default async (title, system) => {
    const youTubeSearch = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
            key: config.youTube.apiKey,
            q: `${title} ${system} gameplay`,
            type: 'video',
            maxResults: 1,
            part: 'snippet',
        },
    });

    return {
        youTubeId: youTubeSearch.data.items[0].id.videoId,
    };
};
