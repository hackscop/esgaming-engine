require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// MULTI-TENANT PROFILE DATABASE (UPDATED WITH YOUR LIVE TEST NUMBER)
const shopProfiles = {
    "phoneplace": {
        location: "Bazaar Plaza, Mezzanine Floor, Nairobi CBD",
        support: "0722 466 466",
        whatsapp: "254722466466"
    },
    "pcgamer": {
        location: "Biashara Street, Nairobi CBD",
        support: "0743886226",
        whatsapp: "254743886226"
    },
    "kmdtech": {
        location: "Moi Avenue, Nairobi",
        support: "0743886226",
        whatsapp: "254743886226"
    },
    "default": {
        location: "our main Nairobi branch",
        support: "0743886226",
        whatsapp: "254743886226"
    }
};

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, shopId, image } = req.body;
        
        const profile = shopProfiles[shopId] || shopProfiles["default"];
        
        let inventoryData = "No inventory available.";
        const inventoryPath = `./${shopId}_inventory.json`;
        if (fs.existsSync(inventoryPath)) {
            inventoryData = fs.readFileSync(inventoryPath, 'utf8');
        }

                const systemInstruction = `You are an elite sales assistant and store navigator for ${shopId}. 
        
        INVENTORY & VISION: Match users with the perfect item using this stock list: ${inventoryData}. If the user provides an image, look at it carefully, identify it, and check if we have it or a direct alternative in stock. 
        
        NAVIGATION & SUPPORT: If the user asks for our physical location, tell them we are located at ${profile.location}. If they ask for customer care, provide our official support line: ${profile.support}.
        
        HANDOFF PROTOCOL: 
        1. CRITICAL TRIGGER: You must ONLY output the exact string [TRIGGER_HUMAN_HANDOFF] if the user explicitly asks to speak to a human, an agent, or live support. 
        2. Do NOT offer or suggest a human agent under any other circumstances, even if the user is frustrated. 
        3. Never output the trigger string if the user is just saying "yes" to a product.
        
        TONE: Be brief, highly professional, and do not use filler words.`;


        let contentParts = [
            systemInstruction,
            `User Message: ${prompt}`
        ];

        if (image && image.base64 && image.mimeType) {
            contentParts.push({
                inlineData: {
                    data: image.base64,
                    mimeType: image.mimeType
                }
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contentParts,
        });

        res.json({ 
            response: response.text,
            whatsapp: profile.whatsapp
        });

    } catch (error) {
        console.error('Server Engine Error:', error);
        res.status(500).json({ error: 'System offline or processing error.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`AI Platform live on port ${PORT}`);
});
