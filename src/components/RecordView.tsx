import React, { useState } from 'react';
import { useScoreModel } from '../ScoreContext';
import { Mark, Archer, Gender } from '../types';
import { Users, SplitSquareHorizontal, Sigma, UserPlus, XCircle, Trash2, Undo2, Redo2, Lock, Unlock, CheckCircle2, CloudUpload, Cloud, CloudOff } from 'lucide-react';
import MemberManagementView from './MemberManagementView';
import { sortMembers } from '../utils';

const getMarkColorClass = (mark: Mark) => {
  switch (mark) {
    case Mark.none: return "text-transparent";
    case Mark.hit: return "text-red-500";
    case Mark.miss: return "text-black";
  }
};

const ArcherColumn: React.FC<{ archer: Archer }> = ({ archer }) => {
  const model = useScoreModel();
  const [showMenu, setShowMenu] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [guestName, setGuestName] = useState("");
  const archerIndex = model.archers.findIndex(a => a.id === archer.id);

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
      model.moveArcher(sourceId, archer.id);
    }
  };

  const sortedMembers = sortMembers(model.members);

  if (archer.isSeparator) {
    return (
      <div 
        className="flex flex-col w-8 flex-shrink-0"
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="h-10 w-full bg-gray-100 border-b border-gray-300"></div>
        {Array.from({ length: model.shotsPerRound }).map((_, i) => {
          const index = model.shotsPerRound - 1 - i;
          const isBlockBottom = index % 4 === 0;
          const blockIndex = Math.floor(index / 4);
          const isLocked = model.lockedBlocks[`${archer.id}-${blockIndex}`];
          const isSeparatorBorder = isBlockBottom && index !== 0;
          
          return (
            <div key={index} className={`h-10 w-full bg-gray-100 ${isSeparatorBorder ? 'border-b-2 border-black' : 'border-b border-gray-300'} flex items-center justify-center relative`}>
              {isBlockBottom && (
                <button 
                  onClick={() => model.toggleLock(archer.id, blockIndex)}
                  className="w-full h-full flex items-center justify-center"
                >
                  {isLocked ? <Lock size={12} className="text-red-500" /> : <Unlock size={12} className="text-gray-400" />}
                </button>
              )}
            </div>
          );
        })}
        <div className="h-20 w-full bg-gray-100 border-b border-gray-300 flex items-end justify-center pb-1">
          <button onClick={() => model.deleteArcher(archer.id)} className="text-gray-400 hover:text-red-500">
            <XCircle size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (archer.isTotalCalculator) {
    const groupArchers = model.getGroupArchers(archer.id);
    const grandTotal = groupArchers.reduce((sum, a) => sum + a.marks.filter(m => m === Mark.hit).length, 0);

    return (
      <div 
        className="flex flex-col border-r border-gray-300 w-12 flex-shrink-0"
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="h-10 w-full bg-blue-500 border-b border-black flex items-center justify-center text-white font-bold text-lg">
          {grandTotal}
        </div>
        {Array.from({ length: model.shotsPerRound }).map((_, i) => {
          const index = model.shotsPerRound - 1 - i;
          const isSeparator = index % 4 === 0 && index !== 0;
          const isBlockBottom = index % 4 === 0;
          const blockIndex = Math.floor(index / 4);
          const isLocked = model.lockedBlocks[`${archer.id}-${blockIndex}`];
          
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
            <div key={index} className={`h-10 w-full bg-blue-50 flex items-center justify-center text-xl font-bold border-b ${isSeparator ? 'border-b-2 border-black' : 'border-gray-300'} text-blue-500 relative`}>
              {blockTotal !== null ? (
                <button 
                  onClick={() => model.toggleLock(archer.id, blockIndex)}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  <span>{blockTotal}</span>
                  {isLocked ? <Lock size={10} className="text-red-500 absolute bottom-0.5 right-0.5" /> : <Unlock size={10} className="text-gray-300 absolute bottom-0.5 right-0.5" />}
                </button>
              ) : ""}
            </div>
          );
        })}
        <div className="h-20 w-full bg-gray-100 border-b border-black flex flex-col items-center justify-center">
          <span className="text-blue-600 font-bold text-sm">計</span>
          <button onClick={() => model.deleteArcher(archer.id)} className="text-red-500 mt-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  const totalHits = archer.marks.filter(m => m === Mark.hit).length;
  const displayName = model.getDisplayName(archer.name);
  const calculatorId = model.getCalculatorForArcher(archer.id);

  let lastTap = 0;
  const handleCellClick = (index: number) => {
    const blockIndex = Math.floor(index / 4);
    if (calculatorId && model.lockedBlocks[`${calculatorId}-${blockIndex}`]) {
      return; // Locked
    }
    
    const now = Date.now();
    if (now - lastTap < 300) {
      model.setMark(archer.id, index, Mark.miss);
      lastTap = 0;
    } else {
      model.toggleMark(archer.id, index);
      lastTap = now;
    }
  };

  return (
    <div 
      className="flex flex-col border-r border-gray-300 relative w-12 flex-shrink-0"
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="h-10 w-full bg-yellow-50 border-b border-black flex items-center justify-center text-blue-600 font-bold text-lg">
        {totalHits}
      </div>
      {Array.from({ length: model.shotsPerRound }).map((_, i) => {
        const index = model.shotsPerRound - 1 - i;
        const mark = archer.marks[index];
        const isSeparator = index % 4 === 0 && index !== 0;
        const blockIndex = Math.floor(index / 4);
        const isLocked = calculatorId ? model.lockedBlocks[`${calculatorId}-${blockIndex}`] : false;
        
        return (
          <button 
            key={index}
            onClick={() => handleCellClick(index)}
            className={`h-10 w-full bg-white flex items-center justify-center text-xl font-bold border-b ${isSeparator ? 'border-b-2 border-black' : 'border-gray-300'} ${getMarkColorClass(mark)} ${isLocked ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
          >
            {mark || "　"}
          </button>
        );
      })}
      
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="h-20 w-full bg-gray-100 border-b border-black flex flex-col items-center justify-center p-1 relative"
      >
        <span className={`text-xs font-medium text-center leading-tight ${!archer.name ? 'text-gray-400' : 'text-black'}`} style={{ writingMode: 'vertical-rl' }}>
          {archer.name ? displayName : "選択"}
        </span>
        {archer.isGuest && <span className="text-[10px] text-gray-500 mt-1">ゲ</span>}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
          <div className="absolute bottom-20 left-0 w-48 bg-white shadow-xl rounded-md border border-gray-200 z-50 max-h-64 overflow-y-auto">
            <div className="p-2">
            {sortedMembers.map(m => (
              <button 
                key={m.id} 
                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                onClick={() => {
                  model.updateArcherInfo(archer.id, m.name, m.gender, m.grade, false);
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
                setShowGuestPrompt(true);
                setShowMenu(false);
              }}
            >
              ゲスト (的中分析に含めない)
            </button>
            <hr className="my-1" />
            <button 
              className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              onClick={() => {
                model.insertArcher(archerIndex);
                setShowMenu(false);
              }}
            >
              左に射手を追加
            </button>
            <button 
              className="w-full text-left px-2 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded"
              onClick={() => {
                model.insertSeparator(archerIndex);
                setShowMenu(false);
              }}
            >
              左に間隔を追加
            </button>
            <button 
              className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              onClick={() => {
                model.insertTotalCalculator(archerIndex);
                setShowMenu(false);
              }}
            >
              左に計を追加
            </button>
            <hr className="my-1" />
            <button 
              className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              onClick={() => {
                model.deleteArcher(archer.id);
                setShowMenu(false);
              }}
            >
              削除
            </button>
          </div>
        </div>
        </>
      )}

      {showGuestPrompt && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50" onClick={() => setShowGuestPrompt(false)}>
          <div className="bg-white p-4 rounded-lg w-64 shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-2">ゲスト名を入力</h3>
            <input 
              type="text" 
              value={guestName} 
              onChange={e => setGuestName(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="名前"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowGuestPrompt(false)} className="px-3 py-1 text-gray-600">キャンセル</button>
              <button 
                onClick={() => {
                  model.updateArcherInfo(archer.id, guestName || "ゲスト", Gender.unknown, 0, true);
                  setShowGuestPrompt(false);
                }} 
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function RecordView() {
  const model = useScoreModel();
  const [showMemberSheet, setShowMemberSheet] = useState(false);
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [sessionNote, setSessionNote] = useState("");
  const [showArrowAlert, setShowArrowAlert] = useState(false);
  const [customArrow, setCustomArrow] = useState("");

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-lg">日本大学工科記録アプリ</h1>
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            {model.syncStatus === 'synced' && <><CheckCircle2 size={12} className="text-green-500" /> 送信済み</>}
            {model.syncStatus === 'syncing' && <><CloudUpload size={12} className="text-blue-500 animate-pulse" /> 送信中</>}
            {model.syncStatus === 'pending' && <><Cloud size={12} className="text-gray-400" /> 送信待機</>}
            {model.syncStatus === 'error' && <><CloudOff size={12} className="text-red-500" /> エラー</>}
          </div>
        </div>
        <button onClick={() => setShowArrowAlert(true)} className="flex items-center gap-1 text-xs bg-gray-200 px-2 py-1 rounded">
          <span>{model.shotsPerRound}本</span>
        </button>
      </div>

      {/* Grid Area */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-row-reverse w-max min-w-full justify-start">
          
          {/* Header Column */}
          <div className="w-8 flex-shrink-0 border-r border-gray-300 bg-gray-50 flex flex-col">
            <div className="h-10 border-b border-gray-300"></div>
            {Array.from({ length: model.shotsPerRound }).map((_, i) => {
              const index = model.shotsPerRound - 1 - i;
              const isSeparator = index % 4 === 0 && index !== 0;
              return (
                <div key={index} className={`h-10 flex items-center justify-center text-xs text-gray-500 border-b ${isSeparator ? 'border-b-2 border-black' : 'border-gray-300'}`}>
                  {index + 1}
                </div>
              );
            })}
            <div className="h-20 border-b border-gray-300 flex items-center justify-center text-xs text-gray-500">名</div>
          </div>

          {/* Archers */}
          {model.archers.map(archer => (
            <ArcherColumn key={archer.id} archer={archer} />
          ))}
          
          {/* Spacer to allow scrolling past the last item */}
          <div className="w-8 flex-shrink-0"></div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-between p-2 border-t bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => setShowMemberSheet(true)} className="flex flex-col items-center text-blue-500">
          <Users size={20} />
          <span className="text-[10px]">部員管理</span>
        </button>
        
        <div className="flex gap-2">
          <button onClick={model.undo} disabled={!model.canUndo} className="flex flex-col items-center text-gray-600 disabled:opacity-30">
            <Undo2 size={20} />
            <span className="text-[10px]">戻る</span>
          </button>
          <button onClick={model.redo} disabled={!model.canRedo} className="flex flex-col items-center text-gray-600 disabled:opacity-30">
            <Redo2 size={20} />
            <span className="text-[10px]">次へ</span>
          </button>
          <button onClick={model.addSeparator} className="flex flex-col items-center text-orange-500">
            <SplitSquareHorizontal size={20} />
            <span className="text-[10px]">間隔</span>
          </button>
          <button onClick={model.addTotalCalculator} className="flex flex-col items-center text-blue-500">
            <Sigma size={20} />
            <span className="text-[10px]">計追加</span>
          </button>
          <button onClick={model.addArcher} className="flex flex-col items-center text-white bg-blue-500 px-3 py-1 rounded-md">
            <UserPlus size={20} />
            <span className="text-[10px]">射手</span>
          </button>
        </div>

        <button onClick={() => setShowResetAlert(true)} className="text-red-500 font-bold text-sm">
          記録/リセット
        </button>
      </div>

      {/* Modals */}
      {showMemberSheet && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <MemberManagementView onClose={() => setShowMemberSheet(false)} />
        </div>
      )}

      {showResetAlert && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50" onClick={() => setShowResetAlert(false)}>
          <div className="bg-white p-4 rounded-lg w-80 shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-2">記録の保存</h3>
            <p className="text-sm text-gray-600 mb-4">この記録表を保存してリセットしますか？</p>
            <input 
              type="text" 
              value={sessionNote} 
              onChange={e => setSessionNote(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="メモ (天気や反省など)"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowResetAlert(false)} className="px-3 py-1 text-gray-600">キャンセル</button>
              <button 
                onClick={() => {
                  model.saveSessionAndReset(sessionNote);
                  setSessionNote("");
                  setShowResetAlert(false);
                }} 
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showArrowAlert && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50" onClick={() => setShowArrowAlert(false)}>
          <div className="bg-white p-4 rounded-lg w-64 shadow-2xl border border-gray-200" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-2">矢数の設定</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {[2, 4, 8, 12, 16, 20].map(num => (
                <button 
                  key={num}
                  onClick={() => { model.setShotsPerRound(num); setShowArrowAlert(false); }}
                  className="px-3 py-1 bg-gray-100 rounded"
                >
                  {num}本
                </button>
              ))}
            </div>
            <input 
              type="number" 
              value={customArrow} 
              onChange={e => setCustomArrow(e.target.value)}
              className="w-full border p-2 rounded mb-4"
              placeholder="任意の本数"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowArrowAlert(false)} className="px-3 py-1 text-gray-600">キャンセル</button>
              <button 
                onClick={() => {
                  const val = parseInt(customArrow);
                  if (val > 0) {
                    model.setShotsPerRound(val);
                    setShowArrowAlert(false);
                  }
                }} 
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                決定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
