import React, { useState } from 'react';
import { ScoreProvider } from './ScoreContext';
import RecordView from './components/RecordView';
import SessionHistoryView from './components/SessionHistoryView';
import SessionDetailView from './components/SessionDetailView';
import AnalysisView from './components/AnalysisView';
import SettingsView from './components/SettingsView';
import { ClipboardEdit, History, BarChart, Settings } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('record');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen w-full bg-white relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'record' && <RecordView />}
          {activeTab === 'history' && (
            <>
              <SessionHistoryView onSelectSession={(id) => setSelectedSessionId(id)} />
              {selectedSessionId && (
                <SessionDetailView sessionId={selectedSessionId} onBack={() => setSelectedSessionId(null)} />
              )}
            </>
          )}
          {activeTab === 'analysis' && <AnalysisView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>

        {/* Bottom Tab Bar */}
        <div className="flex items-center justify-around bg-gray-100 border-t border-gray-200 pb-safe pt-2 px-2">
          <button 
            onClick={() => setActiveTab('record')} 
            className={`flex flex-col items-center p-2 w-16 ${activeTab === 'record' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <ClipboardEdit size={24} />
            <span className="text-[10px] mt-1 font-medium">記録</span>
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setSelectedSessionId(null); }} 
            className={`flex flex-col items-center p-2 w-16 ${activeTab === 'history' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <History size={24} />
            <span className="text-[10px] mt-1 font-medium">過去の記録表</span>
          </button>
          <button 
            onClick={() => setActiveTab('analysis')} 
            className={`flex flex-col items-center p-2 w-16 ${activeTab === 'analysis' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <BarChart size={24} />
            <span className="text-[10px] mt-1 font-medium">分析</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex flex-col items-center p-2 w-16 ${activeTab === 'settings' ? 'text-blue-500' : 'text-gray-500'}`}
          >
            <Settings size={24} />
            <span className="text-[10px] mt-1 font-medium">設定</span>
          </button>
        </div>
      </div>
  );
}

export default function App() {
  return (
    <ScoreProvider>
      <MainApp />
    </ScoreProvider>
  );
}
