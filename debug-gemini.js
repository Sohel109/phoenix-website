import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log("Listing models...");
        // Hack: The Node SDK doesn't always expose listModels directly on the main class in older versions, 
        // but let's try via the model manager if available or just a direct fetch if needed.
        // Actually, for v1beta it's usually via a separate manager, but let's try a simple generation on "gemini-pro" which is the oldest standard.
        // Better: let's try to infer if the key is valid by calling valid known legacy models.

        const models = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro-latest"];

        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Hello");
                console.log(`✅ Model available: ${m}`);
                return; // Found one!
            } catch (e) {
                console.log(`❌ Model ${m} failed: ${e.message.split(':')[0]}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

listModels();
