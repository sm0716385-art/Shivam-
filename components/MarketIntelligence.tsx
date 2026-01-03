
import React, { useState } from 'react';
import { Language, MarketIntelligenceResult } from '../types';
import { UI_STRINGS, MP_DISTRICTS } from '../constants';
import { getMarketIntelligence } from '../services/geminiService';
import { 
  TrendingUp, BarChart3, Search, Loader2, IndianRupee, 
  Sparkles, MapPin, Activity, Target, ArrowRight, ShieldCheck,
  AlertCircle, ChevronRight, Info, Key, RefreshCw, AlertTriangle, Warehouse
} from 'lucide-react';

interface MarketIntelligenceProps {
  lang: Language;
}

const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({ lang }) => {
  const strings = UI_STRINGS[lang];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [district, setDistrict] = useState('Sehore');
  const [crop, setCrop] = useState('');
  const [mandis, setMandis] = useState('');
  const [result, setResult] = useState<MarketIntelligenceResult | null>(null);

  const commonCrops = [
    { en: 'Wheat', hi: 'गेहूं' },
    { en: 'Soybean', hi: 'सोयाबीन' },
    { en: 'Gram (Chana)', hi: 'चना' },
    { en: 'Mustard', hi: 'सरसों' },
    { en: 'Potato', hi: 'आलू' },
    { en: 'Rice', hi: 'चावल' }
  ];

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!crop) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketIntelligence(crop, district, mandis, lang);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('429')) {
        setError('Quota Exceeded: Your API limit has been reached. Please wait a moment or use your own API key.');
      } else {
        setError('Predictive analysis encountered an issue. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenKeySelector = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      handlePredict(); // Retry after key selection
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-lime-400 p-2 rounded-xl shadow-[0_0_15px_rgba(163,230,53,0.3)]">
              <TrendingUp className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-[10px] font-black text-lime-400 uppercase tracking-[0.4em] italic leading-none">Market Intelligence Terminal</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
            {lang === Language.HINDI ? 'बाजार मूल्य अनुमान' : 'Price Forecasting'}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Sector</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-400 z-10" />
                <select 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 focus:ring-4 focus:ring-lime-400/10 text-white font-black text-xs uppercase appearance-none cursor-pointer"
                >
                  {MP_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Asset Identifier</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-400 z-10" />
                <input 
                  type="text"
                  placeholder={lang === Language.HINDI ? 'फसल का नाम...' : 'Enter Crop Name...'}
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-xs font-black text-white focus:border-lime-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specific Mandis (Optional)</label>
              <div className="relative group">
                <Warehouse className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-400 z-10" />
                <input 
                  type="text"
                  placeholder={lang === Language.HINDI ? 'मंडी के नाम लिखें...' : 'Enter Mandi Names...'}
                  value={mandis}
                  onChange={(e) => setMandis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-xs font-black text-white focus:border-lime-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {commonCrops.map(c => (
                <button 
                  key={c.en}
                  onClick={() => { setCrop(lang === Language.HINDI ? c.hi : c.en); }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-lime-400 hover:text-slate-950 rounded-lg text-[9px] font-black uppercase border border-slate-700 transition-all"
                >
                  {lang === Language.HINDI ? c.hi : c.en}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handlePredict()}
              disabled={loading || !crop}
              className="w-full bg-lime-400 hover:bg-lime-500 disabled:opacity-30 text-slate-950 font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
              <span className="uppercase tracking-widest text-xs">Run Intelligence Scan</span>
            </button>
          </div>

          <div className="bg-lime-400 p-8 rounded-[2.5rem] text-slate-950 space-y-4 shadow-2xl relative overflow-hidden group">
            <h4 className="text-xl font-black italic tracking-tighter uppercase leading-none">Mandi Monitor</h4>
            <p className="text-[10px] font-bold leading-relaxed opacity-80">Scanning current arrivals, historical price gaps, and MSP buffers across MP.</p>
            <Warehouse className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-10">
          {error ? (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px] gap-8 bg-slate-900/50 rounded-[3.5rem] border border-red-500/30 p-12 text-center">
              <div className="p-8 bg-red-500/10 rounded-full border border-red-500/20 text-red-500">
                <AlertTriangle className="w-16 h-16" />
              </div>
              <div className="space-y-4 max-w-md">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Scan Interrupted</h3>
                <p className="text-slate-400 text-sm font-bold leading-relaxed">{error}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => handlePredict()}
                  className="flex items-center gap-2 px-8 py-4 bg-lime-400 text-slate-950 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-white transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Restart Scan
                </button>
                <button 
                  onClick={handleOpenKeySelector}
                  className="flex items-center gap-2 px-8 py-4 bg-slate-800 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest border border-slate-700 hover:bg-slate-700 transition-all"
                >
                  <Key className="w-4 h-4" /> Update Access Key
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px] gap-8 bg-slate-900/50 rounded-[3.5rem] border border-slate-800 animate-pulse">
              <Loader2 className="w-20 h-20 text-lime-400 animate-spin" />
              <div className="text-center space-y-2">
                <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Processing Regional Mandi Data...</p>
                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">Grounding 5-Year Price History & Current Volume</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-10 animate-in zoom-in-95 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {result.predictions.map((p, i) => (
                  <div key={i} className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-xl relative overflow-hidden group hover:border-lime-400 transition-all">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <p className="text-[10px] font-black text-lime-400 uppercase tracking-widest mb-2">{p.timeframe} Window</p>
                        <h4 className="text-3xl font-black text-white italic tracking-tighter leading-none">₹{p.avg}</h4>
                      </div>
                      <div className="bg-slate-800 p-3 rounded-2xl shadow-inner border border-slate-700">
                        <Target className="w-6 h-6 text-lime-400" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expected Band (Min - Max)</span>
                        <span className="text-xs font-black text-white">₹{p.min} - ₹{p.max}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">Confidence Index</span>
                          <span className="text-lime-400">{p.confidence}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div className="h-full bg-lime-400 transition-all duration-1000" style={{ width: `${p.confidence}%` }} />
                        </div>
                      </div>
                    </div>
                    <IndianRupee className="absolute -bottom-8 -right-8 w-40 h-40 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 shadow-xl space-y-8 relative overflow-hidden group">
                  <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-lime-400" />
                    Market Drivers
                  </h4>
                  <div className="space-y-4">
                    {result.influencingFactors.map((f, i) => (
                      <div key={i} className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 group-hover:border-lime-400/20 transition-all">
                        <ChevronRight className="w-4 h-4 text-lime-400 shrink-0" />
                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-tight">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Sparkles className="absolute -top-12 -right-12 w-48 h-48 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-1000" />
                </div>

                <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
                  <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none flex items-center gap-4">
                    <Info className="w-6 h-6 text-lime-400" />
                    Neural Advisory (हिन्दी)
                  </h4>
                  <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800">
                    <p className="text-lg font-bold text-slate-200 leading-relaxed italic">
                      {result.summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 bg-lime-400/10 rounded-2xl border border-lime-400/20 w-fit">
                    <ShieldCheck className="w-4 h-4 text-lime-400" />
                    <span className="text-[9px] font-black text-lime-400 uppercase tracking-widest">Grounding Verified</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-slate-900 rounded-[3.5rem] border-4 border-dashed border-slate-800 relative group">
              <div className="p-10 bg-slate-800 rounded-[3rem] shadow-inner mb-10 group-hover:scale-110 transition-all duration-700">
                <Warehouse className="w-20 h-20 text-slate-700" />
              </div>
              <h3 className="font-black text-slate-500 text-3xl tracking-tighter italic uppercase leading-none">Mandi Intelligence Offline</h3>
              <p className="text-slate-600 text-base mt-6 max-w-sm font-bold leading-relaxed tracking-tight">
                Select a crop and region to analyze historical price nodes, current arrivals, and weather impacts on the 2025 market cycle.
              </p>
              <div className="mt-12 flex gap-4">
                {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-lime-400/10 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;
