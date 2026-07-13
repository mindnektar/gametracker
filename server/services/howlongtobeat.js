import axios from 'axios';

const baseUrl = 'https://howlongtobeat.com';
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const headers = {
    'User-Agent': userAgent,
    Referer: `${baseUrl}/`,
    Origin: baseUrl,
};

const systemMap = {
    GameCube: 'Nintendo GameCube',
    Switch: 'Nintendo Switch',
    DS: 'Nintendo DS',
    '3DS': 'Nintendo 3DS',
    'Master System': 'Sega Master System',
    Genesis: 'Sega Mega Drive/Genesis',
    'Oculus Rift': 'Meta Quest',
    'Oculus Quest': 'Meta Quest',
    Android: 'Mobile',
};

// HLTB renames its search endpoint every so often (/api/search -> /api/seek/<hash> -> /api/bleed).
// If the cached name stops working, discover the current one from the site's JS bundles.
let apiName = 'bleed';

const discoverApiName = async () => {
    const { data: html } = await axios.get(baseUrl, { headers });
    const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map(([, src]) => src);

    // eslint-disable-next-line no-restricted-syntax
    for (const src of scripts) {
        const { data: script } = await axios.get(`${baseUrl}${src}`, { headers });
        const match = script.match(/fetch\(\s*[`"']\/api\/([a-zA-Z0-9_-]+)\/init/);

        if (match) {
            return match[1];
        }
    }

    throw new Error('Could not discover HowLongToBeat API endpoint');
};

// The search API requires a short-lived token bound to IP and user agent,
// issued by /api/<name>/init and sent back via headers and body.
const fetchAuth = async () => {
    const { data } = await axios.get(`${baseUrl}/api/${apiName}/init`, {
        params: { t: Date.now() },
        headers,
    });

    return data;
};

const search = async (title, type, system = '') => {
    const searchData = {
        searchType: 'games',
        searchTerms: title.split(' ').map((term) => term.replace(/[^a-zA-Z0-9-']/g, '')).filter(Boolean),
        searchPage: 1,
        size: 1,
        searchOptions: {
            games: {
                userId: 0,
                platform: systemMap[system] || system,
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
                modifier: type === 'dlc' ? 'only_dlc' : 'hide_dlc',
            },
            users: { sortCategory: 'postcount' },
            lists: { sortCategory: 'follows' },
            filter: '',
            sort: 0,
            randomizer: 0,
        },
        useCache: true,
    };

    const { token, hpKey, hpVal } = await fetchAuth();

    const body = { ...searchData };

    if (hpKey) {
        body[hpKey] = hpVal;
    }

    const { data } = await axios.post(`${baseUrl}/api/${apiName}`, body, {
        headers: {
            ...headers,
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'x-hp-key': hpKey,
            'x-hp-val': hpVal,
        },
    });

    return data.data[0];
};

const request = async (title, type, system = '') => {
    try {
        return await search(title, type, system);
    } catch (error) {
        if (error.response && [401, 403, 404].includes(error.response.status)) {
            apiName = await discoverApiName();

            return search(title, type, system);
        }

        throw error;
    }
};

export default async (input) => {
    if (!input.types.includes('timeToBeat')) {
        return {};
    }

    try {
        let data = await request(input.title, input.type, input.system);

        if (!data) {
            data = await request(input.title, input.type);
        }

        return {
            timeToBeat: data ? Math.round((data.comp_main || data.comp_plus || data.comp_100) / 1800) / 2 : 0,
        };
    } catch (error) {
        console.error(error);
        return {};
    }
};
