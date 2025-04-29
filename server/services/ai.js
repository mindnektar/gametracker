import { GoogleGenAI } from '@google/genai';
import config from '../config';

const ai = new GoogleGenAI({ apiKey: config.ai.apiKey });

const generateGameInfo = async (system, title, model) => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `
                Please provide a JSON document describing the ${system} game "${title}" with the following structure:
                "story": a spoiler-free description of the game's story and/or theme, about 100 words.
                "gameplay": a spoiler-free description of the game's main gameplay mechanics, about 100 words. if the game is a sequel, feel
                    free to incorporate relevant differences to the previous game.
                "history": interesting background information about how and by whom the game was created, about 100 words.
                "releaseYear": the year the game was first released in any region.
                "developer": the name of the game's developer without any company suffixes such as "inc.", "gmbh", "co." or "ltd.".
            `,
        });

        return JSON.parse(response.text.replace(/```(json)?/g, '').trim());
    } catch (error) {
        console.error(error);
        if (error.code === 503) {
            return null;
        }

        throw error;
    }
};

export default async (title, system) => {
    let response;
    const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];

    while (!response && models.length > 0) {
        response = await generateGameInfo(system, title, models.shift());
    }

    return response;
};
