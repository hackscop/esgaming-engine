// 1. IMPORTS & CONFIGURATION
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose'); // <-- The new MongoDB driver
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// 2. DATABASE CONNECTION (MONGODB)
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("FATAL ERROR: MONGODB_URI is missing from environment variables.");
    process.exit(1);
}

// Connect to Atlas
mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define the Database Structure (Schema) for your logs
const chatSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    user: String,
    ai: String
});
const ChatLog = mongoose.model('ChatLog', chatSchema);

// 3. AI & MEMORY INITIALIZATION
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is missing from environment variables.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Active memory bank for the current conversation
let conversationHistory = [];

// 4. ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.prompt;
        
        if (!userMessage) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const formattedHistory = conversationHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.parts }]
        }));

        const chatSession = model.startChat({ history: formattedHistory });
        const result = await chatSession.sendMessage(userMessage);
        const responseText = result.response.text();

        conversationHistory.push({ role: "user", parts: userMessage });
        conversationHistory.push({ role: "model", parts: responseText });

        // Save permanent log to MongoDB Atlas
        try {
            const newLog = new ChatLog({ user: userMessage, ai: responseText });
            await newLog.save();
            console.log("✅ Log securely saved to permanent database.");
        } catch (dbErr) {
            console.error("Warning: Could not save to MongoDB", dbErr);
        }

        res.json({ response: responseText });

    } catch (error) {
        console.error("Engine Error:", error);
        res.status(500).json({ error: "Internal server error connecting to AI engine." });
    }
});

// 5. SERVER LAUNCH
app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`DYNAMIC INJECTION ENGINE ONLINE (WITH MEMORY & MONGODB)`);
    console.log(`Running in Production Mode on Port: ${PORT}`);
    console.log(`========================================================`);
});
