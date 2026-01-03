
import React, { useState } from 'react';
import { Language, Notification } from '../types';
import { UI_STRINGS } from '../constants';
import { Leaf, Globe, Bell, MessageSquareText, BarChart3, ShieldCheck, ChevronLeft, X, CheckCircle, Info, AlertTriangle, Mic, TrendingUp } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  setLang: (l: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, lang, setLang, activeTab, setActiveTab }) => {
  const strings = UI_STRINGS[lang];
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Weather Alert', message: 'Heavy rain predicted in Sehore district next 48 hours.', type: 'alert', time: '2 mins ago', read: false },
    { id: '2', title: 'Market Insight', message: 'Wheat prices in Indore Mandi up by 4.2% today.', type: 'success', time: '1 hour ago', read: false },
    { id: '3', title: 'System Update', message: 'MP Agri Database updated for 2025 Rabi season.', type: 'info', time: '3 hours ago', read: true },
  ]);

  const navItems = [
    { id: 'dashboard', label: strings.dashboard, icon: BarChart3 },
    { id: 'advisor', label: strings.cropAdvisor, icon: Leaf },
    { id: 'market', label: lang === Language.HINDI ? 'बाजार' : 'Market', icon: TrendingUp },
    { id: 'pest', label: strings.pestDoctor, icon: ShieldCheck },
    { id: 'chat', label: strings.kisanChat, icon: MessageSquareText },
    { id: 'live', label: 'Live Assist', icon: Mic },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <header className="bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              {activeTab !== 'dashboard' && (
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-all text-lime-400 lg:hidden"
                  aria-label="Back to Dashboard"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
                <div className="bg-lime-400 p-2.5 rounded-2xl transition-all group-hover:rotate-12 group-hover:scale-110 shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                  <Leaf className="w-6 h-6 text-slate-950" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-black tracking-tighter uppercase block leading-none text-white">{strings.title}</span>
                  <span className="text-[10px] font-bold text-lime-400 uppercase tracking-widest mt-1 block">MP Agri Platform</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 border ${
                    activeTab === item.id 
                    ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.2)]' 
                    : 'bg-transparent text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <button 
                onClick={() => setLang(lang === Language.ENGLISH ? Language.HINDI : Language.ENGLISH)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 sm:px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{strings.languageToggle}</span>
                <span className="xs:hidden">{lang === Language.ENGLISH ? 'HI' : 'EN'}</span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2.5 rounded-xl transition-all border ${showNotifications ? 'bg-lime-400 text-slate-950 border-lime-400' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                        <h4 className="font-black uppercase tracking-widest text-xs flex items-center gap-2">
                          <Bell className="w-4 h-4 text-lime-400" />
                          Notifications
                        </h4>
                        <button 
                          onClick={markAllAsRead}
                          className="text-[10px] font-black text-lime-400 uppercase tracking-widest hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-5 border-b border-slate-800 hover:bg-slate-800/30 transition-all flex gap-4 ${!n.read ? 'bg-lime-400/5' : ''}`}
                            >
                              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                n.type === 'alert' ? 'bg-red-400/10 text-red-400' : 
                                n.type === 'success' ? 'bg-lime-400/10 text-lime-400' : 
                                'bg-blue-400/10 text-blue-400'
                              }`}>
                                {n.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : 
                                 n.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
                                 <Info className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                  <h5 className={`text-xs font-black uppercase tracking-tight ${!n.read ? 'text-white' : 'text-slate-400'}`}>
                                    {n.title}
                                  </h5>
                                  <span className="text-[9px] font-bold text-slate-500 uppercase">{n.time}</span>
                                </div>
                                <p className="text-sm text-slate-400 leading-snug font-medium">{n.message}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                              <Bell className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-slate-800/50 text-center">
                        <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
                          View all history
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around items-center h-24 z-50 px-2 backdrop-blur-xl bg-slate-900/90">
        {navItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 transition-all p-2 rounded-xl ${
              activeTab === item.id ? 'text-lime-400 bg-lime-400/10' : 'text-slate-500'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-1.5'}`} />
            <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-tight">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
      <div className="h-24 lg:hidden" />
    </div>
  );
};

export default Layout;
