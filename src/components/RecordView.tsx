import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useScoreModel } from '../ScoreContext';
import { Mark, Archer, Gender } from '../types';
import { Users, SplitSquareHorizontal, Sigma, UserPlus, XCircle, Trash2, Undo2, Redo2, Lock, Unlock, CheckCircle2, CloudUpload, Cloud, CloudOff, Trophy, Tag, Plus, AlertCircle } from 'lucide-react';
import MemberManagementView from './MemberManagementView';
import { sortMembers, getNextShotAdvice } from '../utils';

const getMarkColorClass = (mark: Mark) => {
  switch (mark) {
    case Mark.none: return "text-transparent";
    case Mark.hit: return "text-red-500 dark:text-red-400";
    case Mark.miss: return "text-black dark:text-gray-400";
    default: return "text-transparent";
  }
};

const ArcherCell = React.memo(({
  index,
  mark,
  isSeparator,
  isLocked,
  isActive,
  onClick
}: {
  index: number,
  mark: Mark,
  isSeparator: boolean,
  isLocked: boolean,
  isActive: boolean,
  onClick: (index: number) => void
}) => {
  return (
    <button
      onClick={() => onClick(index)}
      className={`h-10 w-full bg-white dark:bg-slate-900 flex items-center justify-center text-xl font-bold border-b ${isSeparator ? 'border-b-2 border-black dark:border-white' : 'border-gray-300 dark:border-slate-800'} ${getMarkColorClass(mark)} ${isLocked ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-800' : ''} ${isActive ? 'bg-yellow-100 dark:bg-blue-900/30 ring-2 ring-inset ring-blue-500 dark:ring-blue-400 z-10' : ''} transition-colors duration-200`}
    >
      {mark || "　"}
    </button>
  );
});

