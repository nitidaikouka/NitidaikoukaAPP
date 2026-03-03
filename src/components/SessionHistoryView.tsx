import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useScoreModel } from '../ScoreContext';
import { ChevronDown, ChevronLeft, ChevronRight, FileText, Trash2, RotateCcw, XCircle, CheckCircle2, CloudUpload, CloudOff, Archive, ArchiveRestore } from 'lucide-react';

export default function SessionHistoryView({ onSelectSession }: { onSelectSession: (id: string) => void }) {
  const model = useScoreModel();
  const [showTrash, setShowTrash] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const availableYears = Array.from(new Set<number>(model.sessions.map(s => {
    const d = new Date(s.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return month >= 4 ? year : year - 1;
  }))).sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState<number | null>(availableYears[0] || null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

    const matchesPeriod = fYear === selectedYear && m === selectedMonth;
    const q = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" ||
      s.archers.some(a => a.name.toLowerCase().includes(q)) ||
      (s.note && s.note.toLowerCase().includes(q)) ||
      (s.tags && s.tags.some(t => t.toLowerCase().includes(q)));
    const matchesArchive = showArchived ? s.isArchived : !s.isArchived;

    return matchesPeriod && matchesSearch && matchesArchive;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleMonthTap = (month: number) => {
    setSelectedMonth(month);
    setSecretTapCount(prev => prev + 1);
  };

  if (model.sessions.length === 0 && model.trash.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-950 transition-colors">
        <p>履歴がありません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 transition-colors">
        <h2 className="font-bold text-lg dark:text-gray-100">{showTrash ? "ゴミ箱" : showArchived ? "アーカイブ" : "過去の記録表"}</h2>
        <div className="flex items-center gap-2">
          {!showTrash && (
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`p-2 rounded-full transition-colors ${showArchived ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
              title={showArchived ? "履歴に戻る" : "アーカイブを表示"}
            >
              {showArchived ? <ArchiveRestore size={20} /> : <Archive size={20} />}
            </button>
          )}
          {!showTrash && (
            <button onClick={() => setShowTrash(true)} className="text-gray-500 dark:text-gray-400 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Trash2 size={20} />
            </button>
          )}
          {showTrash && (
            <button onClick={() => setShowTrash(false)} className="text-blue-500 dark:text-blue-400 font-bold text-sm">
              戻る
            </button>
          )}
          {model.isAdminMode && !showTrash && (
            <button
              onClick={() => model.setIsAdminMode(false)}
              className="text-xs font-bold text-white bg-red-500 dark:bg-red-600 px-2 py-1 rounded shadow-sm"
            >
              編集モード中
            </button>
          )}
        </div>
      </div>

      {showTrash ? (
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950 transition-colors">
          {model.trash.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
              <Trash2 size={48} className="mb-2 opacity-20" />
              <p>ゴミ箱は空です</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
              <AnimatePresence mode="popLayout">
                {model.trash.map(session => (
                  <motion.li
                    key={session.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-gray-500 dark:text-gray-400">{new Date(session.date).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => model.restoreSession(session.id)}
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded border border-blue-100 dark:border-blue-900/40"
                        >
                          <RotateCcw size={14} /> 復元
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("完全に削除しますか？この操作は取り消せません。")) model.permanentlyDeleteSession(session.id);
                          }}
                          className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded border border-red-100 dark:border-red-900/40"
                        >
                          <XCircle size={14} /> 削除
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 flex gap-2">
                      <span>矢数: {session.shotCount}本</span>
                      {session.note && <span>メモ: {session.note}</span>}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      ) : (
        <>
          <div className="p-4 bg-white dark:bg-slate-900 shadow-sm z-10 space-y-4 transition-colors">
            <div className="flex items-center gap-3">
              <select
                value={selectedYear || ""}
                onChange={e => {
                  const y = parseInt(e.target.value);
                  setSelectedYear(y);
                  const m = getAvailableMonths(y);
                  if (m.length > 0) setSelectedMonth(m[0]);
                }}
                className="font-bold text-base bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border-none outline-none appearance-none text-blue-700 dark:text-blue-400"
              >
                {availableYears.map(y => <option key={y} value={y} className="dark:bg-slate-800 dark:text-gray-100">{y}年度</option>)}
              </select>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="部員名で検索..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all dark:text-gray-200"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <ChevronDown size={14} className="rotate-90" />
                </span>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
              {months.map(m => (
                <button
                  key={m}
                  onClick={() => handleMonthTap(m)}
                  className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${selectedMonth === m ? 'bg-blue-600 dark:bg-blue-500 text-white font-bold shadow-md dark:shadow-none' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                >
                  {m}月
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950 transition-colors">
            <ul className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
              <AnimatePresence mode="popLayout">
                {filteredSessions.map(session => {
                  const date = new Date(session.date);
                  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
                  const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} (${weekdays[date.getDay()]})`;
                  const realArchers = session.archers.filter(a => !a.isSeparator && !a.isTotalCalculator && a.name);
                  const archerCount = realArchers.length;
                  const totalHits = realArchers.reduce((sum, a) => sum + a.marks.slice(0, session.shotCount).filter((m: any) => m === 'hit').length, 0);
                  const totalShots = realArchers.reduce((sum, a) => sum + a.marks.slice(0, session.shotCount).filter((m: any) => m !== 'none').length, 0);
                  const hitRate = totalShots > 0 ? (totalHits / totalShots * 100).toFixed(0) : null;

                  return (
                    <motion.li
                      key={session.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer active:bg-gray-100 dark:active:bg-slate-800 transition-colors"
                      onClick={() => onSelectSession(session.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg dark:text-gray-100">{dateStr}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>矢数: {session.shotCount}本</span>
                            {session.note && <FileText size={14} className="text-orange-500 dark:text-orange-400" />}
                            {(!session.syncStatus || session.syncStatus === 'synced') && <CheckCircle2 size={14} className="text-green-500 dark:text-green-400" />}
                            {session.syncStatus === 'pending' && <CloudUpload size={14} className="text-blue-500 dark:text-blue-400 animate-pulse" />}
                            {session.syncStatus === 'error' && <CloudOff size={14} className="text-red-500 dark:text-red-400" />}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">的中率 {hitRate}%</span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">{archerCount}名 / {totalHits}中</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                          </div>
                          {model.isAdminMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (session.isArchived) model.unarchiveSession(session.id);
                                else model.archiveSession(session.id);
                              }}
                              className={`p-1.5 rounded-lg border transition-colors ${session.isArchived ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/40' : 'text-gray-400 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:text-orange-500 hover:bg-orange-50'}`}
                              title={session.isArchived ? "履歴に戻す" : "アーカイブに移動"}
                            >
                              {session.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
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
