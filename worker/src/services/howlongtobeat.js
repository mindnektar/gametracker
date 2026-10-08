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

class HttpError extends Error {
    constructor(response) {
        super(`HowLongToBeat responded with ${response.status} for ${response.url}`);
        this.status = response.status;
    }
}

const request = async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });

    if (!response.ok) {
        throw new HttpError(response);
    }

    return response;
};

// HLTB moves its search endpoint every so often (/api/search -> /api/seek/<hash> -> /api/bleed ->
// /api/search/site). If the current one stops working, discover the new one from the site's JS
// bundles, where the search fetches a token from `<endpoint>/init`.
let endpoint = '/api/search/site';

const discoverEndpoint = async () => {
    const html = await (await request(baseUrl)).text();
    const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map(([, src]) => src);

    // eslint-disable-next-line no-restricted-syntax
    for (const src of scripts) {
        // eslint-disable-next-line no-await-in-loop
        const script = await (await request(`${baseUrl}${src}`)).text();
        const match = script.match(/fetch\(\s*[`"'](\/api\/[a-zA-Z0-9_/-]+?)\/init/);

        if (match) {
            return match[1];
        }
    }

    throw new Error('Could not discover HowLongToBeat API endpoint');
};

// The search needs a short-lived token, which `<endpoint>/init` issues
const fetchToken = async () => (
    (await (await request(`${baseUrl}${endpoint}/init?t=${Date.now()}`)).json()).token
);

// The filters of the search are lists of values to include
const include = (values) => ({ mode: 'include', values });

const search = async (title, type, system = '') => {
    const platform = systemMap[system] || system;
    const body = {
        searchType: 'games',
        searchTerms: title.split(' ').map((term) => term.replace(/[^a-zA-Z0-9-']/g, '')).filter(Boolean),
        searchPage: 1,
        size: 1,
        searchOptions: {
            games: {
                userId: 0,
                platform: include(platform ? [platform] : []),
                sortCategory: 'popular',
                rangeCategory: 'main',
                rangeTime: { min: null, max: null },
                gameplay: { perspective: include([]), flow: include([]), genre: include([]) },
                year: include([]),
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

    const response = await request(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': await fetchToken() },
        body: JSON.stringify(body),
    });

    return (await response.json()).data[0];
};

// The token includes the IP address it was issued to, and a Worker's requests don't always leave
// Cloudflare from the same address. So a rejected token is replaced a few times.
const MAX_ATTEMPTS = 5;

const searchWithRetries = async (title, type, system = '') => {
    let discovered = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            // eslint-disable-next-line no-await-in-loop
            return await search(title, type, system);
        } catch (error) {
            if (error.status === 404 && !discovered) {
                // eslint-disable-next-line no-await-in-loop
                endpoint = await discoverEndpoint();
                discovered = true;
            } else if (![401, 403].includes(error.status) || attempt === MAX_ATTEMPTS) {
                throw error;
            }
        }
    }

    throw new Error('HowLongToBeat kept rejecting the search');
};

export default async (input) => {
    if (!input.types.includes('timeToBeat')) {
        return {};
    }

    try {
        let data = await searchWithRetries(input.title, input.type, input.system);

        if (!data) {
            data = await searchWithRetries(input.title, input.type);
        }

        return {
            timeToBeat: data ? Math.round((data.comp_main || data.comp_plus || data.comp_100) / 1800) / 2 : 0,
        };
    } catch (error) {
        console.error('HowLongToBeat lookup failed:', error);

        return {};
    }
};
