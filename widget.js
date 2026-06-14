(function() {
    const scriptTag = document.getElementById('es-ai-widget');
    const shopId = scriptTag ? scriptTag.getAttribute('data-shop-id') : 'default';
    const shopName = scriptTag ? scriptTag.getAttribute('data-shop-name') : 'AI Assistant';

    // 1. ADVANCED RESPONSIVE CSS & FULL-SCREEN MOBILE
    const style = document.createElement('style');
    style.innerHTML = `
        #es-widget-btn {
            position: fixed; bottom: 20px; right: 20px;
            background: #8A2BE2; color: white; border: none;
            border-radius: 50%; width: 60px; height: 60px;
            font-size: 24px; cursor: pointer; z-index: 999999;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: 0.3s;
        }
        #es-widget-btn:hover { transform: scale(1.1); }
        
        #es-chat-window {
            position: fixed; bottom: 90px; right: 20px;
            width: 350px; height: 500px; background: #1a1a2e;
            border: 1px solid #8A2BE2; border-radius: 10px;
            display: none; flex-direction: column; z-index: 999999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden; transition: all 0.3s ease;
        }
        
        /* MOBILE OVERRIDE: Becomes Full Screen on Phones */
        @media (max-width: 600px) {
            #es-chat-window {
                width: 100vw; height: 100vh;
                bottom: 0; right: 0;
                border-radius: 0;
                border: none;
            }
        }

        #es-chat-header {
            background: #8A2BE2; color: white; padding: 15px;
            font-weight: bold; text-align: center; letter-spacing: 1px;
            display: flex; justify-content: space-between; align-items: center;
        }
        #es-close-btn {
            background: none; border: none; color: white; font-size: 20px; cursor: pointer;
        }
        #es-chat-messages {
            flex: 1; padding: 15px; overflow-y: auto; color: white;
            display: flex; flex-direction: column; gap: 10px;
        }
        #es-chat-input-container {
            display: flex; padding: 10px; background: #0f0f1a; border-top: 1px solid #333;
        }
        #es-chat-input {
            flex: 1; padding: 10px; border-radius: 5px; border: 1px solid #333;
            background: #1a1a2e; color: white; outline: none; font-size: 16px; /* Prevents iOS zoom */
        }
        #es-chat-send {
            background: #8A2BE2; color: white; border: none; font-weight: bold;
            padding: 0 15px; margin-left: 10px; border-radius: 5px; cursor: pointer;
        }
        .es-msg-user { align-self: flex-end; background: #333; padding: 10px 14px; border-radius: 15px 15px 0 15px; font-size: 14px; max-width: 85%; }
        .es-msg-ai { align-self: flex-start; background: #8A2BE2; padding: 10px 14px; border-radius: 15px 15px 15px 0; font-size: 14px; max-width: 85%; line-height: 1.5; }
        .es-msg-ai strong { color: #f0f0f0; } /* Makes bold text pop */
    `;
    document.head.appendChild(style);

    // 2. CREATE THE UI ELEMENTS
    const btn = document.createElement('button');
    btn.id = 'es-widget-btn';
    btn.innerText = '💬';
    document.body.appendChild(btn);

    const chatWindow = document.createElement('div');
    chatWindow.id = 'es-chat-window';
    chatWindow.innerHTML = `
        <div id="es-chat-header">
            <span>${shopName}</span>
            <button id="es-close-btn">✖</button>
        </div>
        <div id="es-chat-messages">
            <div class="es-msg-ai">Welcome to ${shopName}. How can I help you today?</div>
        </div>
        <div id="es-chat-input-container">
            <input type="text" id="es-chat-input" placeholder="Type here..." />
            <button id="es-chat-send">Send</button>
        </div>
    `;
    document.body.appendChild(chatWindow);

    // 3. TOGGLE LOGIC
    let isOpen = false;
    function toggleChat() {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        if (window.innerWidth <= 600) {
            btn.style.display = isOpen ? 'none' : 'block';
        }
    }
    
    btn.addEventListener('click', toggleChat);
    document.getElementById('es-close-btn').addEventListener('click', toggleChat);

    // 4. MARKDOWN PARSER (Fixes the asterisks)
    function formatText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')             // Italic text
            .replace(/\n/g, '<br>');                          // Line breaks
    }

    // 5. SEND MESSAGE LOGIC
    const sendBtn = document.getElementById('es-chat-send');
    const inputField = document.getElementById('es-chat-input');
    const messagesDiv = document.getElementById('es-chat-messages');

    const API_URL = 'https://esgaming-engine.onrender.com/api/chat';

    async function sendMessage() {
        const text = inputField.value.trim();
        if (!text) return;

        messagesDiv.innerHTML += `<div class="es-msg-user">${text}</div>`;
        inputField.value = '';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Add a temporary loading indicator
        const loadingId = 'loading-' + Date.now();
        messagesDiv.innerHTML += `<div id="${loadingId}" class="es-msg-ai"><em>Connecting to server... (may take 30s to wake up)</em></div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text, shopId: shopId }) 
            });
            
            const data = await response.json();
            document.getElementById(loadingId).remove(); // Remove loading text
            
            // Apply the Markdown formatter before injecting
            const formattedResponse = formatText(data.response || "Connection error.");
            messagesDiv.innerHTML += `<div class="es-msg-ai">${formattedResponse}</div>`;
            
        } catch (err) {
            document.getElementById(loadingId).remove();
            messagesDiv.innerHTML += `<div class="es-msg-ai">System offline or waking up. Please try again in 30 seconds.</div>`;
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
})();
