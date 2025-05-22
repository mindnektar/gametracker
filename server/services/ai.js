import { GoogleGenAI } from '@google/genai';
import config from '../config';
import developerMap from './developerMap';

const ai = new GoogleGenAI({ apiKey: config.ai.apiKey });

const generateGameInfo = async (input, model) => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `
                Please provide a JSON document describing the ${input.system} game "${input.title}"
                ${input.compilation ? ` from the compilation "${input.compilation}"` : ''} with the following structure:
                "story": a spoiler-free description of the game's story and what it is about, about 100 words.
                "gameplay": a spoiler-free description of the game's main gameplay mechanics, about 100 words. If the game is a sequel, feel
                    free to incorporate relevant differences to the previous game.
                "history": interesting background information about how and by whom the game was created, about 100 words.
                "releaseYear": the year the game was first released in any region.
                "developer": the name of the game's developer without any company suffixes such as "inc.", "gmbh", "co." or "ltd.". Avoid
                    abbreviations (e.g. use "Electronic Arts" rather than "EA"). Favor names as they are used colloquially (e.g. use
                    "Nintendo" rather than "Nintendo EAD" or "Remedy" rather than "Remedy Entertainment"). Omit location-specific details
                    (e.g. use "Ubisoft" rather than "Ubisoft Montpellier" or "2K Games" rather than "2K Boston").
                "franchise": if the game is part of a franchise spanning multiple titles, please provide the name of the franchise. For
                    example, "The Legend of Zelda" is part of the "Zelda" franchise, and "Super Mario Galaxy" belongs to "Mario". "Celeste"
                    has no franchise because it is just a single game.

                Additional instructions or information:
                - If the specified system is not the one the game was originally developed for, base your information on the system that was
                    specified (such as "Okami" on the Wii, which was developed by Ready at Dawn rather than Clover Studios).
                - Please only provide factual details that you can confirm. If you are unable to find accurate information, please
                    just return null and do not invent or extrapolate any details.
                ${input.aiInstructions ? `- ${input.aiInstructions}` : ''}
            `,
        });

        const result = JSON.parse(response.text.replace(/.*```(json)?(.*)```.*$/s, '$2').trim());
        const description = `## Story & Theme

${result.story}

## Gameplay

${result.gameplay}

## History

${result.history}`;

        const data = {
            description,
            release: result.releaseYear,
            developer: developerMap[result.developer] || result.developer,
            franchise: result.franchise,
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

export default async (input) => {
    if (!['description', 'release', 'developer', 'franchise'].some((type) => input.types.includes(type))) {
        return {};
    }

    let response;
    const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

    while (!response && models.length > 0) {
        response = await generateGameInfo(input, models.shift());
    }

    return response;
};
