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
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Text-to-Speech functions
  const detectLanguage = (text: string): string => {
    const cyrillicPattern = /[\u0400-\u04FF]/;
    return cyrillicPattern.test(text) ? 'bg-BG' : 'en-US';
  };

  const speak = (text: string, index: number) => {
    const synth = window.speechSynthesis;

    // Stop if already speaking this message
    if (speakingIndex === index) {
      synth.cancel();
      setSpeakingIndex(null);
      return;
    }

    // Stop any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = detectLanguage(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Get appropriate voice
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0])) || voices[0];
    if (voice) utterance.voice = voice;

    setSpeakingIndex(index);

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    synth.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speech-to-Text (Voice Input)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        // Support both Bulgarian and English
        recognition.lang = 'bg-BG'; // Default to Bulgarian, will auto-detect

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

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
                position: 'relative',
                paddingRight: msg.role === 'assistant' ? '45px' : '14px',
              }}
            >
              <span>{msg.content}</span>
              {msg.role === 'assistant' && (
                <button
                  onClick={() => speak(msg.content, i)}
                  style={{
                    ...speakerButtonStyle,
                    opacity: speakingIndex === i ? 1 : 0.6,
                    animation: speakingIndex === i ? 'pulse 1s infinite' : 'none',
                  }}
                  title="Read aloud"
                >
                  🔊
                </button>
              )}
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
            placeholder={isListening ? 'Listening...' : 'Type or speak your message...'}
            style={inputStyle}
            disabled={isLoading}
          />
          <button
            onClick={toggleVoiceInput}
            style={{
              ...micButtonStyle,
              background: isListening ? '#dc3545' : '#6c757d',
            }}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? '⏹' : '🎤'}
          </button>
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

const speakerButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  padding: '4px',
  borderRadius: '4px',
  transition: 'opacity 0.2s, background 0.2s',
};

const micButtonStyle: React.CSSProperties = {
  padding: '10px 15px',
  color: 'white',
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'background 0.2s',
};
