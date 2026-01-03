
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { connectLiveAssistant } from '../services/geminiService';
import { Mic, MicOff, Loader2, Volume2, Sparkles, X, Activity } from 'lucide-react';

interface LiveAssistantProps {
  lang: Language;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ lang }) => {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = connectLiveAssistant({
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Audio level for visualizer
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            setAudioLevel(Math.sqrt(sum / inputData.length));

            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const base64 = encode(new Uint8Array(int16.buffer));
            sessionPromise.then(session => {
              session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
          setLoading(false);
          setActive(true);
        },
        onmessage: async (message) => {
          const base64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64), outputCtx, 24000, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputCtx.destination);
            source.addEventListener('ended', () => sourcesRef.current.delete(source));
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e) => { console.error("Live API Error:", e); stopSession(); },
        onclose: () => { stopSession(); }
      }, lang);

      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error("Failed to start Live API:", e);
      setLoading(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    sessionRef.current = null;
    setActive(false);
    setAudioLevel(0);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 flex flex-col items-center text-center space-y-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-lime-400/5 to-transparent pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Voice Assistant</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time Real-Audio Conversation</p>
        </div>

        <div className="relative z-10">
          <div className="w-64 h-64 rounded-full bg-slate-950 flex items-center justify-center border-2 border-slate-800 relative">
            {active && (
              <div 
                className="absolute inset-0 rounded-full bg-lime-400/20 animate-ping" 
                style={{ transform: `scale(${1 + audioLevel * 5})` }}
              />
            )}
            
            <button 
              onClick={active ? stopSession : startSession}
              disabled={loading}
              className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${
                active ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-lime-400 text-slate-950 hover:bg-lime-300'
              }`}
            >
              {loading ? (
                <Loader2 className="w-12 h-12 animate-spin" />
              ) : active ? (
                <>
                  <MicOff className="w-12 h-12 mb-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">End Call</span>
                </>
              ) : (
                <>
                  <Mic className="w-12 h-12 mb-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Start Talk</span>
                </>
              )}
            </button>
          </div>
        </div>

        {active ? (
          <div className="flex flex-col items-center gap-6 relative z-10">
            <div className="flex gap-1.5 h-12 items-center">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-lime-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(4, Math.random() * audioLevel * 200)}%` }}
                />
              ))}
            </div>
            <div className="bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700 flex items-center gap-3">
              <Activity className="w-4 h-4 text-lime-400 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Link Secure</span>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 max-w-sm text-sm font-bold leading-relaxed relative z-10">
            Click the button to start a real-time voice conversation with Kisan Sahayak. No buttons to push once you start talking!
          </p>
        )}

        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
          <Volume2 className="w-64 h-64" />
        </div>
      </div>
    </div>
  );
};

export default LiveAssistant;
