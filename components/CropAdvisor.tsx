
import React, { useState } from 'react';
import { Language, SoilData, RecommendationResult } from '../types';
import { UI_STRINGS, MP_DISTRICTS } from '../constants';
import { getCropRecommendation } from '../services/geminiService';
import { Sparkles, MapPin, FlaskConical, Calendar, Loader2, Beaker, Sprout, Leaf, CheckSquare, RotateCcw } from 'lucide-react';

interface CropAdvisorProps { lang: Language; }

const CropAdvisor: React.FC<CropAdvisorProps> = ({ lang }) => {
  const strings = UI_STRINGS[lang];
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [formData, setFormData] = useState<SoilData>({
    district: 'Sehore',
    nitrogen: 45, phosphorus: 30, potassium: 20, ph: 6.5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getCropRecommendation(formData, lang);
      setResult(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      district: 'Sehore',
      nitrogen: 45, phosphorus: 30, potassium: 20, ph: 6.5
    });
  };

  const fallbackText = lang === Language.HINDI ? 'कोई डेटा उपलब्ध नहीं है' : 'No data available';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-700 pb-16">
      <div className="text-center">
        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">{strings.cropAdvisor}</h2>
        <p className="text-slate-400 mt-4 font-medium text-lg tracking-tight">AI-Precision Intelligence for Madhya Pradesh Regions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-slate-900 p-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-800 space-y-10">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-2">Geographic Area</label>
              <div className="relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-lime-400 group-hover:scale-110 transition-transform" />
                <select 
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-[1.8rem] pl-14 pr-8 py-5 focus:ring-4 focus:ring-lime-400/10 focus:border-lime-400 focus:bg-slate-900 transition-all font-black text-white appearance-none cursor-pointer text-sm shadow-inner"
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                >
                  {MP_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {[
                { label: strings.nitrogen, key: 'nitrogen' },
                { label: strings.phosphorus, key: 'phosphorus' },
                { label: strings.potassium, key: 'potassium' },
                { label: strings.ph, key: 'ph', step: 0.1 }
              ].map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{field.label}</label>
                  <input 
                    type="number" step={field.step || 1}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-lime-400/10 focus:border-lime-400 focus:bg-slate-900 transition-all font-black text-white text-center text-base shadow-inner"
                    value={(formData as any)[field.key]}
                    onChange={(e) => setFormData({...formData, [field.key]: Number(e.target.value)})}
                  />
                </div>
              ))}
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-lime-400 hover:bg-lime-500 text-slate-950 font-black py-6 rounded-[2rem] transition-all shadow-2xl shadow-lime-400/20 flex items-center justify-center gap-4 active:scale-95 group"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 text-slate-950 group-hover:rotate-12 transition-transform" />}
              <span className="uppercase tracking-widest text-xs">{loading ? strings.analyzing : strings.getRecommendation}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {result ? (
            <div className="animate-in fade-in zoom-in-95 duration-700 space-y-8">
              <div className="bg-slate-800 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border-4 border-slate-700">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-3xl font-black flex items-center gap-4 tracking-tighter italic">
                      <Sprout className="w-10 h-10 text-lime-400 drop-shadow-lg" /> {strings.cropSuggestion}
                    </h3>
                    <button 
                      onClick={handleReset}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group/btn"
                      title="New Consultation"
                    >
                      <RotateCcw className="w-5 h-5 text-lime-400 group-hover/btn:rotate-180 transition-transform duration-500" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {(result.suggestedCrops || []).map(crop => (
                      <span key={crop} className="bg-white/10 px-8 py-4 rounded-[1.8rem] font-black text-base backdrop-blur-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 shadow-xl">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
                <Leaf className="absolute -bottom-16 -right-16 w-80 h-80 opacity-5 -rotate-45 group-hover:rotate-0 transition-all duration-1000 scale-150" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-800 hover:shadow-2xl transition-all group hover:-translate-y-2">
                  <h4 className="font-black text-white flex items-center gap-4 mb-6 text-xl tracking-tight">
                    <div className="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 group-hover:bg-slate-700 transition-all shadow-inner"><Beaker className="w-6 h-6 text-lime-400" /></div>
                    {strings.fertilizerTitle}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-bold">{result.fertilizerAdvice || fallbackText}</p>
                </div>
                <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-sm border border-slate-800 hover:shadow-2xl transition-all group hover:-translate-y-2">
                  <h4 className="font-black text-white flex items-center gap-4 mb-6 text-xl tracking-tight">
                    <div className="p-3 bg-slate-800 rounded-2xl group-hover:scale-110 group-hover:bg-slate-700 transition-all shadow-inner"><Calendar className="w-6 h-6 text-lime-400" /></div>
                    {strings.irrigationTitle}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-bold">{result.irrigationSchedule || fallbackText}</p>
                </div>
              </div>

              {/* Action Plan Section */}
              <div className="bg-lime-400 p-10 rounded-[3.5rem] text-slate-950 shadow-2xl relative overflow-hidden border-4 border-lime-300">
                <h4 className="font-black flex items-center gap-4 mb-8 text-2xl tracking-tighter uppercase italic">
                  <CheckSquare className="w-8 h-8" />
                  {lang === Language.HINDI ? 'इस सप्ताह का एक्शन प्लान' : 'Smart Field Protocol'}
                </h4>
                <div className="grid gap-4">
                  {(result.risks || []).map((risk, idx) => (
                    <div key={idx} className="flex gap-5 bg-white/40 backdrop-blur-xl p-5 rounded-[1.8rem] items-center border border-white/50 shadow-lg group hover:bg-white/60 transition-all">
                      <div className="w-3 h-3 rounded-full bg-slate-900 shrink-0 shadow-md group-hover:scale-125 transition-transform" />
                      <p className="font-black text-sm tracking-tight">{risk}</p>
                    </div>
                  ))}
                </div>
                <Sparkles className="absolute -top-12 -right-12 w-48 h-48 opacity-10 pointer-events-none animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-slate-900 rounded-[3.5rem] border-4 border-dashed border-slate-800 relative group">
              <div className="bg-slate-800 p-12 rounded-[3rem] shadow-inner mb-10 group-hover:scale-110 group-hover:bg-slate-700 transition-all duration-700">
                <FlaskConical className="w-20 h-20 text-slate-700" />
              </div>
              <h3 className="font-black text-slate-500 text-3xl tracking-tighter italic">Diagnostic Engine Initialized</h3>
              <p className="text-slate-600 text-base mt-6 max-w-sm font-bold leading-relaxed tracking-tight">
                Enter your soil metrics and regional location to unlock precision analytics tailored for the 2025 MP harvest.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropAdvisor;
