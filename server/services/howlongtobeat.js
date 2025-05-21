import axios from 'axios';

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export default async (input) => {
    if (!input.types.includes('timeToBeat')) {
        return {};
    }

    try {
        const searchData = {
            searchType: 'games',
            searchTerms: input.title.split(' ').map((term) => term.replace(/[^a-zA-Z0-9]/g, '')).filter(Boolean),
            searchPage: 1,
            size: 1,
            searchOptions: {
                games: {
                    userId: 0,
                    platform: '',
                    sortCategory: 'popular',
                    rangeCategory: 'main',
                    rangeTime: { min: null, max: null },
                    gameplay: {
                        perspective: '',
                        flow: '',
                        genre: '',
                        difficulty: '',
                    },
                    rangeYear: { min: '', max: '' },
                    modifier: 'hide_dlc',
                },
                users: { sortCategory: 'postcount' },
                lists: { sortCategory: 'follows' },
                filter: '',
                sort: 0,
                randomizer: 0,
            },
            useCache: true,
        };
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': userAgent,
                Referer: 'https://howlongtobeat.com/',
                Origin: 'https://howlongtobeat.com',
            },
        };

        const { data } = await axios.post('https://howlongtobeat.com/api/seek/d4b2e330db04dbf3', searchData, config);

        return {
            timeToBeat: Math.round(data.data[0]?.comp_main / 1800) / 2,
        };
    } catch (error) {
        console.error(error);
        return {
            timeToBeat: 0,
        };
    }
};
