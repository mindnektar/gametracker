import developerMap from './developerMap';
import genres from './genres.json';

// The Gemini REST API, called the same way @google/genai's ai.models.generateContent was
const generateContent = async (env, { model, config, contents }) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.AI_API_KEY,
        },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: contents }] }],
            ...config,
        }),
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
        const message = body?.error?.message || `Gemini responded with ${response.status}`;

        // Same wording the SDK used, so the fallback to the next model keeps working
        throw new Error(response.status === 503 ? `The model is overloaded: ${message}` : message);
    }

    // Like the SDK's `text`: all text parts of the first candidate, without thoughts
    const parts = body?.candidates?.[0]?.content?.parts || [];

    return { text: parts.filter(({ text, thought }) => text && !thought).map(({ text }) => text).join('') };
};

// Ground factual lookups in Google Search results so the model doesn't hallucinate
// details for games that are too new or too obscure for its training data.
const searchGrounding = { tools: [{ googleSearch: {} }] };

// The model is instructed to return null for anything it cannot verify, so both the
// whole document and individual sections may be missing.
const buildDescription = (result) => {
    const sections = [
        ['Story & Theme', result.story],
        ['Gameplay', result.gameplay],
        ['History', result.history],
    ].filter(([, text]) => text);

    return sections.length > 0 ? sections.map(([heading, text]) => `## ${heading}\n\n${text}`).join('\n\n') : null;
};

const generateGameInfo = async (env, input, model) => {
    try {
        if (input.type === 'dlc') {
            const response = await generateContent(env, {
                model,
                config: searchGrounding,
                contents: `
                    Please provide a JSON document describing the DLC "${input.title}" for the ${input.game.system.name} game
                    "${input.game.title}" with the following structure:
                    "story": a spoiler-free description of the DLC's story, what it is about and how it pertains to the main game, about
                        100 words.
                    "gameplay": a spoiler-free description of the DLC's main gameplay mechanics, about 100 words. Focus on the differences
                        to the main game.
                    "history": interesting background information about how the DLC was created, about 100 words.
                    "release": the year the DLC was first released in any region.

                    Use Google Search to verify factual details instead of relying on memory, especially for recent or lesser-known
                    DLCs. If you are unable to find accurate information, please just return null and do not invent any details.
                `,
            });

            const result = JSON.parse(response.text.replace(/.*```(json)?(.*)```.*$/s, '$2').trim());

            if (!result) {
                return {};
            }

            return {
                description: buildDescription(result),
                release: result.release,
            };
        }

        const response = await generateContent(env, {
            model,
            config: searchGrounding,
            contents: `
                Please provide a JSON document describing the ${input.system} game "${input.title}"
                ${input.compilation ? ` from the compilation "${input.compilation}"` : ''} with the following structure:
                "story": a spoiler-free description of the game's story and what it is about, about 100 words.
                "gameplay": a spoiler-free description of the game's main gameplay mechanics, about 100 words. If the game is a sequel, feel
                    free to incorporate relevant differences to the previous game.
                "history": interesting background information about how and by whom the game was created, about 100 words.
                "release": the year the game was first released in any region.
                "developer": the name of the game's developer without any company suffixes such as "inc.", "gmbh", "co." or "ltd.". Avoid
                    abbreviations (e.g. use "Electronic Arts" rather than "EA"). Favor names as they are used colloquially (e.g. use
                    "Nintendo" rather than "Nintendo EAD" or "Remedy" rather than "Remedy Entertainment"). Omit location-specific details
                    (e.g. use "Ubisoft" rather than "Ubisoft Montpellier" or "2K Games" rather than "2K Boston").
                "franchise": if the game is part of a franchise spanning multiple titles, please provide the name of the franchise. For
                    example, "The Legend of Zelda" is part of the "Zelda" franchise, and "Super Mario Galaxy" belongs to "Mario". "Celeste"
                    has no franchise because it is just a single game.
                "country": the country of origin of the game. If the game was developed in more than one country, return the one where the
                    main force of the development was based. if the country is USA, return "United States". any UK countries should be
                    returned as "United Kingdom".
                "genres": an array of strings, each of which should be an item from the following list: ${genres.join(', ')}. only pick
                    items that are essential in describing the game. for example, while BioShock has role-playing elements, it is not a
                    role-playing game.

                Additional instructions or information:
                - If the specified system is not the one the game was originally developed for, base your information on the system that was
                    specified (such as "Okami" on the Wii, which was developed by Ready at Dawn rather than Clover Studios).
                - Use Google Search to verify every factual detail (developer, country, release year, franchise, genres) instead of
                    relying on memory, especially for recent or lesser-known games. Prefer official sources such as the game's Steam
                    page, the developer's or publisher's website and platform store pages, as well as reputable databases such as
                    Wikipedia and MobyGames.
                - Please only provide factual details that you can confirm. If you are unable to find accurate information for a
                    field, return null for that field and do not invent or extrapolate any details. If you cannot find the game at
                    all, return null instead of the JSON document.
                ${input.aiInstructions ? `- ${input.aiInstructions}` : ''}
            `,
        });

        const result = JSON.parse(response.text.replace(/.*```(json)?(.*)```.*$/s, '$2').trim());

        if (!result) {
            return {};
        }

        const data = {
            description: buildDescription(result),
            release: result.release,
            developer: developerMap[result.developer] || result.developer,
            franchise: result.franchise,
            country: result.country,
            genres: result.genres,
        };

        return input.types.reduce((acc, type) => ({
            ...acc,
            [type]: data[type],
        }), {});
    } catch (error) {
        if (error.message.includes('The model is overloaded')) {
            return null;
        }

        throw error;
    }
};

