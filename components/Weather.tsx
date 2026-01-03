
import React, { useState, useEffect } from 'react';
import { Language, WeatherData } from '../types';
import { UI_STRINGS, MP_DISTRICTS } from '../constants';
import { getWeatherData } from '../services/geminiService';
// Added ExternalLink to imports to support grounding sources
import { Cloud, Sun, CloudRain, Thermometer, Wind, Droplets, Loader2, MapPin, Sparkles, AlertTriangle, ShieldCheck, Calendar, Zap, SunMedium, CheckCircle, ExternalLink } from 'lucide-react';

interface WeatherProps {
  lang: Language;
}

const Weather: React.FC<WeatherProps> = ({ lang }) => {
  const [district, setDistrict] = useState('Sehore');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetchWeather();
  }, [district, lang]);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const result = await getWeatherData(district, lang);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return <CloudRain className="w-12 h-12 text-blue-400" />;
    if (c.includes('sun') || c.includes('clear')) return <Sun className="w-12 h-12 text-yellow-400" />;
    if (c.includes('cloud')) return <Cloud className="w-12 h-12 text-slate-400" />;
    if (c.includes('storm') || c.includes('thunder')) return <Zap className="w-12 h-12 text-violet-400" />;
    return <SunMedium className="w-12 h-12 text-orange-400" />;
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-8">
        <Loader2 className="w-16 h-16 text-lime-400 animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Weather Satellites...</p>
      </div>
    );
  }

  if (!data?.current || !data?.forecast) {
    return (
       <div className="max-w-6xl mx-auto py-20 px-4 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-white">Weather Data Incomplete</h3>
        <p className="text-slate-400 mt-2">Could not retrieve complete meteorological data. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Live Weather</h2>
          <p className="text-slate-400 mt-4 font-medium text-lg tracking-tight">Agricultural Meteorological Intelligence</p>
        </div>
        <div className="relative group min-w-[240px]">
          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-lime-400 z-10" />
          <select 
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-800 rounded-[2rem] pl-14 pr-8 py-5 focus:ring-4 focus:ring-lime-400/10 focus:border-lime-400 transition-all font-black text-white appearance-none cursor-pointer text-sm shadow-2xl"
          >
            {MP_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-4">
        {/* Main Weather Card */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-4">
                  <span className="bg-lime-400 text-slate-950 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic">Current Status</span>
                  <h3 className="text-7xl font-black text-white tracking-tighter leading-none">{data.current.temp}</h3>
                  <p className="text-2xl font-black text-lime-400 uppercase tracking-tight italic">{data.current.condition}</p>
                </div>
                <div className="bg-slate-800/50 p-8 rounded-[2.5rem] shadow-inner border border-slate-700/50 group-hover:scale-110 transition-transform duration-700">
                  {getWeatherIcon(data.current.condition)}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-10 border-t border-slate-800/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <Thermometer className="w-3.5 h-3.5" /> Feels Like
                  </div>
                  <p className="text-xl font-black text-white">{data.current.feelsLike}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <Droplets className="w-3.5 h-3.5" /> Humidity
                  </div>
                  <p className="text-xl font-black text-white">{data.current.humidity}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <Wind className="w-3.5 h-3.5" /> Wind Speed
                  </div>
                  <p className="text-xl font-black text-white">{data.current.windSpeed}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <Sun className="w-3.5 h-3.5" /> UV Index
                  </div>
                  <p className="text-xl font-black text-white">{data.current.uvIndex}</p>
                </div>
              </div>
            </div>
            <Sparkles className="absolute -top-12 -right-12 w-64 h-64 text-lime-400/5 pointer-events-none" />
          </div>

          {/* Forecast Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {data.forecast.map((day, i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-[2.5rem] border border-slate-800 text-center space-y-4 hover:border-lime-400/30 transition-all group">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{day.day}</p>
                <div className="mx-auto bg-slate-800 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                  {getWeatherIcon(day.condition)}
                </div>
                <div className="space-y-1">
                  <p className="text-base font-black text-white">{day.high}</p>
                  <p className="text-xs font-bold text-slate-500">{day.low}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agri Insights Sidebar */}
        <div className="space-y-8">
          <div className="bg-lime-400 p-10 rounded-[3rem] text-slate-950 shadow-2xl relative overflow-hidden group border-4 border-lime-300">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-950 rounded-2xl shadow-xl">
                  <ShieldCheck className="w-6 h-6 text-lime-400" />
                </div>
                <h4 className="text-xl font-black uppercase italic tracking-tighter">Sowing Protocol</h4>
              </div>
              <p className="text-sm font-black leading-relaxed italic opacity-90">
                {data.sowingSuitability}
              </p>
            </div>
            <Cloud className="absolute -bottom-12 -right-12 w-48 h-48 opacity-10 rotate-12 pointer-events-none" />
          </div>

          <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-sm space-y-8">
            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              Agri Alerts
            </h4>
            <div className="space-y-4">
              {data.agriWarnings.map((warning, i) => (
                <div key={i} className="flex gap-4 p-5 bg-slate-950 border border-slate-800 rounded-2xl items-start group hover:border-red-400/30 transition-all">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">{warning}</p>
                </div>
              ))}
              {data.agriWarnings.length === 0 && (
                <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800">
                  <CheckCircle className="w-8 h-8 text-lime-400 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">All Systems Clear</p>
                </div>
              )}
            </div>

            {/* Added sources section to comply with Google Search grounding requirements */}
            {data.sources && data.sources.length > 0 && (
              <div className="pt-6 border-t border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Weather Sources</p>
                <div className="flex flex-wrap gap-2">
                  {data.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all border border-slate-700"
                    >
                      <ExternalLink className="w-3 h-3" /> {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
