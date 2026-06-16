(function() {
    const scriptTag = document.getElementById('es-ai-widget');
    const shopId = scriptTag ? scriptTag.getAttribute('data-shop-id') : 'default';
    const shopName = scriptTag ? scriptTag.getAttribute('data-shop-name') : 'AI Assistant';
    const primaryColor = scriptTag ? scriptTag.getAttribute('data-primary-color') : '#24b33b';

    // 1. ADVANCED RESPONSIVE CSS & FULL-SCALED WIDGET
    const style = document.createElement('style');
    style.innerHTML = `
        #es-widget-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${primaryColor};
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            cursor: pointer;
            z-index: 999139;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #es-widget-btn:hover { transform: scale(1.1); }

        #es-chat-window {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 380px;
            height: 600px;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 16px;
            box-shadow: 0px 10px 25px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            z-index: 999999;
            overflow: hidden;
            transition: all 0.3s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        @media (max-width: 600px) {
            #es-chat-window {
                width: 92vw;
                height: 85vh;
                bottom: 20px;
                right: 4vw;
                border-radius: 20px;
            }
        }

        #es-chat-header {
            background: ${primaryColor};
            color: white;
            padding: 18px 15px;
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
        }

        .header-back-arrow {
            cursor: pointer;
            font-size: 24px;
            font-weight: bold;
            line-height: 1;
        }

        .header-avatar {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
        }

        #es-chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            color: #333333;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #f9f9f9;
        }

        .es-msg-user {
            align-self: flex-end;
            background: ${primaryColor};
            color: white;
            padding: 10px 14px;
            border-radius: 15px 15px 0 15px;
            font-size: 14px;
            max-width: 80%;
        }

        .es-msg-ai {
            align-self: flex-start;
            background: #ffffff;
            color: #333333;
            padding: 10px 14px;
            border-radius: 15px 15px 15px 0;
            font-size: 14px;
            max-width: 85%;
            line-height: 1.5;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .es-msg-ai strong { color: ${primaryColor}; }

        .input-utilities {
            display: flex;
            align-items: center;
            gap: 12px;
            padding-right: 10px;
            color: #888888;
        }

        .input-utility-icon {
            cursor: pointer;
            font-size: 18px;
            transition: color 0.2s;
        }

        .input-utility-icon:hover { color: #333333; }
    `;
    document.head.appendChild(style);

    // 2. CREATE THE UI ELEMENTS
    const btn = document.createElement('button');
    btn.id = 'es-widget-btn';
    btn.innerHTML = '💬';
    document.body.appendChild(btn);

    const chatWindow = document.createElement('div');
    chatWindow.id = 'es-chat-window';
    chatWindow.innerHTML = `
        <div id="es-chat-header">
            <span class="header-back-arrow" id="es-close-btn">‹</span>
            <div class="header-avatar">👤</div>
            <div style="font-weight: bold; font-size: 18px;">${shopName}</div>
        </div>
        
        <div id="es-chat-messages">
            <div class="es-msg-ai">Welcome to ${shopName}! We are happy to help you.</div>
        </div>
        
        <div id="es-chat-input-container" style="background: #ffffff; border-top: 1px solid #eee; padding: 10px; display: flex; align-items: center;">
            <input type="text" id="es-chat-input" placeholder="Type your message and hit 'Enter'..." style="flex: 1; border: none; outline: none; padding: 10px; font-size: 14px; background: #ffffff; color: #333333;">
            
            <div class="input-utilities">
                <span class="input-utility-icon">😊</span>
                <span class="input-utility-icon">🎙️</span>
                <span class="input-utility-icon">📎</span>
            </div>
            <button id="es-chat-send" style="background: ${primaryColor}; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: bold;">Send</button>
        </div>
    `;
    document.body.appendChild(chatWindow);

    // 3. TOGGLE LOGIC
    let isOpen = false;
    function toggleChat() {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        if (window.innerWidth <= 600) {
            btn.style.display = isOpen ? 'none' : 'flex';
        }
    }

    btn.addEventListener('click', toggleChat);
    document.getElementById('es-close-btn').addEventListener('click', toggleChat);

    // 4. TEXT FORMATTING FUNCTION
    function formatText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // 5. SEND MESSAGE LOGIC
    const sendBtn = document.getElementById('es-chat-send');
    const inputField = document.getElementById('es-chat-input');
    const messagesDiv = document.getElementById('es-chat-messages');

    const API_URL = "https://esgaming-engine.onrender.com/api/chat";

    async function sendMessage() {
        const text = inputField.value.trim();
        if (!text) return;

        // User bubble
        messagesDiv.innerHTML += `<div class="es-msg-user">${text}</div>`;
        inputField.value = '';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Loading indicator
        const loadingId = "loading-" + Date.now();
        messagesDiv.innerHTML += `<div class="es-msg-ai" id="${loadingId}">Connecting to server... (may take 30s to wake up)</div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: text, shopId: shopId })
            });

            const data = await response.json();
            document.getElementById(loadingId).remove();

            const formattedResponse = formatText(data.response || "Connection error.");
            
            const aiBubble = document.createElement('div');
            aiBubble.className = 'es-msg-ai';
            messagesDiv.appendChild(aiBubble);

            typeWriter(aiBubble, formattedResponse);

        } catch (err) {
            document.getElementById(loadingId).remove();
            messagesDiv.innerHTML += `<div class="es-msg-ai">System offline or waking up. Please try again in 30 seconds.</div>`;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // TYPEWRITER HELPER
    function typeWriter(element, htmlContent, speed = 15) {
        let i = 0;
        let currentText = "";
        let isTag = false;
        let chatBox = element.parentElement;

        function type() {
            if (i < htmlContent.length) {
                let char = htmlContent.charAt(i);
                currentText += char;
                i++;

                if (char === '<') isTag = true;
                if (char === '>') isTag = false;

                if (isTag) {
                    type();
                    return;
                }

                element.innerHTML = currentText;
                if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

                setTimeout(type, speed);
            }
        }
        type();
    }
})();
