import React, { useState } from 'react';
import { useScoreModel } from '../ScoreContext';
import { ChevronDown, ChevronLeft, ChevronRight, FileText, Trash2, RotateCcw, XCircle, CheckCircle2, CloudUpload, CloudOff } from 'lucide-react';

export default function SessionHistoryView({ onSelectSession }: { onSelectSession: (id: string) => void }) {
  const model = useScoreModel();
  const [showTrash, setShowTrash] = useState(false);
  
  const availableYears = Array.from(new Set<number>(model.sessions.map(s => {
    const d = new Date(s.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return month >= 4 ? year : year - 1;
  }))).sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<number | null>(availableYears[0] || null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [secretTapCount, setSecretTapCount] = useState(0);

  const getAvailableMonths = (year: number) => {
    const filtered = model.sessions.filter(s => {
      const d = new Date(s.date);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      return (m >= 4 ? y : y - 1) === year;
    });
    const months = Array.from(new Set<number>(filtered.map(s => new Date(s.date).getMonth() + 1)));
    return months.sort((m1, m2) => {
      const order1 = m1 < 4 ? m1 + 12 : m1;
      const order2 = m2 < 4 ? m2 + 12 : m2;
      return order2 - order1;
    });
  };

  const months = selectedYear ? getAvailableMonths(selectedYear) : [];
  if (selectedMonth === null && months.length > 0) {
    setSelectedMonth(months[0]);
  }

  const filteredSessions = model.sessions.filter(s => {
    const d = new Date(s.date);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const fYear = m >= 4 ? y : y - 1;
    return fYear === selectedYear && m === selectedMonth;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleMonthTap = (month: number) => {
    setSelectedMonth(month);
    setSecretTapCount(prev => prev + 1);
  };

  if (model.sessions.length === 0 && model.trash.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>履歴がありません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h2 className="font-bold text-lg">{showTrash ? "ゴミ箱" : "過去の記録表"}</h2>
        <div className="flex items-center gap-2">
          {!showTrash && (
            <button onClick={() => setShowTrash(true)} className="text-gray-500 p-2 hover:bg-gray-100 rounded-full">
              <Trash2 size={20} />
            </button>
          )}
          {showTrash && (
            <button onClick={() => setShowTrash(false)} className="text-blue-500 font-bold text-sm">
              戻る
            </button>
          )}
          {model.isAdminMode && !showTrash && (
            <button 
              onClick={() => model.setIsAdminMode(false)}
              className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded"
            >
              編集モード中
            </button>
          )}
        </div>
      </div>

      {showTrash ? (
        <div className="flex-1 overflow-auto bg-gray-50">
           {model.trash.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <Trash2 size={48} className="mb-2 opacity-20" />
               <p>ゴミ箱は空です</p>
             </div>
           ) : (
             <ul className="divide-y divide-gray-200 bg-white">
               {model.trash.map(session => (
                 <li key={session.id} className="p-4">
                   <div className="flex justify-between items-center mb-2">
                     <h3 className="font-bold text-gray-500">{new Date(session.date).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}</h3>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => model.restoreSession(session.id)}
                         className="flex items-center gap-1 text-blue-600 text-xs bg-blue-50 px-3 py-1.5 rounded border border-blue-100"
                       >
                         <RotateCcw size={14} /> 復元
                       </button>
                       <button 
                         onClick={() => {
                           if(confirm("完全に削除しますか？この操作は取り消せません。")) model.permanentlyDeleteSession(session.id);
                         }}
                         className="flex items-center gap-1 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded border border-red-100"
                       >
                         <XCircle size={14} /> 削除
                       </button>
                     </div>
                   </div>
                   <div className="text-xs text-gray-400 flex gap-2">
                     <span>矢数: {session.shotCount}本</span>
                     {session.note && <span>メモ: {session.note}</span>}
                   </div>
                 </li>
               ))}
             </ul>
           )}
        </div>
      ) : (
        <>
          <div className="p-4 bg-white shadow-sm z-10">
            <div className="flex justify-center mb-4">
              <select 
                value={selectedYear || ""} 
                onChange={e => {
                  const y = parseInt(e.target.value);
                  setSelectedYear(y);
                  const m = getAvailableMonths(y);
                  if (m.length > 0) setSelectedMonth(m[0]);
                }}
                onClick={() => {
                  if (secretTapCount >= 5) {
                    model.setIsAdminMode(true);
                    setSecretTapCount(0);
                    alert("編集モードに入りました");
                  } else {
                    setSecretTapCount(0);
                  }
                }}
                className="font-bold text-lg bg-blue-50 px-4 py-2 rounded-lg border-none outline-none appearance-none text-center"
              >
                {availableYears.map(y => <option key={y} value={y}>{y}年度</option>)}
              </select>
            </div>

            <div className="flex overflow-x-auto gap-2 pb-2">
              {months.map(m => (
                <button
                  key={m}
                  onClick={() => handleMonthTap(m)}
                  className={`px-4 py-1.5 rounded-full whitespace-nowrap ${selectedMonth === m ? 'bg-blue-500 text-white font-bold' : 'bg-gray-200 text-gray-700'}`}
                >
                  {m}月
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <ul className="divide-y divide-gray-200 bg-white">
              {filteredSessions.map(session => {
                const date = new Date(session.date);
                const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                const archerCount = session.archers.filter(a => !a.isSeparator && !a.isTotalCalculator).length;
                
                return (
                  <li key={session.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => onSelectSession(session.id)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{dateStr}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>矢数: {session.shotCount}本</span>
                          {session.note && <FileText size={14} className="text-orange-500" />}
                          {(!session.syncStatus || session.syncStatus === 'synced') && <CheckCircle2 size={14} className="text-green-500" />}
                          {session.syncStatus === 'pending' && <CloudUpload size={14} className="text-blue-500 animate-pulse" />}
                          {session.syncStatus === 'error' && <CloudOff size={14} className="text-red-500" />}
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium">
                        {archerCount}人
                      </div>
                    </div>
                  </li>
                );
              })}
              {filteredSessions.length === 0 && (
                <li className="p-8 text-center text-gray-500">データがありません</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
