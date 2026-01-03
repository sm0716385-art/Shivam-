
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CropAdvisor from './components/CropAdvisor';
import PestDoctor from './components/PestDoctor';
import KisanChat from './components/KisanChat';
import LiveAssistant from './components/LiveAssistant';
import MarketIntelligence from './components/MarketIntelligence';
import { Language } from './types';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.ENGLISH);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard lang={lang} />;
      case 'advisor': return <CropAdvisor lang={lang} />;
      case 'pest': return <PestDoctor lang={lang} />;
      case 'chat': return <KisanChat lang={lang} />;
      case 'live': return <LiveAssistant lang={lang} />;
      case 'market': return <MarketIntelligence lang={lang} />;
      default: return <Dashboard lang={lang} />;
    }
  };

  return (
    <Layout 
      lang={lang} 
      setLang={setLang} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
