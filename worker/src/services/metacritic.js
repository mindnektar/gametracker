import { closest, distance } from 'fastest-levenshtein';
import { fetchCriticRating } from './ai';

const apiKey = '1MOZgmNFxvmljaQR1X9KAij9Mo4xAY3u';
const baseUrl = 'https://backend.metacritic.com';

const systemMap = {
    Switch: 'Nintendo Switch',
    'PlayStation Portable': 'PSP',
};

const get = async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Metacritic responded with ${response.status} for ${url}`);
    }

    return response.json();
};

// Autosuggest fuzzy-matches anything, so verify the best candidate actually resembles the
// requested title. Containment covers edition variants ("... - Complete Edition"), the
// distance threshold covers small spelling differences ("Pokemon" vs "Pokémon").
const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const isMatch = (title, candidate) => {
    const a = normalize(title);
    const b = normalize(candidate);

    return a.includes(b) || b.includes(a) || distance(a, b) <= a.length / 4;
};

const findGame = async (title, system) => {
    const data = await get(`${baseUrl}/finder/metacritic/autosuggest/${encodeURIComponent(title)}?apiKey=${apiKey}`);
    const games = data.data.items.filter(({ type }) => type === 'game-title');
    const matchingSystem = games.filter(({ platforms }) => platforms.some(({ name }) => name === system));
    // If Metacritic doesn't list the requested system, still match the game itself so the
    // fallback chain can look for a rating elsewhere.
    const candidates = matchingSystem.length > 0 ? matchingSystem : games;

    if (candidates.length === 0) {
        return null;
    }

    const closestTitle = closest(title, candidates.map((item) => item.title));

    return isMatch(title, closestTitle) ? candidates.find((item) => item.title === closestTitle) : null;
};

// The autosuggest endpoint only carries the lead platform's score; the game details
// endpoint has a score summary for each platform individually.
const fetchPlatform = async (slug, system) => {
    const data = await get(`${baseUrl}/games/metacritic/${slug}/web?apiKey=${apiKey}`);

    return data.data.item.platforms.find(({ name }) => name === system);
};

const fetchUserScore = async (slug, platformSlug) => {
    const data = await get(`${baseUrl}/reviews/metacritic/user/games/${slug}/platform/${platformSlug}/stats/web?apiKey=${apiKey}`);

    return data.data.item.score;
};

export default async (env, input) => {
    if (!input.types.includes('criticRating')) {
        return {};
    }

    try {
        const systemName = input.type === 'dlc' ? input.game.system.name : input.system;
        const system = systemMap[systemName] || systemName;
        const title = input.type === 'dlc' ? `${input.game.title}: ${input.title}` : input.title;

        const game = await findGame(title, system);
        const platform = game && await fetchPlatform(game.slug, system);

        if (platform?.criticScoreSummary?.score) {
            return { criticRating: platform.criticScoreSummary.score };
        }

        if (platform) {
            const userScore = await fetchUserScore(game.slug, platform.slug);

            if (userScore) {
                return { criticRating: Math.round(userScore * 10) };
            }
        }

        const fallback = await fetchCriticRating(env, { title, system: systemName });

        return { criticRating: Math.round(fallback?.rating) || 0 };
    } catch (error) {
        console.error('Metacritic lookup failed:', error);

        return {};
    }
};
