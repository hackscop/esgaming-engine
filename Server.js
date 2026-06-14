// 1. IMPORTS & CONFIGURATION
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// 2. DATABASE CONNECTION (MONGODB)
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("FATAL ERROR: MONGODB_URI is missing.");
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const chatSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    user: String,
    ai: String
});
const ChatLog = mongoose.model('ChatLog', chatSchema);

// 3. AI & MEMORY INITIALIZATION
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// ARCHITECT PERSONA INSTRUCTION
const systemInstruction = `You are the ESGaming Architect Agent. 
Your goal is to help users design and plan high-end custom PC builds. 
- ALWAYS prioritize technical accuracy regarding RTX 50-series and Ryzen 9000-series hardware.
- IF a user asks about stock, politely explain you are an AI assistant and suggest they use PCPartPicker.com to check real-time availability.
- KEEP your tone professional, technical, and gaming-focused.
- DO NOT break character.`;

const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: systemInstruction
});

let conversationHistory = [];

// 4. ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.prompt;
        if (!userMessage) return res.status(400).json({ error: "Prompt is required" });

        const formattedHistory = conversationHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.parts }]
        }));

        const chatSession = model.startChat({ history: formattedHistory });
        const result = await chatSession.sendMessage(userMessage);
        const responseText = result.response.text();

        conversationHistory.push({ role: "user", parts: userMessage });
        conversationHistory.push({ role: "model", parts: responseText });

        try {
            const newLog = new ChatLog({ user: userMessage, ai: responseText });
            await newLog.save();
        } catch (dbErr) {
            console.error("Warning: Could not save to MongoDB", dbErr);
        }

        res.json({ response: responseText });

    } catch (error) {
        console.error("Engine Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// 5. SERVER LAUNCH
app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`ESGAMING ARCHITECT ENGINE ONLINE (PERSONA ACTIVATED)`);
    console.log(`Running on Port: ${PORT}`);
    console.log(`========================================================`);
});
