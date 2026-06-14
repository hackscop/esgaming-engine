require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 10000; 

app.use(express.json());
app.use(express.static(__dirname));

// MONGODB CONNECTION
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Error:", err));

const chatSchema = new mongoose.Schema({ user: String, ai: String });
const ChatLog = mongoose.model('ChatLog', chatSchema);

// THE FIX: Universal Base Model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.prompt;
        if (!userMessage) return res.status(400).json({ error: "Prompt is required" });

        let rawInventory = "Inventory list currently unavailable.";
        try {
            const lowerPath = path.join(__dirname, 'inventory.json');
            const upperPath = path.join(__dirname, 'Inventory.json');
            
            if (fs.existsSync(lowerPath)) {
                rawInventory = fs.readFileSync(lowerPath, 'utf8');
            } else if (fs.existsSync(upperPath)) {
                rawInventory = fs.readFileSync(upperPath, 'utf8');
            }
        } catch (fileErr) {
            console.error("⚠️ File Read Error:", fileErr);
        }
        
        const hiddenContext = `
        [SYSTEM OVERRIDE: You are the ESGaming Architect. Answer the user based ONLY on this current store inventory. Do not tell them you are reading a file.
        CURRENT STORE DATA:
        ${rawInventory}
        
        USER'S MESSAGE: "${userMessage}"]`;

        const chatSession = model.startChat({ history: [] });
        const result = await chatSession.sendMessage(hiddenContext);
        const responseText = result.response.text();

        try {
            await new ChatLog({ user: userMessage, ai: responseText }).save();
        } catch (dbErr) {
            console.error("MongoDB Save Error:", dbErr);
        }

        res.json({ response: responseText });
    } catch (error) {
        console.error("AI Engine Error:", error);
        res.status(500).json({ error: "Engine failed to process the request." });
    }
});

app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`SERVER RUNNING - UNIVERSAL GEMINI-PRO MODEL`);
    console.log(`==========================================`);
});