const ArcherColumn: React.FC<{
  archer: Archer,
  shotsPerRound: number,
  lockedBlocks: Record<string, boolean>,
  activeArcherId: string | null,
  activeShotIndex: number | null,
  onToggleMark: (id: string, idx: number) => void,
  onSetMark: (id: string, idx: number, m: Mark) => void,
  onDelete: (id: string) => void,
  onUpdateInfo: (id: string, name: string, gender: Gender, grade: number, isGuest: boolean) => void,
  onInsertArcher: (idx: number) => void,
  onInsertSeparator: (idx: number) => void,
  onInsertTotal: (idx: number) => void,
  onMove: (sid: string, tid: string) => void,
  onToggleLock: (id: string, bidx: number) => void,
  getDisplayName: (name: string) => string,
  getGroupArchers: (id: string) => Archer[],
  getCalculatorForArcher: (id: string) => string | null,
  sortedMembers: any[],
  advanceRecord?: (id: string, idx: number) => void,
  archerIndex: number,
  sessions: any[] // Added sessions prop
}> = React.memo(({
  archer, shotsPerRound, lockedBlocks, activeArcherId, activeShotIndex,
  onToggleMark, onSetMark, onDelete, onUpdateInfo, onInsertArcher, onInsertSeparator, onInsertTotal, onMove, onToggleLock,
  getDisplayName, getGroupArchers, getCalculatorForArcher, sortedMembers, advanceRecord, archerIndex, sessions // Destructure sessions
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [guestName, setGuestName] = useState("");

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', archer.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== archer.id) {
      onMove(sourceId, archer.id);
    }
  };

  const calculatorId = getCalculatorForArcher(archer.id);

  const handleCellClick = useCallback((index: number) => {
    const blockIndex = Math.floor(index / 4);
    if (calculatorId && lockedBlocks[`${calculatorId}-${blockIndex}`]) {
      return;
    }
    onToggleMark(archer.id, index);
    if (advanceRecord) advanceRecord(archer.id, index);
  }, [archer.id, calculatorId, lockedBlocks, onToggleMark, advanceRecord]);

  if (archer.isSeparator) {
    return (
      <div className="flex flex-col w-8 flex-shrink-0" draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}>
        <div className="h-10 w-full bg-gray-100 dark:bg-slate-950 border-b border-gray-300 dark:border-slate-800"></div>
        {Array.from({ length: shotsPerRound }).map((_, i) => {
          const index = shotsPerRound - 1 - i;
          const isBlockBottom = index % 4 === 0;
          const blockIndex = Math.floor(index / 4);
          const isLocked = lockedBlocks[`${archer.id} -${blockIndex} `];
          const isSeparatorBorder = isBlockBottom && index !== 0;
          return (
            <div key={index} className={`h-10 w-full bg-gray-100 dark:bg-slate-950 ${isSeparatorBorder ? 'border-b-2 border-black dark:border-white' : 'border-b border-gray-300 dark:border-slate-800'} flex items-center justify-center relative`}>
              {isBlockBottom && (
                <button onClick={() => onToggleLock(archer.id, blockIndex)} className="w-full h-full flex items-center justify-center">
                  {isLocked ? <Lock size={12} className="text-red-500 dark:text-red-400" /> : <Unlock size={12} className="text-gray-400 dark:text-gray-600" />}
                </button>
              )}
            </div>
          );
        })}
        <div className="h-20 w-full bg-gray-100 dark:bg-slate-950 border-b border-gray-300 dark:border-slate-800 flex items-end justify-center pb-1">
          <button onClick={() => onDelete(archer.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><XCircle size={16} /></button>
        </div>
      </div>
    );
  }

  if (archer.isTotalCalculator) {
    const groupArchers = getGroupArchers(archer.id);
    const grandTotal = groupArchers.reduce((sum, a) => sum + a.marks.filter(m => m === Mark.hit).length, 0);
    return (
      <div className="flex flex-col border-r border-gray-300 dark:border-slate-800 w-12 flex-shrink-0" draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}>
        <div className="h-10 w-full bg-blue-500 dark:bg-blue-600 border-b border-black dark:border-white flex items-center justify-center text-white font-bold text-lg">{grandTotal}</div>
        {Array.from({ length: shotsPerRound }).map((_, i) => {
          const index = shotsPerRound - 1 - i;
          const isSeparator = index % 4 === 0 && index !== 0;
          const isBlockBottom = index % 4 === 0;
          const blockIndex = Math.floor(index / 4);
          const isLocked = lockedBlocks[`${archer.id} -${blockIndex} `];
          let blockTotal = null;
          if (isBlockBottom) {
            blockTotal = groupArchers.reduce((sum, a) => {
              let hitsInBlock = 0;
              for (let offset = 0; offset < 4; offset++) {
                const targetIndex = index + offset;
                if (targetIndex < a.marks.length && a.marks[targetIndex] === Mark.hit) hitsInBlock++;
              }
              return sum + hitsInBlock;
            }, 0);
          }
          return (
            <div key={index} className={`h-10 w-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-xl font-bold border-b ${isSeparator ? 'border-b-2 border-black dark:border-white' : 'border-gray-300 dark:border-slate-800'} text-blue-500 dark:text-blue-400 relative`}>
              {blockTotal !== null ? (
                <button onClick={() => onToggleLock(archer.id, blockIndex)} className="w-full h-full flex flex-col items-center justify-center">
                  <span>{blockTotal}</span>
                  {isLocked ? <Lock size={10} className="text-red-500 dark:text-red-400 absolute bottom-0.5 right-0.5" /> : <Unlock size={10} className="text-gray-300 dark:text-gray-600 absolute bottom-0.5 right-0.5" />}
                </button>
              ) : ""}
            </div>
          );
        })}
        <div className="h-20 w-full bg-gray-100 dark:bg-slate-900 border-b border-black dark:border-white flex flex-col items-center justify-center">
          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">計</span>
          <button onClick={() => onDelete(archer.id)} className="text-red-500 dark:text-red-400 mt-1 hover:scale-110 transition-transform"><Trash2 size={14} /></button>
        </div>
      </div>
    );
  }

  const totalHits = archer.marks.filter(m => m === Mark.hit).length;
  const nameLabel = archer.name ? getDisplayName(archer.name) : "選択";

  // Find next empty index in the current 4-shot block (or overall)
  const nextEmptyIndex = archer.marks.findIndex(m => m === Mark.none);
  const advice = archer.name && nextEmptyIndex !== -1 ? getNextShotAdvice(archer.name, nextEmptyIndex % 4, sessions) : null;

  return (
    <div className="flex flex-col border-r border-gray-300 dark:border-slate-800 relative w-12 flex-shrink-0" draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}>
      {advice && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-slate-900 border-2 border-orange-500 p-2.5 rounded-2xl text-[10px] font-black text-orange-600 dark:text-orange-400 z-50 shadow-[0_10px_30px_rgba(249,115,22,0.3)] pointer-events-none animate-in fade-in slide-in-from-bottom-2 flex items-start gap-1.5">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{advice}</span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-orange-500 rotate-45"></div>
        </div>
      )}
      <div className="h-10 w-full bg-yellow-50 dark:bg-slate-900/80 border-b border-black dark:border-white flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">{totalHits}</div>
      {Array.from({ length: shotsPerRound }).map((_, i) => {
        const index = shotsPerRound - 1 - i;
        const mark = archer.marks[index];
        const isSeparator = index % 4 === 0 && index !== 0;
        const blockIndex = Math.floor(index / 4);
        const isLocked = calculatorId ? lockedBlocks[`${calculatorId}-${blockIndex}`] : false;
        const isActive = activeArcherId === archer.id && activeShotIndex === index;
        return (
          <ArcherCell key={index} index={index} mark={mark} isSeparator={isSeparator} isLocked={isLocked} isActive={isActive} onClick={handleCellClick} />
        );
      })}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="h-20 w-full bg-gray-100 dark:bg-slate-950 border-b border-black dark:border-white flex flex-col items-center justify-center p-1 relative hover:bg-gray-200 dark:hover:bg-slate-900 transition-all overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={archer.color ? { backgroundColor: archer.color } : {}}
        />
        {archer.avatarUrl && (
          <img src={archer.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover mb-1 border border-white/20 shadow-sm" />
        )}
        {!archer.avatarUrl && archer.name && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center mb-1 bg-white/50 dark:bg-white/10 text-[8px] font-black border border-white/20" style={archer.color ? { backgroundColor: archer.color, color: 'white' } : {}}>
            {archer.name[0]}
          </div>
        )}
        <span className={`text-xs font-black text-center leading-tight z-10 ${!archer.name ? 'text-gray-400 dark:text-gray-600' : 'text-slate-800 dark:text-gray-100'}`} style={{ writingMode: 'vertical-rl' }}>{nameLabel}</span>
        {archer.isGuest && <span className="text-[8px] font-black bg-gray-500 text-white px-1 py-0.5 rounded-sm mt-1 z-10">GUEST</span>}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
          <div className="absolute bottom-20 left-0 w-48 bg-white dark:bg-slate-800 shadow-xl rounded-md border border-gray-200 dark:border-slate-700 z-50 max-h-64 overflow-y-auto">
            <div className="p-2">
              {sortedMembers.map(m => (
                <button
                  key={m.id}
                  className="w-full text-left px-2 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
                  onClick={() => { onUpdateInfo(archer.id, m.name, m.gender, m.grade, false, m.color, m.avatarUrl); setShowMenu(false); }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0 overflow-hidden shadow-sm"
                    style={m.color ? { backgroundColor: m.color } : { backgroundColor: m.gender === Gender.male ? '#3b82f6' : '#ef4444' }}
                  >
                    {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" /> : m.name[0]}
                  </div>
                  <div className="flex-1 truncate">
                    <span className="font-bold">{m.name}</span>
                    <span className="text-gray-400 text-[10px] ml-1">{m.grade}年</span>
                  </div>
                </button>
              ))}
              <hr className="my-1 dark:border-slate-700" />
              <button className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded" onClick={() => { setShowGuestPrompt(true); setShowMenu(false); }}>ゲスト</button>
              <hr className="my-1" />
              <button className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded" onClick={() => { onInsertArcher(archerIndex); setShowMenu(false); }}>左に射手を追加</button>
              <button className="w-full text-left px-2 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded" onClick={() => { onInsertSeparator(archerIndex); setShowMenu(false); }}>左に間隔を追加</button>
              <button className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded" onClick={() => { onInsertTotal(archerIndex); setShowMenu(false); }}>左に計を追加</button>
              <hr className="my-1" />
              <button className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded" onClick={() => { onDelete(archer.id); setShowMenu(false); }}>削除</button>
            </div>
          </div>
        </>
      )}

      {showGuestPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 dark:text-gray-100">ゲスト名を入力</h3>
            <input
              type="text"
              autoFocus
              className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 dark:text-gray-100 outline-none"
              placeholder="例: ゲストA"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && guestName.trim() && (onUpdateInfo(archer.id, guestName.trim(), Gender.unknown, 0, true), setShowGuestPrompt(false), setGuestName(""))}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowGuestPrompt(false)}
                className="flex-1 py-3 text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => { if (guestName.trim()) { onUpdateInfo(archer.id, guestName.trim(), Gender.unknown, 0, true); setShowGuestPrompt(false); setGuestName(""); } }}
                disabled={!guestName.trim()}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default function RecordView() {
  const model = useScoreModel();
  const [showMemberSheet, setShowMemberSheet] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false); // Renamed from showResetAlert
  const [sessionNote, setSessionNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // New state for tags
  const [newTag, setNewTag] = useState(""); // New state for custom tag input

  const presetTags = ["大会", "審査", "遠的", "合同練習", "夏合宿", "春合宿"]; // Preset tags
  const [showArrowAlert, setShowArrowAlert] = useState(false);
  const [customArrow, setCustomArrow] = useState("");
  const [isCompetitionMode, setIsCompetitionMode] = useState(false);
  const [activeArcherId, setActiveArcherId] = useState<string | null>(null);
  const [activeShotIndex, setActiveShotIndex] = useState<number | null>(null);

  const advanceToNext = useCallback((currentArcherId: string, currentShotIndex: number) => {
    if (!isCompetitionMode) return;
    const validArchers = model.archers.filter(a => !a.isSeparator && !a.isTotalCalculator && a.name);
    const currIdx = validArchers.findIndex(a => a.id === currentArcherId);
    if (currIdx === -1) return;
    if (currIdx < validArchers.length - 1) {
      setActiveArcherId(validArchers[currIdx + 1].id);
      setActiveShotIndex(currentShotIndex);
    } else {
      if (currentShotIndex > 0) {
        setActiveArcherId(validArchers[0].id);
        setActiveShotIndex(currentShotIndex - 1);
      } else {
        setActiveArcherId(null);
        setActiveShotIndex(null);
      }
    }
  }, [isCompetitionMode, model.archers]);

  const sortedMembers = useMemo(() => sortMembers(model.members), [model.members]);

  const handleSave = () => {
    model.saveSessionAndReset(sessionNote, selectedTags);
    setShowSaveDialog(false);
    setSessionNote("");
    setSelectedTags([]);
    // Assuming feedback.vibrate exists and is imported/defined elsewhere
    // feedback.vibrate(10);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    // Assuming feedback.vibrate exists and is imported/defined elsewhere
    // feedback.vibrate(5);
  };

  const addNewTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag("");
      // Assuming feedback.vibrate exists and is imported/defined elsewhere
      // feedback.vibrate(5);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center p-2 border-b dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-lg dark:text-gray-100">日本大学工科記録アプリ</h1>
          <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
            {model.syncStatus === 'synced' && <><CheckCircle2 size={12} className="text-green-500" /> 送信済み</>}
            {model.syncStatus === 'syncing' && <><CloudUpload size={12} className="text-blue-500 animate-pulse" /> 送信中</>}
            {model.syncStatus === 'pending' && <><Cloud size={12} className="text-gray-400" /> 送信待機</>}
            {model.syncStatus === 'error' && <><CloudOff size={12} className="text-red-500" /> エラー</>}
            {model.syncStatus === 'offline' && <><CloudOff size={12} className="text-gray-400" /> オフライン（保存済み）</>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextVal = !isCompetitionMode;
              setIsCompetitionMode(nextVal);
              if (nextVal) {
                const first = model.archers.find(a => !a.isSeparator && !a.isTotalCalculator && a.name);
                if (first) {
                  setActiveArcherId(first.id);
                  setActiveShotIndex(model.shotsPerRound - 1);
                }
              } else {
                setActiveArcherId(null);
                setActiveShotIndex(null);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${isCompetitionMode ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700'}`}
          >
            <Trophy size={14} />
            {isCompetitionMode ? '試合中' : '試合モード'}
          </button>
          <button onClick={() => setShowArrowAlert(true)} className="flex items-center gap-1 text-xs bg-gray-200 dark:bg-slate-800 px-3 py-1.5 rounded-full font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors">
            <span>{model.shotsPerRound}本</span>
          </button>
        </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-row-reverse w-max min-w-full justify-start">
          {/* Header Column */}
          <div className="w-8 flex-shrink-0 border-r border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors">
            <div className="h-10 border-b border-gray-300 dark:border-slate-800"></div>
            {Array.from({ length: model.shotsPerRound }).map((_, i) => {
              const index = model.shotsPerRound - 1 - i;
              const isSep = index % 4 === 0 && index !== 0;
              return <div key={index} className={`h-10 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 border-b ${isSep ? 'border-b-2 border-black dark:border-white' : 'border-gray-300 dark:border-slate-800'}`}>{index + 1}</div>;
            })}
            <div className="h-20 border-b border-gray-300 dark:border-slate-800 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">名</div>
          </div>

          {/* Archers */}
          {model.archers.map((archer, idx) => (
            <ArcherColumn
              key={archer.id}
              archer={archer}
              archerIndex={idx}
              shotsPerRound={model.shotsPerRound}
              lockedBlocks={model.lockedBlocks}
              activeArcherId={activeArcherId}
              activeShotIndex={activeShotIndex}
              onToggleMark={model.toggleMark}
              onSetMark={model.setMark}
              onDelete={model.deleteArcher}
              onUpdateInfo={model.updateArcherInfo}
              onInsertArcher={model.insertArcher}
              onInsertSeparator={model.insertSeparator}
              onInsertTotal={model.insertTotalCalculator}
              onMove={model.moveArcher}
              onToggleLock={model.toggleLock}
              getDisplayName={model.getDisplayName}
              getGroupArchers={model.getGroupArchers}
              getCalculatorForArcher={model.getCalculatorForArcher}
              sortedMembers={sortedMembers}
              advanceRecord={advanceToNext}
              sessions={model.sessions}
            />
          ))}
          <div className="w-8 flex-shrink-0"></div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-between p-2 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-900 shadow-[0_-2px_15px_rgba(0,0,0,0.08)] safe-area-bottom transition-colors">
        <button onClick={() => setShowMemberSheet(true)} className="flex flex-col items-center justify-center text-blue-500 dark:text-blue-400 px-2 py-1 active:bg-blue-50 dark:active:bg-blue-900/20 rounded-lg">
          <Users size={24} /><span className="text-[10px] font-medium">部員管理</span>
        </button>
        <div className="flex gap-1 items-center bg-white/50 dark:bg-slate-800/50 p-1 rounded-xl border border-gray-100 dark:border-slate-700 transition-colors">
          <motion.button whileTap={{ scale: 0.85 }} onClick={model.undo} disabled={!model.canUndo} className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 disabled:opacity-20 px-2 py-1"><Undo2 size={24} /><span className="text-[10px]">戻る</span></motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={model.redo} disabled={!model.canRedo} className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 disabled:opacity-20 px-2 py-1"><Redo2 size={24} /><span className="text-[10px]">次へ</span></motion.button>
          <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 mx-1"></div>
          <motion.button whileTap={{ scale: 0.85 }} onClick={model.addSeparator} className="flex flex-col items-center justify-center text-orange-500 dark:text-orange-400 px-2 py-1"><SplitSquareHorizontal size={24} /><span className="text-[10px]">間隔</span></motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={model.addTotalCalculator} className="flex flex-col items-center justify-center text-indigo-500 dark:text-indigo-400 px-2 py-1"><Sigma size={24} /><span className="text-[10px]">計追加</span></motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={model.addArcher}
            className="flex flex-col items-center justify-center text-white bg-blue-600 dark:bg-blue-500 px-3 py-1 rounded-lg ml-1 shadow-sm transition-all"
          >
            <UserPlus size={24} /><span className="text-[10px] font-bold">射手</span>
          </motion.button>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSaveDialog(true)}
          className="text-red-600 dark:text-red-400 font-bold text-sm px-2 py-4 active:bg-red-50 dark:active:bg-red-900/20 rounded-lg transition-colors"
        >
          記録/リセット
        </motion.button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showMemberSheet && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-50 overflow-auto"
          >
            <MemberManagementView onClose={() => setShowMemberSheet(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveDialog(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative z-10"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-2 dark:text-gray-100">記録の保存とリセット</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">この記録表を保存してリセットします。メモとタグを追加できます。</p>
              <textarea
                className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-6 dark:text-gray-100"
                placeholder="練習のメモや反省点..."
                rows={4}
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
              />

              <div className="mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-1.5">
                  <Tag size={12} /> タグ
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {presetTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedTags.includes(tag) ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      {tag}
                    </button>
                  ))}
                  {selectedTags.filter(t => !presetTags.includes(t)).map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="新しいタグ..."
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-500/50 dark:text-gray-100"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNewTag()}
                  />
                  <button
                    onClick={addNewTag}
                    className="bg-slate-200 dark:bg-slate-700 p-2 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowSaveDialog(false)} className="flex-1 py-3 text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">キャンセル</button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-md shadow-red-500/20"
                >
                  保存してリセット
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showArrowAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowArrowAlert(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative z-10"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-4 dark:text-gray-100">矢数の設定</h3>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[2, 4, 8, 12, 16, 20].map(num => (
                  <button
                    key={num}
                    onClick={() => { model.setShotsPerRound(num); setShowArrowAlert(false); }}
                    className={`py-2 rounded-xl border transition-all ${model.shotsPerRound === num ? 'bg-blue-600 border-blue-600 text-white font-bold' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300'}`}
                  >
                    {num}本
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={customArrow}
                  onChange={e => setCustomArrow(e.target.value)}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-500 dark:text-gray-100 outline-none transition-all"
                  placeholder="任意の本数"
                />
                <span className="absolute right-4 top-3.5 text-gray-400 text-sm">本</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowArrowAlert(false)} className="flex-1 py-3 text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">キャンセル</button>
                <button
                  onClick={() => { const val = parseInt(customArrow); if (val > 0) { model.setShotsPerRound(val); setShowArrowAlert(false); } }}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                >
                  決定
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
