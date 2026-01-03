
import React, { useState, useRef } from 'react';
import { Language, PestAnalysisResult } from '../types';
import { UI_STRINGS } from '../constants';
import { analyzePestImage } from '../services/geminiService';
import { Camera, Loader2, Bug, ShieldAlert, CheckCircle2, RefreshCw, X, Plus, ChevronLeft, ChevronRight, Maximize2, Sprout, ArrowLeft } from 'lucide-react';

interface PestDoctorProps {
  lang: Language;
}

const PestDoctor: React.FC<PestDoctorProps> = ({ lang }) => {
  const strings = UI_STRINGS[lang];
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [result, setResult] = useState<PestAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      (Array.from(files) as File[]).forEach(file => {
        if (images.length >= 3) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => {
            const next = [...prev, reader.result as string].slice(0, 3);
            if (prev.length === 0) setActiveImageIdx(0);
            return next;
          });
          setResult(null);
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (activeImageIdx >= next.length) setActiveImageIdx(Math.max(0, next.length - 1));
      return next;
    });
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    setLoading(true);
    try {
      const analysis = await analyzePestImage(images, lang);
      setResult(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImages([]);
    setResult(null);
    setActiveImageIdx(0);
  };

  const backToScan = () => {
    setResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">{strings.pestDoctor}</h2>
        <p className="text-slate-400 mt-4 font-medium text-lg tracking-tight">
          {lang === Language.HINDI 
            ? 'विस्तृत जांच के लिए फसल की फोटो अपलोड करें' 
            : 'Precision Infestation Analysis for regional MP crops'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Gallery Section */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-6 rounded-[3.5rem] border border-slate-800 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] space-y-6">
            {images.length > 0 ? (
              <div className="space-y-6">
                {/* Main View */}
                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-slate-950 group shadow-inner border border-slate-900">
                  <img 
                    src={images[activeImageIdx]} 
                    alt="Inspection View" 
                    className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-10">
                    <div className="flex items-center gap-3 text-white font-black text-[11px] uppercase tracking-[0.2em] backdrop-blur-2xl bg-slate-900/40 px-6 py-3 rounded-full border border-white/20 shadow-2xl">
                      <Maximize2 className="w-4 h-4" /> Inspection Frame {activeImageIdx + 1}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeImage(activeImageIdx)}
                    className="absolute top-6 right-6 p-4 bg-slate-900/95 hover:bg-red-500 hover:text-white text-red-500 rounded-3xl shadow-2xl backdrop-blur-xl transition-all active:scale-90 border border-slate-800"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveImageIdx(prev => (prev - 1 + images.length) % images.length)}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-5 bg-slate-900/95 hover:bg-lime-400 hover:text-slate-950 text-slate-300 rounded-3xl shadow-2xl backdrop-blur-xl transition-all border border-slate-800 active:scale-90"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => setActiveImageIdx(prev => (prev + 1) % images.length)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-5 bg-slate-900/95 hover:bg-lime-400 hover:text-slate-950 text-slate-300 rounded-3xl shadow-2xl backdrop-blur-xl transition-all border border-slate-800 active:scale-90"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails Row */}
                <div className="flex items-center gap-4 px-2">
                  {images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-24 h-24 rounded-[1.8rem] overflow-hidden border-4 transition-all shadow-lg ${
                        activeImageIdx === idx ? 'border-lime-400 ring-4 ring-lime-400/10 scale-110 z-10' : 'border-slate-800 opacity-40 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="Thumb" />
                    </button>
                  ))}
                  {images.length < 3 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-[1.8rem] border-2 border-dashed border-slate-700 hover:border-lime-400 hover:bg-lime-400/10 transition-all flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-lime-400 group"
                    >
                      <Plus className="w-6 h-6 group-hover:scale-125 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Add</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-[2.5rem] border-4 border-dashed border-slate-800 hover:border-lime-400/20 hover:bg-lime-400/5 transition-all flex flex-col items-center justify-center gap-8 group py-12"
              >
                <div className="p-10 bg-slate-800 rounded-[2.5rem] group-hover:bg-lime-400 group-hover:text-slate-950 transition-all group-hover:scale-110 shadow-2xl shadow-lime-400/5 group-hover:shadow-lime-400/20">
                  <Camera className="w-16 h-16" />
                </div>
                <div className="space-y-2 text-center">
                  <p className="font-black text-white tracking-tighter text-2xl uppercase italic">{strings.detectPest}</p>
                  <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Target infected leaf or stem</p>
                </div>
              </button>
            )}

            <input 
              type="file" 
              accept="image/*" 
              multiple
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          <div className="flex gap-5">
            <button 
              onClick={handleAnalyze}
              disabled={loading || images.length === 0}
              className="flex-1 bg-lime-400 hover:bg-lime-500 text-slate-950 font-black py-7 rounded-[2.5rem] transition-all shadow-2xl shadow-lime-400/20 flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.98] group"
            >
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Bug className="w-8 h-8 text-slate-950 group-hover:rotate-12 transition-transform" />}
              <span className="uppercase tracking-[0.2em] text-xs">{loading ? strings.analyzing : 'Identify Pathogen'}</span>
            </button>
            {images.length > 0 && (
              <button onClick={reset} className="p-7 bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-[2.5rem] transition-all shadow-xl group">
                <RefreshCw className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="h-full">
          {result ? (
            <div className="bg-slate-900 p-12 rounded-[3.5rem] border border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-700 space-y-12 sticky top-24">
              <div className="flex items-start justify-between">
                <div>
                  <button 
                    onClick={backToScan}
                    className="mb-6 flex items-center gap-2 text-lime-400 text-[10px] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Images
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-200">Critical Threat</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence Index: {((result.confidence || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <h3 className="text-5xl font-black text-white tracking-tighter leading-none italic">{result.pestName || (lang === Language.HINDI ? 'अज्ञात कीट' : 'Unknown Pest')}</h3>
                </div>
                <div className="bg-lime-400 p-6 rounded-[2rem] shadow-2xl shadow-lime-400/20 transform rotate-6">
                  <ShieldAlert className="w-10 h-10 text-slate-950" />
                </div>
              </div>

              <div className="space-y-12">
                <div className="group">
                  <h4 className="font-black text-white flex items-center gap-4 mb-6 text-2xl tracking-tighter uppercase italic">
                    <div className="p-3 bg-slate-800 rounded-2xl shadow-inner"><Bug className="w-6 h-6 text-lime-400" /></div>
                    {lang === Language.HINDI ? 'एआई उपचार सलाह' : 'Prescribed Remedy'}
                  </h4>
                  <div className="bg-slate-950 p-10 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group-hover:shadow-lg transition-all">
                    <p className="text-lg text-slate-300 leading-relaxed font-bold relative z-10">
                      {result.remedy || (lang === Language.HINDI ? 'कोई उपाय उपलब्ध नहीं है।' : 'No remedy information available.')}
                    </p>
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                      <Sprout className="w-64 h-64 text-lime-400" />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <h4 className="font-black text-white flex items-center gap-4 mb-8 text-2xl tracking-tighter uppercase italic">
                    <div className="p-3 bg-slate-800 rounded-2xl shadow-inner"><CheckCircle2 className="w-6 h-6 text-lime-400" /></div>
                    {lang === Language.HINDI ? 'बचाव प्रोटोकॉल' : 'Security Measures'}
                  </h4>
                  <div className="space-y-4">
                    {(result.preventiveMeasures && result.preventiveMeasures.length > 0) ? (
                      result.preventiveMeasures.map((measure, idx) => (
                        <div key={idx} className="flex items-center gap-6 bg-slate-950 border-2 border-slate-800 p-6 rounded-[2rem] hover:bg-slate-900 hover:border-lime-400/30 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 group/item">
                          <div className="w-4 h-4 rounded-full bg-lime-400 shadow-lg shadow-lime-400/20 shrink-0 group-hover/item:scale-125 transition-transform" />
                          <span className="text-base text-slate-300 font-black tracking-tight">{measure}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                        <p className="text-sm font-bold text-slate-400">{lang === Language.HINDI ? 'कोई निवारक उपाय प्रदान नहीं किए गए।' : 'No preventive measures provided.'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-12 pt-10 border-t border-slate-800">
                <button
                  onClick={reset}
                  className="w-full bg-lime-400 hover:bg-lime-500 text-slate-950 font-black py-6 rounded-[2rem] transition-all shadow-2xl shadow-lime-400/20 flex items-center justify-center gap-4 group"
                >
                  <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="uppercase tracking-[0.2em] text-xs">Scan Again</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-20 bg-slate-900 rounded-[3.5rem] border-4 border-dashed border-slate-800 relative group">
              <div className="bg-slate-800 p-14 rounded-[3.5rem] shadow-inner mb-12 relative overflow-hidden group-hover:bg-slate-750 transition-all duration-700">
                <ShieldAlert className="w-24 h-24 text-slate-700 relative z-10" />
                <div className="absolute inset-0 bg-lime-400/10 rounded-full animate-ping duration-[4s]" />
              </div>
              <h3 className="font-black text-slate-500 text-4xl tracking-tighter italic leading-none">Inspection Terminal Ready</h3>
              <p className="text-slate-600 text-lg mt-6 max-w-sm font-bold leading-relaxed tracking-tight">
                Upload crop captures for precise cross-referencing against the MP 2025 pest database. Accuracy improves with multi-view inputs.
              </p>
              <div className="mt-12 flex gap-4">
                {[1, 2, 3].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-lime-400/20 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PestDoctor;
