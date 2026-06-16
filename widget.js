(function() {
    const scriptTag = document.getElementById('es-ai-widget');
    const shopId = scriptTag ? scriptTag.getAttribute('data-shop-id') : 'default';
    const shopName = scriptTag ? scriptTag.getAttribute('data-shop-name') : 'AI Assistant';
    const primaryColor = scriptTag ? scriptTag.getAttribute('data-primary-color') : '#24b33b';

    const style = document.createElement('style');
    style.innerHTML = `
        #es-widget-btn { position: fixed; bottom: 20px; right: 20px; background: ${primaryColor}; color: white; border: none; border-radius: 50%; width: 60px; height: 60px; font-size: 24px; cursor: pointer; z-index: 999139; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; }
        #es-chat-window { position: fixed; bottom: 90px; right: 20px; width: 380px; height: 620px; background: #ffffff; border: 1px solid #f0f0f0; border-radius: 24px; box-shadow: 0px 12px 30px rgba(0,0,0,0.1); display: none; flex-direction: column; z-index: 999999; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        
        @media (max-width: 600px) { 
            #es-chat-window { 
                width: 100vw; 
                height: 100dvh;
                top: 0; 
                left: 0; 
                bottom: auto;
                right: auto;
                border-radius: 0; 
            } 
        }
        
        #es-chat-header { background: ${primaryColor}; color: white; padding: 24px 20px 35px 20px; display: flex; align-items: center; gap: 15px; position: relative; border-bottom-left-radius: 50% 20px; border-bottom-right-radius: 50% 20px; transition: background 0.3s ease; flex-shrink: 0; }
        .header-back-arrow { cursor: pointer; font-size: 22px; color: white; font-weight: 300; }
        .header-avatar { width: 44px; height: 44px; background: rgba(255, 255, 255, 0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; }
        #es-chat-messages { flex: 1; padding: 20px 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #ffffff; }
        .es-msg-user { align-self: flex-end; background: ${primaryColor}; color: white; padding: 12px 16px; border-radius: 18px 18px 4px 18px; font-size: 15px; max-width: 80%; word-wrap: break-word; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .es-msg-ai { align-self: flex-start; background: #f4f6f8; color: #222222; padding: 12px 16px; border-radius: 18px 18px 18px 4px; font-size: 15px; max-width: 85%; line-height: 1.45; }
        .es-chat-meta-label { font-size: 11px; color: #888888; margin-bottom: 2px; margin-left: 4px; }
        #es-chat-input-container { background: #ffffff; border-top: 1px solid #eeeeee; padding: 12px 16px; display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        #es-chat-input { flex: 1; border: none; outline: none; padding: 8px 0; font-size: 15px; background: transparent; color: #333333; }
        #es-chat-input::placeholder { color: #b0b0b0; }
        .input-utilities-group { display: flex; align-items: center; gap: 16px; color: #999999; padding-left: 8px; }
        .input-utility-icon { cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
        .input-utility-icon:hover { color: #444444; }
        .uploaded-preview-img { max-width: 150px; border-radius: 12px; margin-top: 5px; display: block; }
        .wa-handoff-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: #25D366; color: white; text-decoration: none; padding: 12px; border-radius: 10px; font-weight: bold; margin-top: 10px; font-size: 15px; }
    `;
    document.head.appendChild(style);

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
            <div id="es-header-title" style="font-weight: 600; font-size: 20px; letter-spacing: -0.3px;">${shopName}</div>
        </div>
        <div id="es-chat-messages">
            <div class="es-chat-meta-label">${shopName}</div>
            <div class="es-msg-ai">Welcome to ${shopName}! We are happy to help you.</div>
        </div>
        <div id="es-chat-input-container">
            <input type="text" id="es-chat-input" placeholder="Type your message and hit 'Enter'">
            <div class="input-utilities-group">
                <span class="input-utility-icon" id="es-util-smiley"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg></span>
                <span class="input-utility-icon" id="es-util-mic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg></span>
                <span class="input-utility-icon" id="es-util-clip"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg></span>
            </div>
        </div>
        <input type="file" id="es-hidden-file-input" accept="image/*" style="display: none;">
    `;
    document.body.appendChild(chatWindow);

    const inputField = document.getElementById('es-chat-input');
    const messagesDiv = document.getElementById('es-chat-messages');
    const clipIcon = document.getElementById('es-util-clip');
    const fileInput = document.getElementById('es-hidden-file-input');
    const inputContainer = document.getElementById('es-chat-input-container');
    const headerTitle = document.getElementById('es-header-title');
    const headerArea = document.getElementById('es-chat-header');

    let isOpen = false;
    function toggleChat() {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        if (window.innerWidth <= 600) { 
            btn.style.display = isOpen ? 'none' : 'flex'; 
            if (isOpen) {
                adjustForVisualViewport();
            } else {
                chatWindow.style.height = '';
                chatWindow.style.top = '';
            }
        }
    }
    btn.addEventListener('click', toggleChat);
    document.getElementById('es-close-btn').addEventListener('click', toggleChat);

    // VISUAL VIEWPORT MOBILE KEYBOARD ENGINE
    function adjustForVisualViewport() {
        if (window.innerWidth <= 600 && window.visualViewport) {
            chatWindow.style.height = `${window.visualViewport.height}px`;
            chatWindow.style.top = `${window.visualViewport.offsetTop}px`;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', adjustForVisualViewport);
        window.visualViewport.addEventListener('scroll', adjustForVisualViewport);
    }

    // Force automatic scroll down whenever input is clicked
    inputField.addEventListener('focus', () => {
        setTimeout(() => {
            adjustForVisualViewport();
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, 80);
    });

    const API_URL = "https://esgaming-engine.onrender.com/api/chat";

    function formatText(text) {
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
    }

    async function handleIncomingMessage(textPayload, imagePayload = null) {
        const loadingId = "loading-" + Date.now();
        messagesDiv.innerHTML += `<div class="es-chat-meta-label" id="lbl-${loadingId}">${shopName}</div><div class="es-msg-ai" id="${loadingId}">...</div>`;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            const requestBody = { prompt: textPayload, shopId: shopId };
            if (imagePayload) { requestBody.image = imagePayload; }

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error("API Error");

            const data = await response.json();
            document.getElementById(`lbl-${loadingId}`).remove();
            document.getElementById(loadingId).remove();

            if (data.response && data.response.includes("[TRIGGER_HUMAN_HANDOFF]")) {
                const waNumber = data.whatsapp || "254700000000";
                headerTitle.innerHTML = "Live Agent Transfer";
                headerArea.style.background = "#222222"; 
                inputContainer.style.opacity = "0.5";
                inputContainer.style.pointerEvents = "none";
                inputField.placeholder = "Chat moved to WhatsApp...";

                messagesDiv.innerHTML += `
                    <div class="es-chat-meta-label">System</div>
                    <div class="es-msg-ai" style="background: #eef2f5;">
                        I am transferring you to an available human agent to assist you further. 
                        <a href="https://wa.me/${waNumber}?text=Hello,%20I%20need%20human%20assistance%20from%20the%20website." target="_blank" class="wa-handoff-btn">
                            Connect on WhatsApp
                        </a>
                    </div>
                `;
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
                return; 
            }

            const formattedResponse = formatText(data.response || "Connection error.");
            messagesDiv.innerHTML += `<div class="es-chat-meta-label">${shopName}</div>`;
            const aiBubble = document.createElement('div');
            aiBubble.className = 'es-msg-ai';
            messagesDiv.appendChild(aiBubble);
            typeWriter(aiBubble, formattedResponse);

        } catch (err) {
            document.getElementById(`lbl-${loadingId}`).remove();
            document.getElementById(loadingId).remove();
            messagesDiv.innerHTML += `<div class="es-chat-meta-label">System</div><div class="es-msg-ai">Connection error.</div>`;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }

    function sendTextMessage() {
        const text = inputField.value.trim();
        if (!text) return;
        messagesDiv.innerHTML += `<div class="es-chat-meta-label" style="text-align: right; margin-right: 4px;">Customer</div><div class="es-msg-user">${text}</div>`;
        inputField.value = '';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        handleIncomingMessage(text);
    }

    inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendTextMessage(); });
    clipIcon.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Data = e.target.result.split(',')[1]; 
                const mimeType = file.type;

                messagesDiv.innerHTML += `
                    <div class="es-chat-meta-label" style="text-align: right; margin-right: 4px;">Customer</div>
                    <div class="es-msg-user">
                        <img src="${e.target.result}" class="uploaded-preview-img" alt="Upload preview">
                    </div>
                `;
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
                handleIncomingMessage(
                    "Please analyze this uploaded image. Identify the product, check our inventory file, and tell me if we have it or a direct alternative in stock.",
                    { base64: base64Data, mimeType: mimeType }
                );
            };
            reader.readAsDataURL(file);
        }
    });

    function typeWriter(element, htmlContent, speed = 12) {
        let i = 0; let currentText = ""; let isTag = false; let chatBox = element.parentElement;
        function type() {
            if (i < htmlContent.length) {
                let char = htmlContent.charAt(i);
                currentText += char; i++;
                if (char === '<') isTag = true;
                if (char === '>') isTag = false;
                if (isTag) { type(); return; }
                element.innerHTML = currentText;
                if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
                setTimeout(type, speed);
            }
        }
        type();
    }
})();
