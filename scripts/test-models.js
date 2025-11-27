const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // There isn't a direct listModels on genAI instance in some versions, 
        // but usually we can try to just use a known model or check documentation.
        // Actually, the SDK might not expose listModels directly in the main class easily in all versions.
        // Let's try to just run a simple generation with a very basic model name 'gemini-pro' 
        // but since that failed, let's try to see if we can get model info.
        // Wait, the error message itself suggests "Call ListModels".
        // The Node SDK doesn't always have a simple listModels helper exposed in the high level entry.
        // But we can try to use the model 'gemini-1.0-pro' which is often the specific name.

        console.log("Trying gemini-1.0-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.0-pro");
        console.log(result.response.text());
    } catch (error) {
        console.error("Failed with gemini-1.0-pro:", error.message);
    }

    try {
        console.log("Trying gemini-1.5-flash-001...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash-001");
        console.log(result.response.text());
    } catch (error) {
        console.error("Failed with gemini-1.5-flash-001:", error.message);
    }
}

listModels();
