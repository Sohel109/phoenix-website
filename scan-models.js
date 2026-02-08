import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const token = process.env.HF_API_TOKEN;
if (!token) {
    console.error("No HF_API_TOKEN in .env");
    process.exit(1);
}

const models = [
    "google/gemma-1.1-2b-it",
    "google/gemma-2b-it",
    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    "Qwen/Qwen1.5-0.5B-Chat",
    "Qwen/Qwen1.5-1.8B-Chat",
    "microsoft/phi-2",
    "HuggingFaceH4/zephyr-7b-beta",
    "mistralai/Mistral-7B-Instruct-v0.2",
    "facebook/opt-350m",
    "bigscience/bloom-560m"
];

async function checkModel(model) {
    console.log(`Testing ${model}...`);
    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: "Hello", options: { wait_for_model: true } })
        });

        if (response.ok) {
            console.log(`✅ SUCCESS: ${model} is working!`);
            return model;
        } else {
            console.log(`❌ FAIL: ${model} returned ${response.status} ${response.statusText}`);
        }
    } catch (e) {
        console.log(`❌ ERROR: ${model} - ${e.message}`);
    }
    return null;
}

async function scan() {
    console.log(`Scanning ${models.length} models with token ${token.slice(0, 5)}...`);
    for (const m of models) {
        const success = await checkModel(m);
        if (success) {
            console.log(`\n🎉 FOUND WORKING MODEL: ${success}`);
            console.log("Please update server.js with this model.");
            process.exit(0);
        }
    }
    console.log("No working models found.");
}

scan();
