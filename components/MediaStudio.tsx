
import React, { useState, useEffect } from 'react';
import { generateAgriImage, generateAgriVideo, editAgriImage } from '../services/geminiService';
import { Image, Video, Wand2, Plus, Download, Loader2, Play, LayoutGrid, X } from 'lucide-react';

const MediaStudio: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'gen-img' | 'gen-vid' | 'edit-img'>('gen-img');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [uploadImg, setUploadImg] = useState<string | null>(null);

  // Validate model-specific constraints on tool change
  useEffect(() => {
    if (activeTool === 'gen-vid' && !['16:9', '9:16'].includes(aspectRatio)) {
      setAspectRatio('16:9');
    }
  }, [activeTool, aspectRatio]);

  const handleAction = async () => {
    // Users must select their own API key for Gemini 3 Pro and Veo models
    if (activeTool === 'gen-img' || activeTool === 'gen-vid') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Assume selection successful and proceed to application
      }
    }

    setLoading(true);
    try {
      if (activeTool === 'gen-img') {
        const url = await generateAgriImage(prompt, aspectRatio, imageSize);
        setResult(url);
      } else if (activeTool === 'gen-vid') {
        const url = await generateAgriVideo(prompt, aspectRatio as any, uploadImg || undefined);
        setResult(url);
      } else if (activeTool === 'edit-img' && uploadImg) {
        const url = await editAgriImage(uploadImg, prompt);
        setResult(url);
      }
    } catch (e) {
      console.error("Media Generation Failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white leading-none">Media Studio</h2>
          <p className="text-slate-400 font-medium mt-4 tracking-tight">Generate agricultural visualizations via Veo 3.1 & Gemini 3 Pro</p>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          {[
            { id: 'gen-img', label: 'Image Gen', icon: Image },
            { id: 'gen-vid', label: 'Video Gen', icon: Video },
            { id: 'edit-img', label: 'AI Edit', icon: Wand2 }
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id as any); setResult(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTool === tool.id ? 'bg-lime-400 text-slate-900' : 'text-slate-500 hover:text-white'
              }`}
            >
              <tool.icon className="w-4 h-4" /> {tool.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 space-y-8 shadow-2xl">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visual Prompt</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-sm text-white focus:ring-4 focus:ring-lime-400/20 focus:outline-none transition-all font-bold min-h-[120px]"
              placeholder={activeTool === 'edit-img' ? "Specify AI modifications..." : "Describe the agricultural scene..."}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </div>

          {(activeTool === 'gen-img' || activeTool === 'gen-vid') && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Aspect Ratio</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-white focus:outline-none cursor-pointer"
                  value={aspectRatio}
                  onChange={e => setAspectRatio(e.target.value)}
                >
                  {(activeTool === 'gen-vid' ? ['16:9', '9:16'] : ['1:1', '16:9', '9:16', '4:3', '3:4']).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              {activeTool === 'gen-img' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quality Resolution</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-white focus:outline-none cursor-pointer"
                    value={imageSize}
                    onChange={e => setImageSize(e.target.value)}
                  >
                    {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}

          {(activeTool === 'edit-img' || activeTool === 'gen-vid') && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Input Asset</label>
              <div 
                onClick={() => document.getElementById('studio-upload')?.click()}
                className="w-full aspect-video border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-950 transition-all overflow-hidden"
              >
                {uploadImg ? (
                  <img src={uploadImg} className="w-full h-full object-cover" alt="Source" />
                ) : (
                  <>
                    <Plus className="w-8 h-8 text-slate-700 mb-2" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Select Reference Photo</span>
                  </>
                )}
                <input type="file" id="studio-upload" className="hidden" onChange={onFileChange} />
              </div>
            </div>
          )}

          <button
            onClick={handleAction}
            disabled={loading || !prompt}
            className="w-full bg-lime-400 hover:bg-lime-500 text-slate-950 font-black py-5 rounded-2xl transition-all shadow-xl shadow-lime-400/10 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
            <span className="uppercase tracking-[0.2em] text-xs">Begin Generation</span>
          </button>
        </div>

        <div className="relative">
          {loading ? (
            <div className="h-full w-full bg-slate-900/50 rounded-[2.5rem] border border-slate-800 flex flex-col items-center justify-center gap-6 p-10 text-center animate-pulse">
              <div className="w-20 h-20 bg-lime-400/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-lime-400 animate-spin" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synthesizing Neural Visuals...</p>
            </div>
          ) : result ? (
            <div className="h-full w-full bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl relative group">
              {activeTool === 'gen-vid' ? (
                <video src={result} controls autoPlay loop className="w-full h-full object-contain" />
              ) : (
                <img src={result} className="w-full h-full object-contain" alt="Asset" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <a href={result} download="kisan-ai-gen.png" className="p-4 bg-white text-slate-950 rounded-2xl shadow-xl hover:scale-110 transition-transform">
                  <Download className="w-6 h-6" />
                </a>
                <button onClick={() => setResult(null)} className="p-4 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full w-full bg-slate-950 border-4 border-dashed border-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl mb-6">
                <LayoutGrid className="w-16 h-16 text-slate-800" />
              </div>
              <h3 className="font-black text-slate-600 text-xl tracking-tighter uppercase italic leading-none">Preview Engine</h3>
              <p className="text-slate-700 text-[10px] mt-4 font-black uppercase tracking-[0.2em]">Neural Output Initialized</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaStudio;
