
import React, { useState, useRef, useEffect } from 'react';
import { Language, ChatMessage } from '../types';
import { UI_STRINGS } from '../constants';
import { getKisanChatResponse, textToSpeech } from '../services/geminiService';
import { Send, User, Bot, Loader2, MessageCircle, Volume2, Sparkles } from 'lucide-react';

interface KisanChatProps {
  lang: Language;
}

const KisanChat: React.FC<KisanChatProps> = ({ lang }) => {
  const strings = UI_STRINGS[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  // Decode raw PCM from Gemini TTS and play via Web Audio API
  const playRawPcm = async (base64Data: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const frameCount = dataInt16.length;
      const buffer = audioContext.createBuffer(1, frameCount, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (e) {
      console.error("PCM Playback Error:", e);
    }
  };

  const handleSend = async (customMsg?: string) => {
    const userMsg = customMsg || input;
    if (!userMsg.trim() || loading) return;
    
    setInput('');
    const userHistory: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(userHistory);
    setLoading(true);

    try {
      const response = await getKisanChatResponse(messages, userMsg, lang);
      const audioData = await textToSpeech(response || '');
      
      setMessages(prev => [...prev, { role: 'model', text: response || '', audio: audioData }]);
      
      if (audioData) {
        await playRawPcm(audioData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[80vh] bg-slate-950 rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden relative">
      {/* Refined Header */}
      <div className="bg-slate-900/50 backdrop-blur-md px-8 py-6 flex items-center justify-between border-b border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-lime-400 p-3 rounded-2xl shadow-[0_0_20px_rgba(163,230,53,0.2)]">
              <MessageCircle className="w-6 h-6 text-slate-950" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-lime-500 border-2 border-slate-950 rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-xl tracking-tight text-white uppercase italic leading-none">{strings.kisanChat}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-lime-400" /> Neural Assistant Active
            </p>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-gradient-to-b from-slate-950 to-slate-900/50 scroll-smooth">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
            <div className="p-8 bg-slate-900 rounded-full border border-slate-800">
              <Bot className="w-12 h-12 text-slate-700" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Start a conversation with Kisan Sahayak</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] flex gap-4 flex-row items-end`}>
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border-2 ${
                m.role === 'user' ? 'bg-lime-400 border-lime-300 text-slate-950' : 'bg-slate-800 border-slate-700 text-lime-400'
              }`}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className="flex flex-col space-y-2">
                <div className={`px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-xl border ${
                  m.role === 'user' 
                    ? 'bg-lime-400 text-slate-950 rounded-br-none border-lime-300 font-bold' 
                    : 'bg-slate-900/80 backdrop-blur-sm text-slate-200 rounded-bl-none border-slate-800 font-medium'
                }`}>
                  {m.text}
                </div>
                {m.audio && (
                  <button 
                    onClick={() => playRawPcm(m.audio!)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-xl w-fit transition-colors group"
                  >
                    <Volume2 className="w-4 h-4 text-lime-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-lime-400">Play Advice</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex gap-4 items-end">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-slate-600" />
              </div>
              <div className="px-6 py-4 bg-slate-900 border border-slate-800 rounded-3xl rounded-bl-none">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Refined Input Field */}
      <div className="p-6 md:p-8 bg-slate-900/80 border-t border-slate-800">
        <div className="relative group max-w-3xl mx-auto">
          <input 
            type="text"
            placeholder={strings.chatPlaceholder}
            className="w-full bg-slate-950 border-2 border-slate-800 rounded-[2rem] pl-8 pr-20 py-5 text-sm font-bold focus:ring-4 focus:ring-lime-400/10 focus:border-lime-400/50 focus:outline-none transition-all text-white placeholder:text-slate-600 shadow-inner group-hover:border-slate-700"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="absolute right-3 top-3 bottom-3 bg-lime-400 hover:bg-lime-300 disabled:opacity-30 disabled:grayscale text-slate-950 px-6 rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-center mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
          MP Kisan AI • Smart Agritech Assistant
        </p>
      </div>
    </div>
  );
};

export default KisanChat;
