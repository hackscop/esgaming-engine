(function() {
    // 1. INJECT THE STYLES
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
            width: 350px; height: 450px; background: #1a1a2e;
            border: 1px solid #8A2BE2; border-radius: 10px;
            display: none; flex-direction: column; z-index: 999999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
        }
        #es-chat-header {
            background: #8A2BE2; color: white; padding: 15px;
            font-weight: bold; text-align: center; letter-spacing: 1px;
        }
        #es-chat-messages {
            flex: 1; padding: 15px; overflow-y: auto; color: white;
            display: flex; flex-direction: column; gap: 10px;
        }
        #es-chat-input-container {
            display: flex; padding: 10px; background: #0f0f1a;
            border-top: 1px solid #333;
        }
        #es-chat-input {
            flex: 1; padding: 10px; border-radius: 5px; border: 1px solid #333;
            background: #1a1a2e; color: white; outline: none;
        }
        #es-chat-send {
            background: #8A2BE2; color: white; border: none; font-weight: bold;
            padding: 0 15px; margin-left: 10px; border-radius: 5px; cursor: pointer;
        }
        .es-msg-user { align-self: flex-end; background: #333; padding: 10px 14px; border-radius: 15px 15px 0 15px; font-size: 14px; max-width: 80%; }
        .es-msg-ai { align-self: flex-start; background: #8A2BE2; padding: 10px 14px; border-radius: 15px 15px 15px 0; font-size: 14px; max-width: 80%; line-height: 1.4; }
    `;
    document.head.appendChild(style);

    // 2. CREATE THE WIDGET ELEMENTS
    const btn = document.createElement('button');
    btn.id = 'es-widget-btn';
    btn.innerText = '💬';
    document.body.appendChild(btn);

    const chatWindow = document.createElement('div');
    chatWindow.id = 'es-chat-window';
    chatWindow.innerHTML = `
        <div id="es-chat-header">ESGaming Architect</div>
        <div id="es-chat-messages">
            <div class="es-msg-ai">Welcome to the store. What kind of hardware are you looking for today?</div>
        </div>
        <div id="es-chat-input-container">
            <input type="text" id="es-chat-input" placeholder="Type here..." />
            <button id="es-chat-send">Send</button>
        </div>
    `;
    document.body.appendChild(chatWindow);

    // 3. WIDGET LOGIC & API CONNECTION
    let isOpen = false;
    btn.addEventListener('click', () => {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
    });

    const sendBtn = document.getElementById('es-chat-send');
    const inputField = document.getElementById('es-chat-input');
    const messagesDiv = document.getElementById('es-chat-messages');

    // This points directly to your Render server
    const API_URL = 'https://esgaming-engine.onrender.com/api/chat';

    async function sendMessage() {
        const text = inputField.value.trim();
        if (!text) return;

        // Print User Message
        messagesDiv.innerHTML += `<div class="es-msg-user">${text}</div>`;
        inputField.value = '';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text })
            });
            const data = await response.json();
            
            // Print AI Message
            messagesDiv.innerHTML += `<div class="es-msg-ai">${data.response || "Connection error."}</div>`;
        } catch (err) {
            messagesDiv.innerHTML += `<div class="es-msg-ai">System offline. Please try again later.</div>`;
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
})();
