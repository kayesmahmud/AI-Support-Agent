'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const promptSuggestions = [
  'What does your refund policy look like?',
  'How do I embed this widget on my site?',
  'Can you summarize onboarding steps?',
];

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

  const detectLanguage = (text: string): string => {
    const cyrillicPattern = /[\u0400-\u04FF]/;
    return cyrillicPattern.test(text) ? 'bg-BG' : 'en-US';
  };

  const speak = (text: string, index: number) => {
    const synth = window.speechSynthesis;

    if (speakingIndex === index) {
      synth.cancel();
      setSpeakingIndex(null);
      return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = detectLanguage(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = synth.getVoices();
    const voice = voices.find((v) => v.lang.startsWith(lang.split('-')[0])) || voices[0];
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'bg-BG';

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
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl sm:h-[22rem] sm:w-[22rem]" />
        <div className="absolute bottom-0 right-[-8rem] h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-200/90">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live preview
          </span>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">AI Support Agent</h1>
            <p className="text-lg text-slate-300 sm:max-w-3xl">
              Test your brand-trained assistant with a fresh Tailwind look, voice input, and text-to-speech replies.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-300 sm:justify-start">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Glassmorphism UI</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Voice + TTS ready</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Tailwind CSS</span>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.6fr,1fr]">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-glow backdrop-blur-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/0 to-cyan-500/5" />
            <div className="relative flex items-center justify-between border-b border-white/5 px-6 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium uppercase tracking-wide text-slate-200">Conversation</p>
                <p className="text-sm text-slate-400">Real-time preview with voice controls</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </div>
            </div>

            <div className="relative space-y-5 p-4 sm:p-6">
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="group rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-400/60 hover:text-white hover:shadow-[0_10px_40px_rgba(8,145,178,0.25)]"
                  >
                    <span className="text-cyan-300 group-hover:text-white">↳</span> {prompt}
                  </button>
                ))}
              </div>

              <div className="h-[440px] space-y-3 overflow-y-auto pr-1">
                {messages.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`relative max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg transition ${
                          isUser
                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-cyan-500/30'
                            : 'border border-white/10 bg-white/10 text-slate-50 backdrop-blur-sm'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => speak(msg.content, i)}
                            className={`absolute -right-11 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:scale-105 hover:border-cyan-400/60 hover:text-white hover:shadow-[0_10px_40px_rgba(8,145,178,0.3)] sm:flex ${
                              speakingIndex === i ? 'ring-2 ring-cyan-400/60' : ''
                            }`}
                            title="Read aloud"
                            aria-label="Read message aloud"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-5 w-5"
                            >
                              <path d="M5 6.25C5 4.45507 6.45507 3 8.25 3H9.5C10.3284 3 11 3.67157 11 4.5V19.5C11 20.3284 10.3284 21 9.5 21H8.25C6.45507 21 5 19.5449 5 17.75V6.25ZM13 6.5C13 6.22386 13.2239 6 13.5 6H15.75C17.5449 6 19 7.45507 19 9.25V14.75C19 16.5449 17.5449 18 15.75 18H13.5C13.2239 18 13 17.7761 13 17.5V6.5ZM15.75 7.5H14V16.5H15.75C16.7165 16.5 17.5 15.7165 17.5 14.75V9.25C17.5 8.2835 16.7165 7.5 15.75 7.5ZM21 12C21 11.4477 21.4477 11 22 11C22.5523 11 23 11.4477 23 12C23 14.0376 22.1757 15.8608 20.9 17.1274C20.5077 17.5149 19.8743 17.5082 19.4868 17.1159C19.0993 16.7235 19.1059 16.0901 19.4983 15.7026C20.3389 14.8726 21 13.5132 21 12ZM2 12C2 10.462 2.37697 9.0509 3.02817 7.91253C3.27307 7.4839 3.82318 7.3348 4.2518 7.5797C4.68043 7.82459 4.82953 8.3747 4.58463 8.80333C4.11152 9.62867 3.75 10.7517 3.75 12C3.75 13.2483 4.11152 14.3713 4.58463 15.1967C4.82953 15.6253 4.68043 16.1754 4.2518 16.4203C3.82318 16.6652 3.27307 16.5161 3.02817 16.0875C2.37697 14.9491 2 13.538 2 12Z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200 backdrop-blur">
                      <div className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300/80" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300/80 [animation-delay:0.12s]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-300/80 [animation-delay:0.24s]" />
                      </div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 shadow-inner shadow-black/30">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={toggleVoiceInput}
                    className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-sm font-medium transition sm:w-auto sm:px-4 ${
                      isListening
                        ? 'border-rose-300/60 bg-rose-500/80 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-white/10 text-slate-100 hover:border-cyan-400/50 hover:bg-white/15'
                    }`}
                    title={isListening ? 'Stop listening' : 'Voice input'}
                  >
                    {isListening ? '⏹ Stop' : '🎤 Voice'}
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? 'Listening...' : 'Type or speak your message...'}
                    className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 text-sm text-slate-100 outline-none ring-0 transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:bg-slate-900/80 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isListening ? 'Listening for your question…' : 'Press Enter to send instantly'}</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-bl from-cyan-400/30 to-emerald-400/0 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-lg text-white shadow-lg shadow-cyan-500/30">
                  🚀
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Embed it anywhere</p>
                  <p className="text-sm text-slate-400">Drop one script tag into your site</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-inner shadow-black/40">
                <p className="text-sm text-slate-300">
                  Add this snippet to your site after deploying (swap in your Vercel URL):
                </p>
                <pre className="mt-3 overflow-auto rounded-xl bg-slate-900/80 p-4 text-xs leading-relaxed text-cyan-100">
{`<script>
  window.AI_SUPPORT_API_URL = 'https://YOUR_VERCEL_URL';
  window.AI_SUPPORT_TITLE = 'Support';
  window.AI_SUPPORT_COLOR = '#22d3ee';
</script>
<script src="https://YOUR_VERCEL_URL/widget.js"></script>`}
                </pre>
              </div>

              <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Voice input and read-aloud are enabled.
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Gradient chat bubbles + glass UI for modern feel.
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
                  Responsive layout ready for embedding previews.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
