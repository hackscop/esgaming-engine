require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

// PASTE YOUR GEMINI API KEY HERE
const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

// THE FIX: We create a global memory bank outside the route so it doesn't get erased
let conversationHistory = [];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/ask', async (req, res) => {
    try {
        const userPrompt = req.query.prompt;
        if (!userPrompt) return res.status(400).json({ error: "Prompt cannot be empty." });

        const dbData = await fs.readFile(path.join(__dirname, 'database.json'), 'utf-8');
        const liveInventory = JSON.parse(dbData);
        
        let inventoryText = "LIVE INVENTORY STATUS:\n";
        liveInventory.forEach(product => {
            inventoryText += `- ${product.item}: ${product.price} KES (${product.status})\n`;
        });

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { temperature: 0.7 },
            systemInstruction: `You are the AI Assistant for ESGaming. 

            ${inventoryText}

            CORE BEHAVIOR RULES:
            1. Only quote prices and availability based on the LIVE INVENTORY STATUS provided above. If an item is "Out of Stock", tell the user explicitly.
            2. Be natural, conversational, and friendly. Handle greetings casually.
            3. Off-Topic Boundary: Only assist with gaming, hardware, or the ESGaming store.
            4. Website Action: If the user asks to see a section, output JSON: {"reply": "...", "action": "scroll", "target": "#css-id"}. Otherwise, just reply naturally in plain text.`
        });

        // THE FIX: We feed the past conversation into the AI before asking the new question
        const chatSession = model.startChat({ history: conversationHistory });
        const result = await chatSession.sendMessage(userPrompt);
        let rawResponse = result.response.text();

        // THE FIX: We record both what you said, and what the AI answered, into the memory bank for next time
        conversationHistory.push({ role: "user", parts: [{ text: userPrompt }] });
        conversationHistory.push({ role: "model", parts: [{ text: rawResponse }] });

        let aiCommand;
        try {
            let cleaned = rawResponse.replace(/```json/gi, '').replace(/```/gi, '').trim();
            aiCommand = JSON.parse(cleaned);
        } catch (e) {
            aiCommand = { reply: rawResponse, action: "none", target: null };
        }

        res.json(aiCommand);
    } catch (error) {
        console.error("Engine internal fault:", error);
        res.status(500).json({ error: "Agent Engine failure.", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log("=========================================");
    console.log("DYNAMIC INJECTION ENGINE ONLINE (WITH MEMORY)");
    console.log("Server: http://localhost:" + PORT);
    console.log("=========================================");
});
