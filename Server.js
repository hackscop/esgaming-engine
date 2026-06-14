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

// 1. DATABASE
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Error:", err));

const chatSchema = new mongoose.Schema({ user: String, ai: String });
const ChatLog = mongoose.model('ChatLog', chatSchema);

// 2. AI CONFIGURATION
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// 3. ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.prompt;
        if (!userMessage) return res.status(400).json({ error: "Prompt is required" });

        // Safely fetch inventory
        let rawInventory = "Inventory data unavailable.";
        try {
            const lowerPath = path.join(__dirname, 'inventory.json');
            const upperPath = path.join(__dirname, 'Inventory.json');
            if (fs.existsSync(lowerPath)) rawInventory = fs.readFileSync(lowerPath, 'utf8');
            else if (fs.existsSync(upperPath)) rawInventory = fs.readFileSync(upperPath, 'utf8');
        } catch (e) { console.error("File Read Error", e); }
        
        // The Payload
        const prompt = `You are the ESGaming Architect. Answer the user based ONLY on this current store inventory.
        STORE DATA: ${rawInventory}
        USER'S MESSAGE: "${userMessage}"`;

        // THE FIX: generateContent bypasses the 404 endpoint bug
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Save log
        try { await new ChatLog({ user: userMessage, ai: responseText }).save(); } catch (e) {}

        res.json({ response: responseText });
    } catch (error) {
        console.error("🔥 FATAL ENGINE ERROR:", error);
        res.status(500).json({ error: "Engine failed to process the request." });
    }
});

app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`DEPLOYMENT TRACKER: V-999 (FINAL FIX)`);
    console.log(`==========================================`);
});
