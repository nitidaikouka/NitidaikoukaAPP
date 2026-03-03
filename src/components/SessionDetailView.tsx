import React, { useState } from 'react';
import { useScoreModel } from '../ScoreContext';
import { Gender, Mark, Archer } from '../types';
import { ChevronLeft, ChevronRight, Trash2, SplitSquareHorizontal, Sigma, UserPlus, XCircle } from 'lucide-react';

const getMarkColorClass = (mark: Mark) => {
  switch (mark) {
    case Mark.none: return "text-transparent";
    case Mark.hit: return "text-red-500 dark:text-red-400";
    case Mark.miss: return "text-black dark:text-gray-300";
  }
};

const HistoryArcherColumn: React.FC<{ archer: Archer, sessionId: string, shotCount: number, onGuestEdit: () => void }> = ({ archer, sessionId, shotCount, onGuestEdit }) => {
  const model = useScoreModel();
  const [showMenu, setShowMenu] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (!model.isAdminMode) return;
    e.dataTransfer.setData('text/plain', archer.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!model.isAdminMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!model.isAdminMode) return;
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== archer.id) {
      model.moveHistoryArcher(sessionId, sourceId, archer.id);
    }
  };

  const sortedMembers = [...model.members].sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    if (a.gender !== b.gender) {
      if (a.gender === Gender.male) return -1;
      if (b.gender === Gender.male) return 1;
      return 0;
    }
    return a.name.localeCompare(b.name, 'ja');
  });

  if (archer.isSeparator) {
    return (
      <div
        className="flex flex-col w-8 flex-shrink-0"
        draggable={model.isAdminMode}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="h-10 w-full bg-gray-100 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700"></div>
        {Array.from({ length: shotCount }).map((_, i) => {
          const index = shotCount - 1 - i;
          const isSeparatorBorder = index % 4 === 0 && index !== 0;
          return (
            <div key={i} className={`h-10 w-full bg-gray-100 dark:bg-slate-800 ${isSeparatorBorder ? 'border-b-2 border-black dark:border-slate-600' : 'border-b border-gray-300 dark:border-slate-700'}`}></div>
          );
        })}
        <div className="h-20 w-full bg-gray-100 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-700 flex items-end justify-center pb-1">
          {model.isAdminMode && (
            <button onClick={() => model.deleteArcherFromSession(sessionId, archer.id)} className="text-red-500">
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (archer.isTotalCalculator) {
    const groupArchers = model.getHistoryGroupArchers(sessionId, archer.id);
    const grandTotal = groupArchers.reduce((sum, a) => sum + a.marks.filter(m => m === Mark.hit).length, 0);

    return (
      <div
        className="flex flex-col border-r border-gray-300 w-12 flex-shrink-0"
        draggable={model.isAdminMode}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="h-10 w-full bg-blue-500 dark:bg-blue-600 border-b border-black dark:border-slate-700 flex items-center justify-center text-white font-bold text-lg">
          {grandTotal}
        </div>
        {Array.from({ length: shotCount }).map((_, i) => {
          const index = shotCount - 1 - i;
          const isSeparator = index % 4 === 0 && index !== 0;
          const isBlockBottom = index % 4 === 0;

          let blockTotal = null;
          if (isBlockBottom) {
            blockTotal = groupArchers.reduce((sum, a) => {
              let hitsInBlock = 0;
              for (let offset = 0; offset < 4; offset++) {
                const targetIndex = index + offset;
                if (targetIndex < a.marks.length && a.marks[targetIndex] === Mark.hit) {
                  hitsInBlock++;
                }
              }
              return sum + hitsInBlock;
            }, 0);
          }

          return (
            <div key={index} className={`h-10 w-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xl font-bold border-b ${isSeparator ? 'border-b-2 border-black dark:border-slate-700' : 'border-gray-300 dark:border-slate-800'} text-blue-500 dark:text-blue-400 transition-colors`}>
              {blockTotal !== null ? blockTotal : ""}
            </div>
          );
        })}
        <div className="h-20 w-full bg-gray-100 dark:bg-slate-800 border-b border-black dark:border-slate-700 flex flex-col items-center justify-center transition-colors">
          <span className="text-blue-600 font-bold text-sm">計</span>
          {model.isAdminMode && (
            <button onClick={() => model.deleteArcherFromSession(sessionId, archer.id)} className="text-red-500 mt-1">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  const totalHits = archer.marks.filter(m => m === Mark.hit).length;
  const displayName = model.getDisplayName(archer.name);

  return (
    <div
      className="flex flex-col border-r border-gray-300 relative w-12 flex-shrink-0"
      draggable={model.isAdminMode}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="h-10 w-full bg-yellow-50 dark:bg-yellow-900/40 border-b border-black dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg transition-colors">
        {totalHits}
      </div>
      {Array.from({ length: shotCount }).map((_, i) => {
        const index = shotCount - 1 - i;
        const mark = archer.marks[index] || Mark.none;
        const isSeparator = index % 4 === 0 && index !== 0;

        return (
          <button
            key={index}
            disabled={!model.isAdminMode}
            onClick={() => model.toggleHistoryMark(sessionId, archer.id, index)}
            className={`h-10 w-full bg-white dark:bg-slate-900 flex items-center justify-center text-xl font-bold border-b ${isSeparator ? 'border-b-2 border-black dark:border-slate-700' : 'border-gray-300 dark:border-slate-800'} ${getMarkColorClass(mark)} transition-colors`}
          >
            {mark || "　"}
          </button>
        );
      })}

      <button
        disabled={!model.isAdminMode}
        onClick={() => setShowMenu(!showMenu)}
        className="h-20 w-full bg-gray-100 dark:bg-slate-800 border-b border-black dark:border-slate-700 flex flex-col items-center justify-center p-1 relative transition-colors"
      >
        <span className={`text-xs font-medium text-center leading-tight ${!archer.name ? 'text-gray-400 dark:text-gray-500' : 'text-black dark:text-gray-100'}`} style={{ writingMode: 'vertical-rl' }}>
          {archer.name ? displayName : "選択"}
        </span>
        {archer.isGuest && <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">ゲ</span>}
      </button>

      {showMenu && model.isAdminMode && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
          <div className="absolute bottom-20 left-0 w-48 bg-white shadow-xl rounded-md border border-gray-200 z-50 max-h-64 overflow-y-auto">
            <div className="p-2">
              {sortedMembers.map(m => (
                <button
                  key={m.id}
                  className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                  onClick={() => {
                    model.updateHistoryArcherInfo(sessionId, archer.id, m.name, m.gender, m.grade, false);
                    setShowMenu(false);
                  }}
                >
                  {m.name} <span className="text-gray-500 text-xs">({m.grade}年)</span>
                </button>
              ))}
              <hr className="my-1" />
              <button
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => {
                  onGuestEdit();
                  setShowMenu(false);
                }}
              >
                ゲスト
              </button>
              <hr className="my-1" />
              <button
                className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                onClick={() => {
                  model.deleteArcherFromSession(sessionId, archer.id);
                  setShowMenu(false);
                }}
              >
                削除
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function SessionDetailView({ sessionId, onBack }: { sessionId: string, onBack: () => void }) {
  const model = useScoreModel();
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const [showGuestAlert, setShowGuestAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState("");
  const [editingArcherId, setEditingArcherId] = useState<string | null>(null);

  const sortedSessions = [...model.sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const currentIndex = sortedSessions.findIndex(s => s.id === currentSessionId);
  const activeSession = sortedSessions[currentIndex];

  if (!activeSession) {
    onBack();
    return null;
  }

  const switchSession = (offset: number) => {
    const newIndex = currentIndex + offset;
    if (newIndex >= 0 && newIndex < sortedSessions.length) {
      setCurrentSessionId(sortedSessions[newIndex].id);
    }
  };

  const dateStr = new Date(activeSession.date).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 absolute inset-0 z-20 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-slate-900 border-b dark:border-slate-800 transition-colors">
        <button onClick={onBack} className="text-blue-500 dark:text-blue-400 px-2 py-1">戻る</button>
        <div className="flex items-center gap-4">
          <button disabled={currentIndex === sortedSessions.length - 1} onClick={() => switchSession(1)} className="p-2 text-gray-600 dark:text-gray-400 disabled:opacity-30">
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-bold dark:text-gray-100">{dateStr}</h2>
          <button disabled={currentIndex === 0} onClick={() => switchSession(-1)} className="p-2 text-gray-600 dark:text-gray-400 disabled:opacity-30">
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="w-10"></div>
      </div>

      {!model.isAdminMode && activeSession.note && (
        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 text-sm border-b dark:border-orange-900/30 text-gray-800 dark:text-gray-200 transition-colors">
          <span className="font-bold text-orange-600 dark:text-orange-400">📝 メモ:</span> {activeSession.note}
        </div>
      )}

      {model.isAdminMode && (
        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border-b dark:border-orange-900/30 space-y-2 text-sm transition-colors">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 dark:text-gray-300">矢数:</span>
            <select
              value={activeSession.shotCount}
              onChange={e => model.updateSessionShotCount(activeSession.id, parseInt(e.target.value))}
              className="bg-white dark:bg-slate-900 dark:text-gray-100 border dark:border-slate-700 rounded px-2 py-1 outline-none"
            >
              {[2, 4, 8, 12, 16, 20].map(n => <option key={n} value={n} className="dark:bg-slate-900">{n}本</option>)}
            </select>
          </div>
          <input
            type="text"
            value={activeSession.note || ""}
            onChange={e => model.updateSessionNote(activeSession.id, e.target.value)}
            placeholder="メモ (天気など)"
            className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 rounded px-2 py-1 dark:text-gray-100 outline-none focus:ring-1 focus:ring-orange-200 dark:focus:ring-orange-900/30"
          />
        </div>
      )}

      {/* Grid Area */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-slate-950 transition-colors">
        <div className="flex flex-row-reverse w-max min-w-full justify-start">

          {/* Header Column */}
          <div className="flex flex-col border-l border-black dark:border-slate-700 w-8 flex-shrink-0">
            <div className="h-10 w-8 flex items-center justify-center bg-gray-200 dark:bg-slate-700 border-b border-black dark:border-slate-600 text-xs font-bold dark:text-gray-100 transition-colors">計</div>
            {Array.from({ length: activeSession.shotCount }).map((_, i) => {
              const shotNum = activeSession.shotCount - i;
              const isSeparator = (shotNum - 1) % 4 === 0 && shotNum !== 1;
              return (
                <div key={shotNum} className={`h-10 w-8 flex items-center justify-center bg-gray-100 dark:bg-slate-800 border-b ${isSeparator ? 'border-b-2 border-black dark:border-slate-600' : 'border-gray-300 dark:border-slate-700'} text-xs dark:text-gray-400 transition-colors`}>
                  {shotNum}
                </div>
              );
            })}
            <div className="h-20 w-8 flex items-center justify-center bg-gray-200 dark:bg-slate-700 border-b border-black dark:border-slate-600 text-xs dark:text-gray-100 transition-colors">名</div>
          </div>

          {/* Archers */}
          {activeSession.archers.map(archer => (
            <HistoryArcherColumn
              key={archer.id}
              archer={archer}
              sessionId={activeSession.id}
              shotCount={activeSession.shotCount}
              onGuestEdit={() => {
                setEditingArcherId(archer.id);
                setGuestNameInput("");
                setShowGuestAlert(true);
              }}
            />
          ))}

          {/* Left Border */}
          <div className="w-px bg-black dark:bg-slate-700"></div>
        </div>
      </div>

      {model.isAdminMode && (
        <div className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 p-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] dark:shadow-none safe-area-bottom transition-colors">
          <div className="flex justify-center gap-3 mb-4">
            <button onClick={() => model.addSeparatorToSession(activeSession.id)} className="flex-1 flex flex-col items-center justify-center gap-1 text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 py-2 rounded-xl border border-orange-100 dark:border-orange-900/30 active:bg-orange-100 dark:active:bg-orange-900/40 transition-colors">
              <SplitSquareHorizontal size={22} />
              <span className="text-[10px] font-bold">間隔</span>
            </button>
            <button onClick={() => model.addTotalToSession(activeSession.id)} className="flex-1 flex flex-col items-center justify-center gap-1 text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-xl border border-blue-100 dark:border-blue-900/40 active:bg-blue-100 dark:active:bg-blue-900/40 transition-colors">
              <Sigma size={22} />
              <span className="text-[10px] font-bold">計追加</span>
            </button>
            <button onClick={() => model.addArcherToSession(activeSession.id)} className="flex-1 flex flex-col items-center justify-center gap-1 text-white bg-blue-600 dark:bg-blue-500 py-2 rounded-xl shadow-sm active:bg-blue-700 dark:active:bg-blue-600 transition-colors">
              <UserPlus size={22} />
              <span className="text-[10px] font-bold">射手</span>
            </button>
          </div>
          <button
            onClick={() => setShowDeleteAlert(true)}
            className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold border border-red-100 dark:border-red-900/30 active:bg-red-100 dark:active:bg-red-900/40 transition-colors"
          >
            <Trash2 size={18} /> この記録を完全に削除
          </button>
        </div>
      )}

      {showDeleteAlert && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteAlert(false)}>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-2 dark:text-gray-100">記録の削除</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">この記録を完全に削除しますか？この操作は取り消せません。</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteAlert(false)} className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">キャンセル</button>
              <button
                onClick={() => {
                  onBack();
                  setTimeout(() => model.deleteSession(activeSession.id), 0);
                  setShowDeleteAlert(false);
                }}
                className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white rounded shadow-sm"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {showGuestAlert && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowGuestAlert(false)}>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-2 dark:text-gray-100">ゲスト名を入力</h3>
            <input
              type="text"
              value={guestNameInput}
              onChange={e => setGuestNameInput(e.target.value)}
              className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2 rounded mb-4 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 dark:text-gray-100"
              placeholder="名前"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowGuestAlert(false)} className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">キャンセル</button>
              <button
                onClick={() => {
                  if (editingArcherId) {
                    model.updateHistoryArcherInfo(activeSession.id, editingArcherId, guestNameInput || "ゲスト", Gender.unknown, 0, true);
                  }
                  setShowGuestAlert(false);
                }}
                className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded shadow-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
