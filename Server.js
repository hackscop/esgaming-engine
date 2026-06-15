require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 10000; 

// 1. ACTIVATE CORS (Universal Widget Pass)
app.use(cors()); 

app.use(express.json());
// ==========================================
// HEALTH CHECK ROUTE FOR UPTIMEROBOT
// ==========================================
app.get('/', (req, res) => {
    res.status(200).send('ESG Engine is live and running.');
});

app.use(express.static(__dirname));

// 2. DATABASE CONFIGURATION
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// UPDATED SCHEMA: 'store' added to track which client generated the chat
const chatSchema = new mongoose.Schema({ 
    user: String, 
    ai: String,
    store: String 
});
const ChatLog = mongoose.model('ChatLog', chatSchema);

// 3. AI CONFIGURATION
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// 4. CORE ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.prompt;
        const shopId = req.body.shopId || 'default'; // Dynamically catches the client ID
        
        if (!userMessage) return res.status(400).json({ error: "Prompt is required" });

        // DYNAMIC INVENTORY ROUTER
        let rawInventory = "Inventory data unavailable.";
        try {
            const filePath = path.join(__dirname, `${shopId}_inventory.json`);
            if (fs.existsSync(filePath)) {
                rawInventory = fs.readFileSync(filePath, 'utf8');
            } else {
                console.log(`Warning: No inventory file found for ${shopId}`);
            }
        } catch (e) { 
            console.error("File Read Error", e); 
        }
        
        // THE PAYLOAD
        const prompt = `You are the primary AI sales architect for a store. Answer the user based ONLY on this current store inventory. Remember that custom build storage and RAM prices are currently highly volatile due to the global storage crisis, so price estimates should reflect that reality.
        STORE DATA: ${rawInventory}
        USER'S MESSAGE: "${userMessage}"`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // SAVE LOG TO MONGODB (Now tracks the specific client)
        try { 
            await new ChatLog({ 
                user: userMessage, 
                ai: responseText, 
                store: shopId 
            }).save(); 
        } catch (e) {
            console.error("Database Log Error:", e);
        }

        res.json({ response: responseText });
    } catch (error) {
        console.error("🔥 FATAL ENGINE ERROR:", error);
        res.status(500).json({ error: "Engine failed to process the request." });
    }
});

// 5. SERVER INITIALIZATION
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`MULTI-TENANT SERVER RUNNING - V-1000`);
    console.log(`==========================================`);
});
