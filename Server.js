// 1. IMPORTS & CONFIGURATION
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// THE RENDER FIX: Cloud servers assign dynamic ports automatically.
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and serve static files (like your HTML and CSS)
app.use(express.json());
app.use(express.static(__dirname));

// 2. AI & MEMORY INITIALIZATION
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is missing from environment variables.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Active memory bank
let conversationHistory = [];

// 3. ROUTES
// Frontend Route: Serve the main web page (Must be exactly 'index.html' lowercase)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Route: Handle chat requests from the frontend
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.prompt;
        
        if (!userMessage) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // Format history for the Gemini SDK
        const formattedHistory = conversationHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.parts }]
        }));

        // Initialize chat with memory
        const chatSession = model.startChat({
            history: formattedHistory
        });

        // Send the new prompt
        const result = await chatSession.sendMessage(userMessage);
        const responseText = result.response.text();

        // Save interaction to temporary server memory
        conversationHistory.push({ role: "user", parts: userMessage });
        conversationHistory.push({ role: "model", parts: responseText });

        // Optional: Save interaction to persistent database.json
        try {
            const dbData = await fs.readFile('database.json', 'utf8').catch(() => '[]');
            const db = JSON.parse(dbData || '[]');
            db.push({ timestamp: new Date().toISOString(), user: userMessage, ai: responseText });
            await fs.writeFile('database.json', JSON.stringify(db, null, 2));
        } catch (dbErr) {
            console.error("Warning: Could not write to database.json", dbErr);
        }

        // Send data back to frontend
        res.json({ response: responseText });

    } catch (error) {
        console.error("Engine Error:", error);
        res.status(500).json({ error: "Internal server error connecting to AI engine." });
    }
});

// 4. SERVER LAUNCH
app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`DYNAMIC INJECTION ENGINE ONLINE (WITH MEMORY)`);
    console.log(`Running in Production Mode on Port: ${PORT}`);
    console.log(`========================================================`);
});
