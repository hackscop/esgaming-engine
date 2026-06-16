(function() {
    const scriptTag = document.getElementById('es-ai-widget');
    const shopId = scriptTag ? scriptTag.getAttribute('data-shop-id') : 'default';
    const shopName = scriptTag ? scriptTag.getAttribute('data-shop-name') : 'AI Assistant';
    const primaryColor = scriptTag ? scriptTag.getAttribute('data-primary-color') : '#24b33b';

    // 1. EXACT PIXEL REPLICA STYLING FROM 1000063363.jpg
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #es-chat-window {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 380px;
            height: 620px;
            background: #ffffff;
            border: 1px solid #f0f0f0;
            border-radius: 24px;
            box-shadow: 0px 12px 30px rgba(0,0,0,0.1);
            display: none;
            flex-direction: column;
            z-index: 999999;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        @media (max-width: 600px) {
            #es-chat-window {
                width: 100vw;
                height: 100vh;
                bottom: 0;
                right: 0;
                border-radius: 0;
            }
        }

        /* The authentic curved header from the screenshot */
        #es-chat-header {
            background: ${primaryColor};
            color: white;
            padding: 24px 20px 35px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            position: relative;
            border-bottom-left-radius: 50% 20px;
            border-bottom-right-radius: 50% 20px;
        }

        .header-back-arrow {
            cursor: pointer;
            font-size: 22px;
            color: white;
            font-weight: 300;
        }

        .header-avatar {
            width: 44px;
            height: 44px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
        }

        #es-chat-messages {
            flex: 1;
            padding: 20px 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #ffffff;
        }

        /* User Message Bubble matching 1000063363.jpg */
        .es-msg-user {
            align-self: flex-end;
            background: ${primaryColor};
            color: white;
            padding: 12px 16px;
            border-radius: 18px 18px 4px 18px;
            font-size: 15px;
            max-width: 80%;
            word-wrap: break-word;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        /* AI Message Bubble matching 1000063363.jpg */
        .es-msg-ai {
            align-self: flex-start;
            background: #f4f6f8;
            color: #222222;
            padding: 12px 16px;
            border-radius: 18px 18px 18px 4px;
            font-size: 15px;
            max-width: 85%;
            line-height: 1.45;
        }

        .es-chat-meta-label {
            font-size: 11px;
            color: #888888;
            margin-bottom: 2px;
            margin-left: 4px;
        }

        /* Rebuilt seamless footer layout */
        #es-chat-input-container {
            background: #ffffff;
            border-top: 1px solid #eeeeee;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        #es-chat-input {
            flex: 1;
            border: none;
            outline: none;
            padding: 8px 0;
            font-size: 15px;
            background: transparent;
            color: #333333;
        }
        
        #es-chat-input::placeholder {
            color: #b0b0b0;
        }

        .input-utilities-group {
            display: flex;
            align-items: center;
            gap: 16px;
            color: #999999;
            padding-left: 8px;
        }

        .input-utility-icon {
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
        }
        .input-utility-icon:hover { color: #444444; }

        .uploaded-preview-img {
            max-width: 150px;
            border-radius: 12px;
            margin-top: 5px;
            display: block;
        }
    `;
    document.head.appendChild(style);

    // 2. DOM STRUCTURE INITIALIZATION
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
            <div style="font-weight: 600; font-size: 20px; letter-spacing: -0.3px;">${shopName}</div>
        </div>
        
        <div id="es-chat-messages">
            <div class="es-chat-meta-label">${shopName}</div>
            <div class="es-msg-ai">Welcome to ${shopName}! We are happy to help you.</div>
        </div>
        
        <div id="es-chat-input-container">
            <input type="text" id="es-chat-input" placeholder="Type your message and hit 'Enter'">
            
            <div class="input-utilities-group">
                <!-- SVG Icons precisely mapping the utility bar -->
                <span class="input-utility-icon" id="es-util-smiley" title="Emoji">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                </span>
                <span class="input-utility-icon" id="es-util-mic" title="Voice Note">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </span>
                <span class="input-utility-icon" id="es-util-clip" title="Attach Photo">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                </span>
            </div>
        </div>
        <!-- Hidden input for file selection -->
        <input type="file" id="es-hidden-file-input" accept="image/*" style="display: none;">
    `;
    document.body.appendChild(chatWindow);

    // 3. WIDGET TOGGLE INTERACTION
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

    // 4. CORE CHAT ENGINE & RUNTIME
    const inputField = document.getElementById('es-chat-input');
    const messagesDiv = document.getElementById('es-chat-messages');
    const clipIcon = document.getElementById('es-util-clip');
    const fileInput = document.getElementById('es-hidden-file-input');

    const API_URL = "https://esgaming-engine.onrender.com/api/chat";

    function formatText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    async function handleIncomingMessage(textPayload) {
        // Loading indicator element matching style
        const loadingId = "loading-" + Date.now();
        messagesDiv.innerHTML += `
            <div class="es-chat-meta-label" id="lbl-${loadingId}">${shopName}</div>
            <div class="es-msg-ai" id="${loadingId}">...</div>
        `;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: textPayload, shopId: shopId })
            });

            const data = await response.json();
            document.getElementById(`lbl-${loadingId}`).remove();
            document.getElementById(loadingId).remove();

            const formattedResponse = formatText(data.response || "Connection error.");
            
            messagesDiv.innerHTML += `<div class="es-chat-meta-label">${shopName}</div>`;
            const aiBubble = document.createElement('div');
            aiBubble.className = 'es-msg-ai';
            messagesDiv.appendChild(aiBubble);

            typeWriter(aiBubble, formattedResponse);

        } catch (err) {
            document.getElementById(`lbl-${loadingId}`).remove();
            document.getElementById(loadingId).remove();
            messagesDiv.innerHTML += `
                <div class="es-chat-meta-label">System</div>
                <div class="es-msg-ai">Connecting to live agent option... Please try again.</div>
            `;
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }

    function sendTextMessage() {
        const text = inputField.value.trim();
        if (!text) return;

        messagesDiv.innerHTML += `
            <div class="es-chat-meta-label" style="text-align: right; margin-right: 4px;">Onyango</div>
            <div class="es-msg-user">${text}</div>
        `;
        inputField.value = '';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        handleIncomingMessage(text);
    }

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendTextMessage();
    });

    // 5. INTERACTIVE PAPERCLIP PHOTO UPLOADER
    clipIcon.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            const fileName = this.files[0].name;

            reader.onload = function(e) {
                // Render image thumbnail layout right into the conversation flow
                messagesDiv.innerHTML += `
                    <div class="es-chat-meta-label" style="text-align: right; margin-right: 4px;">Onyango</div>
                    <div class="es-msg-user">
                        <div>Sent an attachment: <strong>${fileName}</strong></div>
                        <img src="${e.target.result}" class="uploaded-preview-img" alt="Upload preview">
                    </div>
                `;
                messagesDiv.scrollTop = messagesDiv.scrollHeight;

                // Fire payload to AI engine contextually processing the image tag
                handleIncomingMessage(`[User uploaded a photo attachment named ${fileName} representing their hardware or issue. Please acknowledge the image receipt intelligently.]`);
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // 6. TYPEWRITER RENDERING EFFECT
    function typeWriter(element, htmlContent, speed = 12) {
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