const generateCriticRating = async (env, input, model) => {
    try {
        const response = await generateContent(env, {
            model,
            config: searchGrounding,
            contents: `
                Please use Google Search to find a critic rating for the ${input.system} game "${input.title}" and provide a JSON
                document with the following structure:
                "rating": the rating as an integer between 0 and 100.
                "source": the name of the source the rating was taken from.

                Metacritic has neither a critic nor a user score for this game on this system, so consult other reputable sources
                such as OpenCritic, aggregated press reviews or the reception section of the game's Wikipedia article. Prefer
                aggregate scores over individual reviews, but a score from a single reputable publication is acceptable as a last
                resort. If a score is only available for a different system, you may use it. Convert ratings on other scales (such
                as 4.5/5 or 8/10) to a 0-100 scale. If you cannot find any rating at all, return null instead of the JSON document.
                Do not invent or estimate a rating yourself.
            `,
        });

        return JSON.parse(response.text.replace(/.*```(json)?(.*)```.*$/s, '$2').trim());
    } catch (error) {
        if (error.message.includes('The model is overloaded')) {
            return null;
        }

        throw error;
    }
};

const generateDescriptorData = async (env, input, model) => {
    try {
        const response = await generateContent(env, {
            model,
            contents: `
                Please generate a JSON document containing information about the ${input.game.system.name} game
                "${input.game.title}" with the following keys: atmosphere, mood, pacing, complexity, playerAgency,
                narrativeStructure, challengeFocus, challengeIntensity. Each item should have a value between 0 and 4.

                Here is what each value means:

                {
                    atmosphere: {
                        label: 'Atmosphere',
                        icon: 'air',
                        values: {
                            0: {
                                label: 'Cozy',
                                description: 'Warm, safe and inviting; encourages comfort and familiarity',
                            },
                            1: {
                                label: 'Relaxed',
                                description: 'Calm and easygoing, with little urgency or stress',
                            },
                            2: {
                                label: 'Neutral',
                                description: 'Emotionally even; neither calming nor intense',
                            },
                            3: {
                                label: 'Tense',
                                description: 'Builds suspense or pressure; keeps the player alert',
                            },
                            4: {
                                label: 'Scary',
                                description: 'Designed to provoke fear, dread or anxiety',
                            },
                        },
                    },
                    mood: {
                        label: 'Mood',
                        icon: 'mood',
                        values: {
                            0: {
                                label: 'Whimsical',
                                description: 'Quirky, imaginative or playfully absurd',
                            },
                            1: {
                                label: 'Cheerful',
                                description: 'Positive, uplifting, or hopeful in tone',
                            },
                            2: {
                                label: 'Neutral',
                                description: 'Emotionally balanced or subdued in expression',
                            },
                            3: {
                                label: 'Somber',
                                description: 'Reflective, melancholic, or quietly emotional',
                            },
                            4: {
                                label: 'Grim',
                                description: 'Bleak, serious or emotionally heavy',
                            },
                        },
                    },
                    pacing: {
                        label: 'Pacing',
                        icon: 'directions_run',
                        values: {
                            0: {
                                label: 'Slow',
                                description: 'Deliberate and measured, with minimal urgency',
                            },
                            1: {
                                label: 'Steady',
                                description: 'Consistent rhythm, unhurried but purposeful',
                            },
                            2: {
                                label: 'Dynamic',
                                description: 'Pacing varies with gameplay shifts or discovery',
                            },
                            3: {
                                label: 'Fast',
                                description: 'Quick and constant action or movement',
                            },
                            4: {
                                label: 'Chaotic',
                                description: 'Intentionally overwhelming or frenzied',
                            },
                        },
                    },
                    complexity: {
                        label: 'Complexity',
                        icon: 'psychology',
                        values: {
                            0: {
                                label: 'Minimal',
                                description: 'Extremely simple mechanics with little depth',
                            },
                            1: {
                                label: 'Straightforward',
                                description: 'Easy to understand with some nuance',
                            },
                            2: {
                                label: 'Balanced',
                                description: 'Accessible yet meaningfully layered',
                            },
                            3: {
                                label: 'Involved',
                                description: 'Requires learning and managing multiple systems',
                            },
                            4: {
                                label: 'Deep',
                                description: 'Highly complex, often with steep learning curves',
                            },
                        },
                    },
                    playerAgency: {
                        label: 'Player Agency',
                        icon: 'arrow_split',
                        values: {
                            0: {
                                label: 'Fixed',
                                description: 'Tightly scripted with no meaningful choices',
                            },
                            1: {
                                label: 'Guided',
                                description: 'Some freedom within a clear structure',
                            },
                            2: {
                                label: 'Flexible',
                                description: 'Allows various approaches to objectives',
                            },
                            3: {
                                label: 'Open',
                                description: 'Broad freedom over pace, paths and goals',
                            },
                            4: {
                                label: 'Freeform',
                                description: 'Unrestricted and self-directed with no set path',
                            },
                        },
                    },
                    narrativeStructure: {
                        label: 'Narrative Structure',
                        icon: 'book_5',
                        values: {
                            0: {
                                label: 'Negligible',
                                description: 'No story or one so minimal it has no real impact on the experience',
                            },
                            1: {
                                label: 'Implied',
                                description: 'Story hinted at through worldbuilding or environmental context',
                            },
                            2: {
                                label: 'Linear',
                                description: 'Follows a set narrative path with little deviation',
                            },
                            3: {
                                label: 'Branching',
                                description: 'Choices meaningfully alter the story's direction or outcome',
                            },
                            4: {
                                label: 'Emergent',
                                description: 'Story arises organically from player behavior or gameplay systems',
                            },
                        },
                    },
                    challengeFocus: {
                        label: 'Challenge Focus',
                        icon: 'chess',
                        values: {
                            0: {
                                label: 'Reflexive',
                                description: 'Reaction time and quick decision-making under pressure',
                            },
                            1: {
                                label: 'Tactile',
                                description: 'Fine motor control, rhythm, or physical coordination of inputs',
                            },
                            2: {
                                label: 'Balanced',
                                description: 'Even mix of phyiscal and mental challenge',
                            },
                            3: {
                                label: 'Logical',
                                description: 'Reasoning, deduction or abstract thinking',
                            },
                            4: {
                                label: 'Strategic',
                                description: 'Long-term planning, management and optimization',
                            },
                        },
                    },
                    challengeIntensity: {
                        label: 'Challenge Intensity',
                        icon: 'swords',
                        values: {
                            0: {
                                label: 'Gentle',
                                description: 'Minimal challenge or pressure; very forgiving',
                            },
                            1: {
                                label: 'Easygoing',
                                description: 'Light difficulty with occasional friction',
                            },
                            2: {
                                label: 'Moderate',
                                description: 'Balanced challenge for a wide audience',
                            },
                            3: {
                                label: 'Demanding',
                                description: 'Consistent, engaging difficulty requiring focus',
                            },
                            4: {
                                label: 'Punishing',
                                description: 'High stakes and difficulty, often unforgiving',
                            },
                        },
                    }
                }

                Choose your values based on which ones describe the game best.

                A heads-up on the narrative structure: If the game has a barebones narrative but it would make little to no
                difference if it was removed, choose "Negligible" rather than "Linear". "Linear" is reserved for games that have an
                actual story to tell. An example for a "Negligible" narrative would be Super Mario Bros. 3. An example for "Linear"
                would be Celeste.
            `,
        });

        const result = JSON.parse(response.text.replace(/.*```(json)?(.*)```.*$/s, '$2').trim());

        return result;
    } catch (error) {
        if (error.message.includes('The model is overloaded')) {
            return null;
        }

        throw error;
    }
};

const request = async (env, method, input) => {
    if (!env.AI_API_KEY) {
        throw new Error('No AI_API_KEY secret found. See: https://ai.google.dev/gemini-api/docs/api-key');
    }

    let response;
    const models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];

    while (!response && models.length > 0) {
        // eslint-disable-next-line no-await-in-loop
        response = await method(env, input, models.shift());
    }

    return response;
};

export const fetchGameInfo = async (env, input) => {
    if (!['description', 'release', 'developer', 'franchise', 'country', 'genres'].some((type) => input.types.includes(type))) {
        return {};
    }

    return request(env, generateGameInfo, input);
};

export const fetchDescriptorData = async (env, input) => (
    request(env, generateDescriptorData, input)
);

export const fetchCriticRating = async (env, input) => (
    request(env, generateCriticRating, input)
);
