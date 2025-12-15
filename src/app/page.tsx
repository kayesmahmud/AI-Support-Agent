'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function TestPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.error || 'Error occurred' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error. Please try again.' },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>AI Support Agent</h1>
      <p style={subtitleStyle}>
        Test your support agent here before embedding on your website.
      </p>

      <div style={chatContainerStyle}>
        <div style={messagesStyle}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...messageStyle,
                ...(msg.role === 'user' ? userMessageStyle : botMessageStyle),
              }}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div style={{ ...messageStyle, ...botMessageStyle }}>
              Typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={inputAreaStyle}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            style={inputStyle}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={buttonStyle}
          >
            Send
          </button>
        </div>
      </div>

      <div style={infoBoxStyle}>
        <h3>Embed Code for Your Website</h3>
        <p>Add this snippet to your website (replace YOUR_VERCEL_URL after deployment):</p>
        <pre style={codeStyle}>
{`<script>
  window.AI_SUPPORT_API_URL = 'https://YOUR_VERCEL_URL';
  window.AI_SUPPORT_TITLE = 'Support';
  window.AI_SUPPORT_COLOR = '#007bff';
</script>
<script src="https://YOUR_VERCEL_URL/widget.js"></script>`}
        </pre>
      </div>
    </div>
  );
}

// Inline styles
const containerStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '40px 20px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const titleStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '8px',
};

const subtitleStyle: React.CSSProperties = {
  color: '#666',
  marginBottom: '30px',
};

const chatContainerStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  overflow: 'hidden',
  marginBottom: '30px',
};

const messagesStyle: React.CSSProperties = {
  height: '400px',
  overflowY: 'auto',
  padding: '20px',
  background: '#fafafa',
};

const messageStyle: React.CSSProperties = {
  maxWidth: '70%',
  padding: '10px 14px',
  borderRadius: '16px',
  marginBottom: '10px',
  fontSize: '14px',
  lineHeight: '1.4',
};

const userMessageStyle: React.CSSProperties = {
  background: '#007bff',
  color: 'white',
  marginLeft: 'auto',
  borderBottomRightRadius: '4px',
};

const botMessageStyle: React.CSSProperties = {
  background: '#e9ecef',
  color: '#333',
  marginRight: 'auto',
  borderBottomLeftRadius: '4px',
};

const inputAreaStyle: React.CSSProperties = {
  display: 'flex',
  padding: '15px',
  gap: '10px',
  borderTop: '1px solid #e0e0e0',
  background: 'white',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 15px',
  border: '1px solid #e0e0e0',
  borderRadius: '20px',
  fontSize: '14px',
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '14px',
};

const infoBoxStyle: React.CSSProperties = {
  background: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
};

const codeStyle: React.CSSProperties = {
  background: '#2d2d2d',
  color: '#f8f8f2',
  padding: '15px',
  borderRadius: '6px',
  overflow: 'auto',
  fontSize: '13px',
};
