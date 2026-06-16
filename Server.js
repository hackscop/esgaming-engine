require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const app = express();
// Crucial: Increase the limit to handle the large base64 image strings
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Initialize the Google Gen AI client with your key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, shopId, image } = req.body;
        
        // 1. DYNAMIC INVENTORY RESOLUTION
        let inventoryData = "No inventory available.";
        const inventoryPath = `./${shopId}_inventory.json`;
        if (fs.existsSync(inventoryPath)) {
            inventoryData = fs.readFileSync(inventoryPath, 'utf8');
        }

        // 2. CONSTRUCT SYSTEM INSTRUCTIONS
        const systemInstruction = `You are an expert sales assistant. Match users with the perfect item using this stock list: ${inventoryData}. If the user provides an image, look at it carefully, identify what it is, and check if we have it or a direct alternative in stock. Be brief and highly professional.`;

        // 3. ASSEMBLE MULTIMODAL CONTENT ARRAY
        let contentParts = [
            systemInstruction,
            `User Message: ${prompt}`
        ];

        // If an image payload was sent from the paperclip, inject its binary pixels
        if (image && image.base64 && image.mimeType) {
            contentParts.push({
                inlineData: {
                    data: image.base64,
                    mimeType: image.mimeType
                }
            });
        }

        // 4. EXECUTE GEMINI GENERATION
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: contentParts,
        });

        res.json({ response: response.text });

    } catch (error) {
        console.error('Server Engine Error:', error);
        res.status(500).json({ error: 'System offline or processing error.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`AI Platform live on port ${PORT}`);
});
