(function() {
  'use strict';

  // Configuration - will be set by the embed script
  const CONFIG = {
    apiUrl: window.AI_SUPPORT_API_URL || '',
    primaryColor: window.AI_SUPPORT_COLOR || '#007bff',
    title: window.AI_SUPPORT_TITLE || 'Support',
    greeting: window.AI_SUPPORT_GREETING || 'Hi! How can I help you today?',
    placeholder: window.AI_SUPPORT_PLACEHOLDER || 'Type your message...',
    position: window.AI_SUPPORT_POSITION || 'right', // 'left' or 'right'
  };

  // Styles
  const styles = `
    #ai-support-widget {
      position: fixed;
      bottom: 20px;
      ${CONFIG.position}: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    #ai-support-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${CONFIG.primaryColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    #ai-support-toggle:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }

    #ai-support-toggle svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    #ai-support-chat {
      display: none;
      position: absolute;
      bottom: 70px;
      ${CONFIG.position}: 0;
      width: 380px;
      height: 520px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      flex-direction: column;
      overflow: hidden;
    }

    #ai-support-chat.open {
      display: flex;
    }

    #ai-support-header {
      background: ${CONFIG.primaryColor};
      color: white;
      padding: 16px 20px;
      font-weight: 600;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #ai-support-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 24px;
      line-height: 1;
      opacity: 0.8;
    }

    #ai-support-close:hover {
      opacity: 1;
    }

    #ai-support-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ai-support-message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .ai-support-message.user {
      background: ${CONFIG.primaryColor};
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .ai-support-message.assistant {
      background: #f1f3f4;
      color: #333;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      position: relative;
      padding-right: 40px;
    }

    .ai-support-speak-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      opacity: 0.6;
      transition: opacity 0.2s, background 0.2s;
    }

    .ai-support-speak-btn:hover {
      opacity: 1;
      background: rgba(0,0,0,0.05);
    }

    .ai-support-speak-btn.speaking {
      opacity: 1;
      animation: pulse 1s infinite;
    }

    .ai-support-speak-btn svg {
      width: 16px;
      height: 16px;
      fill: #666;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .ai-support-message.typing {
      background: #f1f3f4;
      color: #666;
      align-self: flex-start;
    }

    .typing-dots {
      display: flex;
      gap: 4px;
    }

    .typing-dots span {
      width: 8px;
      height: 8px;
      background: #666;
      border-radius: 50%;
      animation: typing-bounce 1.4s infinite ease-in-out both;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
    .typing-dots span:nth-child(3) { animation-delay: 0s; }

    @keyframes typing-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    #ai-support-input-area {
      padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 10px;
    }

    #ai-support-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    #ai-support-input:focus {
      border-color: ${CONFIG.primaryColor};
    }

    #ai-support-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${CONFIG.primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }

    #ai-support-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    #ai-support-send svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    @media (max-width: 480px) {
      #ai-support-chat {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        bottom: 70px;
        ${CONFIG.position}: 0;
      }
    }
  `;

  // Create widget HTML
  function createWidget() {
    // Add styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create widget container
    const widget = document.createElement('div');
    widget.id = 'ai-support-widget';
    widget.innerHTML = `
      <div id="ai-support-chat">
        <div id="ai-support-header">
          <span>${CONFIG.title}</span>
          <button id="ai-support-close">&times;</button>
        </div>
        <div id="ai-support-messages">
          <div class="ai-support-message assistant">${CONFIG.greeting}</div>
        </div>
        <div id="ai-support-input-area">
          <input type="text" id="ai-support-input" placeholder="${CONFIG.placeholder}">
          <button id="ai-support-send">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
      <button id="ai-support-toggle">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
      </button>
    `;
    document.body.appendChild(widget);

    // Initialize
    initWidget();
  }

  // Widget state
  let conversationHistory = [];
  let isLoading = false;
  let currentSpeech = null;

  // Text-to-Speech setup
  const speechSynthesis = window.speechSynthesis;

  function detectLanguage(text) {
    // Simple detection: if text contains Cyrillic characters, it's likely Bulgarian
    const cyrillicPattern = /[\u0400-\u04FF]/;
    return cyrillicPattern.test(text) ? 'bg-BG' : 'en-US';
  }

  function speak(text, button) {
    // Stop any ongoing speech
    if (currentSpeech) {
      speechSynthesis.cancel();
      document.querySelectorAll('.ai-support-speak-btn').forEach(btn => {
        btn.classList.remove('speaking');
      });
    }

    // If clicking the same button while speaking, just stop
    if (button.classList.contains('speaking')) {
      button.classList.remove('speaking');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = detectLanguage(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Get appropriate voice
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0])) || voices[0];
    if (voice) utterance.voice = voice;

    button.classList.add('speaking');
    currentSpeech = utterance;

    utterance.onend = () => {
      button.classList.remove('speaking');
      currentSpeech = null;
    };

    utterance.onerror = () => {
      button.classList.remove('speaking');
      currentSpeech = null;
    };

    speechSynthesis.speak(utterance);
  }

  // Initialize widget functionality
  function initWidget() {
    const toggle = document.getElementById('ai-support-toggle');
    const chat = document.getElementById('ai-support-chat');
    const close = document.getElementById('ai-support-close');
    const input = document.getElementById('ai-support-input');
    const send = document.getElementById('ai-support-send');
    const messages = document.getElementById('ai-support-messages');

    // Toggle chat
    toggle.addEventListener('click', () => {
      chat.classList.toggle('open');
      if (chat.classList.contains('open')) {
        input.focus();
      }
    });

    close.addEventListener('click', () => {
      chat.classList.remove('open');
    });

    // Send message
    async function sendMessage() {
      const text = input.value.trim();
      if (!text || isLoading) return;

      // Add user message
      addMessage(text, 'user');
      input.value = '';
      conversationHistory.push({ role: 'user', content: text });

      // Show typing indicator
      isLoading = true;
      send.disabled = true;
      const typingId = showTyping();

      try {
        const response = await fetch(CONFIG.apiUrl + '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: conversationHistory.slice(-10),
          }),
        });

        const data = await response.json();
        removeTyping(typingId);

        if (data.success && data.message) {
          addMessage(data.message, 'assistant');
          conversationHistory.push({ role: 'assistant', content: data.message });
        } else {
          addMessage(data.error || 'Sorry, I encountered an error. Please try again.', 'assistant');
        }
      } catch (error) {
        console.error('Chat error:', error);
        removeTyping(typingId);
        addMessage('Unable to connect. Please check your internet connection.', 'assistant');
      }

      isLoading = false;
      send.disabled = false;
    }

    send.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    function addMessage(text, sender) {
      const msg = document.createElement('div');
      msg.className = `ai-support-message ${sender}`;

      // Add text content
      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      msg.appendChild(textSpan);

      // Add speaker button for assistant messages
      if (sender === 'assistant') {
        const speakBtn = document.createElement('button');
        speakBtn.className = 'ai-support-speak-btn';
        speakBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
        speakBtn.title = 'Read aloud';
        speakBtn.addEventListener('click', () => speak(text, speakBtn));
        msg.appendChild(speakBtn);
      }

      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
      const id = 'typing-' + Date.now();
      const msg = document.createElement('div');
      msg.id = id;
      msg.className = 'ai-support-message typing';
      msg.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
      return id;
    }

    function removeTyping(id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
