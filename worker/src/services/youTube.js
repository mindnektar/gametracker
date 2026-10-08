export default async (env, input) => {
    if (!input.types.includes('youTubeId')) {
        return {};
    }

    if (!env.YOU_TUBE_API_KEY) {
        throw new Error('No YOU_TUBE_API_KEY secret found. See: https://developers.google.com/youtube/v3/getting-started');
    }

    const params = new URLSearchParams({
        key: env.YOU_TUBE_API_KEY,
        q: input.type === 'dlc' ? `${input.game.title}: ${input.title} DLC longplay` : `${input.title} ${input.system} longplay`,
        type: 'video',
        maxResults: '1',
        part: 'snippet',
    });
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);

    if (!response.ok) {
        throw new Error(`YouTube responded with ${response.status}`);
    }

    const data = await response.json();

    return {
        youTubeId: data.items[0].id.videoId,
    };
};
