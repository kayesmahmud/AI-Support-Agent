'use client';

import { useState, useRef } from 'react';
import { UltravoxSession } from 'ultravox-client';

export default function VoiceTestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callInfo, setCallInfo] = useState<{ callId: string; joinUrl: string } | null>(null);
  const [language, setLanguage] = useState<'en' | 'bg'>('en');
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');
  const sessionRef = useRef<UltravoxSession | null>(null);

  const createVoiceCall = async () => {
    setLoading(true);
    setError(null);
    setCallInfo(null);
    setCallStatus('idle');

    try {
      // Create the call via our API
      const response = await fetch('/api/voice/create-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          voice: 'terrence',
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create voice call');
      }

      setCallInfo({
        callId: data.callId,
        joinUrl: data.joinUrl,
      });

      // Join the call using the SDK
      await joinCall(data.joinUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCallStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const joinCall = async (joinUrl: string) => {
    try {
      setCallStatus('connecting');

      // Create new Ultravox session
      sessionRef.current = new UltravoxSession();

      // Set up event listeners
      sessionRef.current.addEventListener('status', (event: any) => {
        console.log('📞 Call status:', event.state);
        if (event.state === 'connected') {
          setCallStatus('connected');
        } else if (event.state === 'disconnected') {
          setCallStatus('ended');
        }
      });

      sessionRef.current.addEventListener('transcripts', (event: any) => {
        console.log('💬 Transcript:', event);
      });

      // Join the call
      await sessionRef.current.joinCall(joinUrl);
      console.log('✅ Joined call successfully');
    } catch (err) {
      console.error('❌ Failed to join call:', err);
      setError('Failed to join call. Please check your microphone permissions.');
      setCallStatus('idle');
    }
  };

  const endCall = () => {
    if (sessionRef.current) {
      sessionRef.current.leaveCall();
      sessionRef.current = null;
      setCallStatus('ended');
      setCallInfo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            🎙️ Voice Call Test
          </h1>
          <p className="text-gray-300 text-lg">
            Test real-time voice calling with AI Support Agent
          </p>
        </div>


        {/* Call Status Indicator */}
        {callStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-lg border ${
            callStatus === 'connecting' ? 'bg-yellow-500/20 border-yellow-500/50' :
            callStatus === 'connected' ? 'bg-emerald-500/20 border-emerald-500/50' :
            'bg-gray-500/20 border-gray-500/50'
          }`}>
            <div className="flex items-center justify-between">
              <p className={`font-semibold ${
                callStatus === 'connecting' ? 'text-yellow-300' :
                callStatus === 'connected' ? 'text-emerald-300' :
                'text-gray-300'
              }`}>
                {callStatus === 'connecting' && '⏳ Connecting to call...'}
                {callStatus === 'connected' && '✅ Call connected - Start talking!'}
                {callStatus === 'ended' && '📞 Call ended'}
              </p>
              {(callStatus === 'connecting' || callStatus === 'connected') && (
                <button
                  onClick={endCall}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold"
                >
                  🔴 End Call
                </button>
              )}
            </div>
            {callStatus === 'connected' && (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <p className="text-emerald-200 text-sm">Microphone is active - speak now!</p>
              </div>
            )}
          </div>
        )}

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-3">
            Select Language:
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setLanguage('en')}
              disabled={callStatus !== 'idle'}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                language === 'en'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setLanguage('bg')}
              disabled={callStatus !== 'idle'}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                language === 'bg'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🇧🇬 Български
            </button>
          </div>
        </div>

        {/* Start Call Button */}
        <button
          onClick={createVoiceCall}
          disabled={loading || callStatus !== 'idle'}
          className="w-full py-4 px-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Call...
            </span>
          ) : (
            '📞 Start Voice Call'
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-300 text-sm">
              <strong>Error:</strong> {error}
            </p>
            {error.includes('ULTRAVOX_API_KEY') && (
              <div className="mt-3 text-xs text-red-200">
                <p className="font-semibold mb-2">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Sign up at <a href="https://app.ultravox.ai" target="_blank" rel="noopener noreferrer" className="underline">app.ultravox.ai</a></li>
                  <li>Go to Settings → API Keys</li>
                  <li>Create a new API key</li>
                  <li>Add it to your .env file as ULTRAVOX_API_KEY</li>
                  <li>Restart the dev server</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Call Info Display */}
        {callInfo && (
          <div className="mt-6 p-6 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
            <h2 className="text-emerald-300 font-bold text-lg mb-3">
              ✅ Call Created Successfully!
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <strong className="text-white">Call ID:</strong>{' '}
                <code className="bg-black/30 px-2 py-1 rounded">{callInfo.callId}</code>
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-white font-semibold mb-3">📝 How it works:</h3>
          <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
            <li>Select your language (English or Bulgarian)</li>
            <li>Click "Start Voice Call" button</li>
            <li>Allow microphone access when prompted by your browser</li>
            <li>Wait for "Call connected" status</li>
            <li>Start talking to the AI support agent!</li>
            <li>The AI knows your entire knowledge base</li>
            <li>It will respond in the language you selected</li>
            <li>Click "End Call" when done</li>
          </ol>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-2xl mb-2">🌍</div>
            <div className="text-white font-semibold text-sm">Bilingual</div>
            <div className="text-gray-400 text-xs">English & Bulgarian</div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-white font-semibold text-sm">Knowledge Base</div>
            <div className="text-gray-400 text-xs">Uses your docs</div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-white font-semibold text-sm">Real-time</div>
            <div className="text-gray-400 text-xs">Low latency</div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-white font-semibold text-sm">Free Trial</div>
            <div className="text-gray-400 text-xs">30 minutes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
