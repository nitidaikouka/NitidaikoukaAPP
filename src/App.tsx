import React, { useState } from 'react';
import { ScoreProvider } from './ScoreContext';
import { useScoreModel } from './ScoreContext';
import { UserRole } from './types';

import RecordView from './components/RecordView';
import SessionHistoryView from './components/SessionHistoryView';
import SessionDetailView from './components/SessionDetailView';
import AnalysisView from './components/AnalysisView';
import DashboardView from './components/DashboardView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import PersonalRecordView from './components/PersonalRecordView';
import ReportingView from './components/ReportingView';
import AttendanceView from './components/AttendanceView';
import AnnouncementView from './components/AnnouncementView';
import TutorialOverlay from './components/TutorialOverlay';
import QuickActionWidget from './components/QuickActionWidget';
import NotificationOverlay from './components/NotificationOverlay';
import AuditLogView from './components/AuditLogView';

import { ClipboardEdit, History, BarChart, Settings, Target, LayoutDashboard, FileText, CalendarCheck, Megaphone, ShieldCheck } from 'lucide-react';
import { feedback } from './feedback';

function MainApp() {
  const { currentUser, members } = useScoreModel();
  const [activeTab, setActiveTab] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  if (!currentUser) {
    return <LoginView />;
  }

  const isAdmin = currentUser.role === UserRole.admin;

  // Set default tab based on role
  const defaultTab = isAdmin ? 'dashboard' : 'personal';
  const effectiveTab = activeTab || defaultTab;

  // Find linked member for member mode
  const linkedMember = currentUser.memberId
    ? members.find(m => m.id === currentUser.memberId)
    : null;
  const memberName = linkedMember?.name ?? currentUser.id;

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-slate-950 relative transition-colors duration-300">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-gray-50/30 dark:bg-slate-900/50">
        {/* Admin-only tabs */}
        {isAdmin && effectiveTab === 'record' && <RecordView />}
        {isAdmin && effectiveTab === 'history' && (
          <>
            <SessionHistoryView onSelectSession={(id) => setSelectedSessionId(id)} />
            {selectedSessionId && (
              <SessionDetailView sessionId={selectedSessionId} onBack={() => setSelectedSessionId(null)} />
            )}
          </>
        )}
        {isAdmin && effectiveTab === 'dashboard' && <DashboardView />}
        {isAdmin && effectiveTab === 'attendance' && <AttendanceView />}
        {isAdmin && effectiveTab === 'report' && <ReportingView />}
        {isAdmin && effectiveTab === 'audit-logs' && <AuditLogView />}
        {effectiveTab === 'analysis' && <AnalysisView />}
        {effectiveTab === 'announcements' && <AnnouncementView />}

        {/* Member-only tab */}
        {!isAdmin && effectiveTab === 'personal' && (
          <PersonalRecordView memberName={memberName} />
        )}

        {/* Shared tabs */}
        {effectiveTab === 'settings' && <SettingsView />}
      </div>

      {/* Bottom Tab Bar (Premium Glassmorphism) */}
      <div className="flex items-center justify-around bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-800/50 pt-2 pb-6 px-4 shadow-[0_-10px_25px_rgba(0,0,0,0.03)] dark:shadow-[0_-10px_25px_rgba(0,0,0,0.2)] z-40 safe-area-bottom transition-colors duration-300">
        {isAdmin ? (
          <>
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'ホーム' },
              { id: 'record', icon: ClipboardEdit, label: '記録' },
              { id: 'attendance', icon: CalendarCheck, label: '出席' },
              { id: 'announcements', icon: Megaphone, label: '掲示板' },
              { id: 'history', icon: History, label: '履歴', onClick: () => setSelectedSessionId(null) },
              { id: 'analysis', icon: BarChart, label: '分析' },
              { id: 'report', icon: FileText, label: '報告' },
              { id: 'audit-logs', icon: ShieldCheck, label: '監査ログ' },
              { id: 'settings', icon: Settings, label: '設定' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); item.onClick?.(); feedback.vibrate(5); }}
                className={`relative flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 ${effectiveTab === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 opacity-60 hover:opacity-100'}`}
              >
                {effectiveTab === item.id && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 background-blue-600 bg-blue-600 dark:bg-blue-400 rounded-full animate-in fade-in zoom-in duration-300 shadow-[0_4px_10px_rgba(37,99,235,0.3)]"></div>
                )}
                <item.icon size={26} strokeWidth={effectiveTab === item.id ? 2.5 : 2} className={`transition-transform duration-300 ${effectiveTab === item.id ? 'scale-110' : 'scale-100'}`} />
                <span className={`text-[10px] mt-1.5 font-black tracking-tight ${effectiveTab === item.id ? 'opacity-100' : 'opacity-80 font-medium'}`}>{item.label}</span>
              </button>
            ))}
          </>
        ) : (
          <>
            {[
              { id: 'personal', icon: Target, label: 'マイ記録' },
              { id: 'announcements', icon: Megaphone, label: '掲示板' },
              { id: 'analysis', icon: BarChart, label: '全員の分析' },
              { id: 'settings', icon: Settings, label: '設定' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 ${effectiveTab === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 opacity-60 hover:opacity-100'}`}
              >
                {effectiveTab === item.id && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 background-blue-600 bg-blue-600 dark:bg-blue-400 rounded-full animate-in fade-in zoom-in duration-300 shadow-[0_4px_10px_rgba(37,99,235,0.3)]"></div>
                )}
                <item.icon size={26} strokeWidth={effectiveTab === item.id ? 2.5 : 2} className={`transition-transform duration-300 ${effectiveTab === item.id ? 'scale-110' : 'scale-100'}`} />
                <span className={`text-[10px] mt-1.5 font-black tracking-tight ${effectiveTab === item.id ? 'opacity-100' : 'opacity-80 font-medium'}`}>{item.label}</span>
              </button>
            ))}
          </>
        )}
      </div>

      <QuickActionWidget onNavigate={(id) => setActiveTab(id)} />
      <NotificationOverlay />

      <TutorialOverlay />
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
