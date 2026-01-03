
import React, { useState, useMemo, useEffect } from 'react';
import { Language, WeatherData } from '../types';
import { UI_STRINGS, MP_DISTRICTS, DistrictMetadata } from '../constants';
import { getWeatherData } from '../services/geminiService';
import { 
  CloudRain, TrendingUp, AlertTriangle, Map, MapPin,
  ThermometerSnowflake, Droplets, Info, ChevronRight, 
  X, Sprout, Beaker, CalendarDays, Sun, Cloud, 
  Zap, SunMedium, Loader2, Wind, Sparkles, Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  lang: Language;
}

const generateYieldData = (year: string, month: string) => {
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearNum = parseInt(year);
  const baseYield = yearNum >= 2024 ? 28 : 22;
  
  return shortMonths.map((m, i) => {
    const seasonalFactor = Math.sin((i + yearNum) / 2) * 8;
    const monthSeed = month.length; 
    return {
      name: m,
      yield: Math.max(10, baseYield + seasonalFactor + (Math.random() * 5) + (monthSeed / 10))
    };
  });
};

const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  const strings = UI_STRINGS[lang];
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('June');
  const [activeDistrict, setActiveDistrict] = useState<DistrictMetadata | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const chartData = useMemo(() => generateYieldData(selectedYear, selectedMonth), [selectedYear, selectedMonth]);

  useEffect(() => {
    const fetchWeatherSummary = async () => {
      setWeatherLoading(true);
      try {
        const districtName = activeDistrict?.name || 'Sehore';
        const data = await getWeatherData(districtName, lang);
        setWeather(data);
      } catch (error) {
        console.error("Dashboard weather fetch failed:", error);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeatherSummary();
  }, [activeDistrict, lang]);

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return <CloudRain className="w-10 h-10 text-blue-400" />;
    if (c.includes('sun') || c.includes('clear')) return <Sun className="w-10 h-10 text-yellow-400" />;
    if (c.includes('cloud')) return <Cloud className="w-10 h-10 text-slate-400" />;
    if (c.includes('storm') || c.includes('thunder')) return <Zap className="w-10 h-10 text-violet-400" />;
    return <SunMedium className="w-10 h-10 text-orange-400" />;
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* Precision Weather Widget */}
      <section className="bg-slate-900 rounded-[3.5rem] border border-slate-800 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 via-transparent to-slate-950 pointer-events-none opacity-50" />
        <div className="p-10 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="flex items-center gap-10">
            <div className={`w-28 h-28 bg-slate-950 rounded-[3rem] border border-slate-800 shadow-2xl flex items-center justify-center transition-all duration-700 ${weatherLoading ? 'animate-pulse scale-90' : 'group-hover:scale-110 group-hover:rotate-12 border-lime-400/20'}`}>
              {weatherLoading ? (
                <Loader2 className="w-12 h-12 text-lime-400 animate-spin" />
              ) : (
                getWeatherIcon(weather?.current?.condition || 'Clear')
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-lime-400 uppercase tracking-[0.4em] italic leading-none">Meteorological Sector</span>
                <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(163,230,53,0.6)]" />
              </div>
              <h2 className="text-7xl font-black text-white tracking-tighter italic uppercase leading-none">
                {weatherLoading || !weather?.current ? '--.-' : `${weather.current.temp}`}
              </h2>
              <p className="text-base font-bold text-slate-400 uppercase tracking-widest mt-4 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-lime-400" />
                {activeDistrict?.name || 'Sehore'} • <span className="text-white">{weather?.current?.condition || 'Clear Sky'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-12 w-full lg:w-auto">
            <div className="text-center group/metric min-w-[100px]">
              <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 justify-center">
                <Droplets className="w-4 h-4 text-blue-400" /> Humidity
              </div>
              <p className="text-3xl font-black text-white tracking-tight group-hover/metric:text-lime-400 transition-colors">
                {weatherLoading || !weather?.current ? '--' : weather.current.humidity}
              </p>
            </div>
            <div className="text-center group/metric min-w-[100px]">
              <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 justify-center">
                <Wind className="w-4 h-4 text-slate-400" /> Wind
              </div>
              <p className="text-3xl font-black text-white tracking-tight group-hover/metric:text-lime-400 transition-colors">
                {weatherLoading || !weather?.current ? '--' : weather.current.windSpeed}
              </p>
            </div>
            
            <div className="w-px h-20 bg-slate-800 hidden lg:block" />

            <div className="max-w-[340px] bg-slate-950/80 backdrop-blur-2xl px-8 py-8 rounded-[2.5rem] border border-slate-800 flex items-center gap-6 shadow-2xl">
               <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                 <AlertTriangle className="w-7 h-7 text-red-500 animate-pulse" />
               </div>
               <div className="overflow-hidden">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Atmospheric Risk Radar</p>
                 <p className="text-[13px] font-bold text-slate-200 leading-snug">
                   {weatherLoading || !weather?.agriWarnings ? 'Scanning...' : weather.agriWarnings.length > 0 ? weather.agriWarnings[0] : 'No immediate agricultural warnings for this sector.'}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4 sm:px-0">
        <div className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl md:col-span-2 relative overflow-hidden group">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 relative z-10">
            <div>
              <h3 className="font-black text-white flex items-center gap-5 text-3xl tracking-tighter italic uppercase leading-none">
                <Activity className="w-10 h-10 text-lime-400" />
                Yield Performance
              </h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4 ml-16">Regional Matrix: {selectedYear}</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-3 px-5">
                <CalendarDays className="w-4 h-4 text-slate-500" />
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-[10px] font-black text-white focus:outline-none cursor-pointer uppercase tracking-widest appearance-none"
                >
                  {years.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                </select>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-[10px] font-black text-white focus:outline-none px-6 cursor-pointer uppercase tracking-widest appearance-none"
              >
                {months.map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)}
              </select>
            </div>
          </div>
          <div className="h-[380px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A3E635" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#A3E635" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 900}} dy={20} />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '2.5rem', border: '2px solid #334155', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', padding: '30px' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '15px', color: '#A3E635', textTransform: 'uppercase', letterSpacing: '0.25em', fontSize: '10px' }}
                  itemStyle={{ color: '#fff', fontWeight: 900, fontSize: '2rem' }}
                  labelFormatter={(v) => `${v} Forecast`}
                />
                <Area type="monotone" dataKey="yield" stroke="#A3E635" strokeWidth={8} fill="url(#yieldGrad)" animationDuration={2500} strokeLinecap="round" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-lime-400 p-12 rounded-[4rem] text-slate-950 shadow-2xl flex flex-col justify-between overflow-hidden relative group border-4 border-lime-300">
          <div className="relative z-10">
            <div className="flex items-center gap-8 mb-12">
              <div className="bg-slate-950 w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                <Sparkles className="w-12 h-12 text-lime-400" />
              </div>
              <h3 className="text-4xl font-black tracking-tighter leading-none italic uppercase">Neural Advisor</h3>
            </div>
            <p className="text-slate-900 text-xl font-bold leading-relaxed opacity-95 tracking-tight">
              AI-driven optimization for regional PM-Kisan & Fasal Bima benefits.
            </p>
          </div>
          <button className="relative z-10 mt-12 bg-slate-950 text-lime-400 font-black py-7 rounded-3xl text-[13px] uppercase tracking-[0.3em] shadow-2xl hover:bg-white hover:text-slate-950 hover:scale-[1.05] transition-all active:scale-95">
            Sync Benefits
          </button>
          <Map className="absolute -bottom-24 -right-24 opacity-[0.05] pointer-events-none group-hover:scale-125 transition-all duration-1000 w-[30rem] h-[30rem]" />
        </div>
      </div>

      {/* Sector Mapping Hub */}
      <section className="bg-slate-900 p-12 rounded-[4.5rem] border border-slate-800 shadow-2xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20 relative z-10">
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-white flex items-center gap-6 italic tracking-tighter uppercase leading-none">
              <Map className="w-14 h-14 text-lime-400" />
              Agri-Matrix Hub
            </h2>
            <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.5em] ml-20">2025 Sector Surveillance Active</p>
          </div>
          <div className="bg-slate-950/80 backdrop-blur-2xl px-10 py-5 rounded-[2rem] border border-slate-800 text-[11px] font-black text-lime-400 uppercase tracking-widest shadow-2xl flex items-center gap-4">
            <div className="w-3 h-3 bg-lime-500 rounded-full animate-pulse shadow-[0_0_10px_#A3E635]" />
            MP Regional Nodes: Fully Synced
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative z-10">
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 max-h-[600px] overflow-y-auto pr-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {MP_DISTRICTS.map((d) => (
              <button 
                key={d.name} 
                onClick={() => setActiveDistrict(d)}
                className={`p-10 rounded-[3rem] border-2 transition-all text-left group relative flex flex-col justify-between h-56 ${
                  activeDistrict?.name === d.name 
                    ? 'border-lime-400 bg-lime-400/5 shadow-[0_0_50px_rgba(163,230,53,0.15)] ring-12 ring-lime-400/5 z-10 scale-[1.08]' 
                    : 'border-slate-800 bg-slate-950/50 hover:bg-slate-900 hover:border-slate-600 hover:shadow-2xl hover:-translate-y-2'
                }`}
              >
                <p className={`font-black text-2xl tracking-tighter transition-colors italic uppercase leading-none ${activeDistrict?.name === d.name ? 'text-lime-400' : 'text-slate-300 group-hover:text-white'}`}>
                  {d.name}
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${activeDistrict?.name === d.name ? 'bg-lime-500 animate-pulse' : 'bg-slate-800'}`} />
                  <span className={`text-[11px] font-black uppercase tracking-widest ${activeDistrict?.name === d.name ? 'text-lime-400' : 'text-slate-600'}`}>{d.region}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-1">
            {activeDistrict ? (
              <div className="bg-slate-950 rounded-[4rem] p-12 text-white h-full animate-in zoom-in-95 slide-in-from-right-12 duration-700 relative overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
                <div className="relative z-10 space-y-16">
                  <div className="flex justify-between items-center">
                    <span className="bg-lime-400 text-slate-950 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-2xl italic">REGION: {activeDistrict.region}</span>
                    <button onClick={() => setActiveDistrict(null)} className="p-4 hover:bg-red-500 hover:text-white rounded-2xl transition-all bg-slate-900 text-slate-600 shadow-xl border border-slate-800">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <h3 className="text-7xl font-black tracking-tighter italic uppercase leading-none">{activeDistrict.name}</h3>
                  
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <p className="text-[11px] text-slate-600 uppercase font-black tracking-widest flex items-center gap-3">
                        <Beaker className="w-5 h-5 text-lime-400" /> Soil Matrix
                      </p>
                      <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{activeDistrict.soilType}</p>
                    </div>
                    
                    <div className="space-y-6">
                      <p className="text-[11px] text-slate-600 uppercase font-black tracking-widest flex items-center gap-3">
                        <Sprout className="w-5 h-5 text-lime-400" /> Key Commodities
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {activeDistrict.majorCrops.map(crop => (
                          <span key={crop} className="bg-slate-900 px-6 py-3 rounded-2xl text-xs font-black border border-slate-800 shadow-xl text-slate-200 uppercase italic tracking-tighter">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-16 border-t border-slate-800 opacity-30">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] italic">
                    Node: {activeDistrict.name.toUpperCase()} • MATRIX-V25.3
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full border-4 border-dashed border-slate-800/50 rounded-[4rem] flex flex-col items-center justify-center p-16 text-center bg-slate-900/40 hover:bg-slate-900/80 transition-all group cursor-pointer" onClick={() => setActiveDistrict(MP_DISTRICTS[0])}>
                <Map className="w-24 h-24 text-slate-800 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700" />
                <p className="text-sm font-black text-slate-600 uppercase tracking-[0.5em] leading-relaxed mt-10 italic">
                  Initialize Sector Matrix
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
