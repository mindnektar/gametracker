import { GoogleGenAI } from '@google/genai';
import config from '../config';

export default async (title, system) => {
    try {
        const ai = new GoogleGenAI({ apiKey: config.ai.apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Please provide a description of about 100 words, release year, developer, and genres for the ${system} game ${title}, in JSON format.`,
        });

        return JSON.parse(response.text.replace(/```(json)?/g, '').trim());
    } catch (error) {
        console.error(error);
    }
};
