import React, { useState } from 'react';
import TargetFaceView, { ArrowPosition, TargetType } from './TargetFaceView';
import { Target, RefreshCw, Save, ChevronDown, ChevronUp, CheckCircle2, Trash2, Undo2, Redo2, Maximize2, Minimize2 } from 'lucide-react';

type PracticeMode = 'tachi' | 'iromi';

interface PracticeSession {
    id: string;
    date: string;
    mode: PracticeMode;
    targetType: TargetType;
    totalShots: number;
    hits: number;
    arrows: ArrowPosition[];
    note: string;
    targetBgColor?: string;
}

interface PersonalRecordViewProps {
    memberName: string;
}

const LOCAL_KEY = 'personal_records';

const loadRecords = (): PracticeSession[] => {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    } catch {
        return [];
    }
};

const saveRecords = (records: PracticeSession[]) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
};

const SHOT_OPTIONS = [4, 8, 12, 16, 20];
const TARGET_BG_COLORS = [
    { name: 'Default', value: '#ffffff' },
    { name: 'Cream', value: '#fffbeb' },
    { name: 'Sky', value: '#f0f9ff' },
    { name: 'Forest', value: '#f0fdf4' },
    { name: 'Paper', value: '#fcfcfc' },
];

export default function PersonalRecordView({ memberName }: PersonalRecordViewProps) {
    const [mode, setMode] = useState<PracticeMode>('tachi');
    const [targetType, setTargetType] = useState<TargetType>('kasumi');
    const [totalShots, setTotalShots] = useState(12);
    const [note, setNote] = useState('');
    const [records, setRecords] = useState<PracticeSession[]>(loadRecords);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [tab, setTab] = useState<'input' | 'history'>('input');
    const [savedToast, setSavedToast] = useState(false);
    const [isZenMode, setIsZenMode] = useState(false);
    const [targetBgColor, setTargetBgColor] = useState('#ffffff');

    // Undo/Redo states
    const [arrowsHistory, setArrowsHistory] = useState<ArrowPosition[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const currentArrows = arrowsHistory[historyIndex];

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < arrowsHistory.length - 1;

    const pushHistory = (newArrows: ArrowPosition[]) => {
        const nextHistory = arrowsHistory.slice(0, historyIndex + 1);
        nextHistory.push(newArrows);
        setArrowsHistory(nextHistory);
        setHistoryIndex(nextHistory.length - 1);
    };

    const undo = () => {
        if (canUndo) setHistoryIndex(historyIndex - 1);
    };

    const redo = () => {
        if (canRedo) setHistoryIndex(historyIndex + 1);
    };

    const handleAddArrow = (x: number, y: number) => {
        if (currentArrows.length >= totalShots) return;
        const newArrows = [...currentArrows, { x, y, shotIndex: currentArrows.length }];
        pushHistory(newArrows);
    };

    const handleRemoveArrow = (index: number) => {
        const next = currentArrows.filter((_, i) => i !== index);
        const renamed = next.map((a, i) => ({ ...a, shotIndex: i }));
        pushHistory(renamed);
    };

    const handleReset = () => {
        if (currentArrows.length > 0 && window.confirm('現在の入力をすべてリセットしますか？')) {
            pushHistory([]);
        }
    };

    const handleSave = () => {
        const session: PracticeSession = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            mode,
            targetType,
            totalShots,
            hits: currentArrows.length,
            arrows: currentArrows,
            note,
            targetBgColor,
        };
        const updated = [session, ...records];
        setRecords(updated);
        saveRecords(updated);
        setArrowsHistory([[]]);
        setHistoryIndex(0);
        setNote('');
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 2500);
    };

    const handleDelete = (id: string) => {
        if (!window.confirm('この記録を削除しますか？')) return;
        const updated = records.filter(r => r.id !== id);
        setRecords(updated);
        saveRecords(updated);
        if (expandedId === id) setExpandedId(null);
    };

    const modeName: Record<PracticeMode, string> = { tachi: '立ち', iromi: '射込み' };
    const targetName: Record<TargetType, string> = { kasumi: '霞的', hoshi: '星的' };
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} (${weekdays[d.getDay()]})`;
    };

    const remaining = totalShots - currentArrows.length;

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 relative transition-colors duration-300">
            {/* Header - Hidden in Zen Mode */}
            {!isZenMode && (
                <div className="p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-lg dark:text-gray-100">個人記録</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{memberName}</p>
                    </div>
                    <button
                        onClick={() => setIsZenMode(true)}
                        className="p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-2"
                        title="集中モード"
                    >
                        <Maximize2 size={18} />
                        <span className="text-xs font-bold">集中</span>
                    </button>
                </div>
            )}

            {/* Tab - Hidden in Zen Mode */}
            {!isZenMode && (
                <div className="flex bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-10 transition-colors">
                    {(['input', 'history'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
                        >
                            {t === 'input' ? '記録入力' : `過去の記録 (${records.length})`}
                        </button>
                    ))}
                </div>
            )}

            {tab === 'input' ? (
                <div className={`flex-1 overflow-auto p-4 space-y-4 pb-6 ${isZenMode ? 'bg-white dark:bg-slate-950' : ''}`}>
                    {/* Mode & Target Type selectors - Hidden in Zen Mode */}
                    {!isZenMode && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 space-y-3 transition-colors">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block">練習種別</label>
                                <div className="flex gap-2">
                                    {(['tachi', 'iromi'] as PracticeMode[]).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setMode(m)}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${mode === m ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'}`}
                                        >
                                            {modeName[m]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block">的の種類</label>
                                <div className="flex gap-2">
                                    {(['kasumi', 'hoshi'] as TargetType[]).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => { setTargetType(t); setArrowsHistory([[]]); setHistoryIndex(0); }}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${targetType === t ? 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'}`}
                                        >
                                            {targetName[t]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block">射数</label>
                                <div className="flex gap-1.5">
                                    {SHOT_OPTIONS.map(n => (
                                        <button
                                            key={n}
                                            onClick={() => { setTotalShots(n); setArrowsHistory([[]]); setHistoryIndex(0); }}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${totalShots === n ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block">的の背景色</label>
                                <div className="flex gap-2">
                                    {TARGET_BG_COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => setTargetBgColor(c.value)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${targetBgColor === c.value ? 'border-blue-500 dark:border-blue-400 scale-110 shadow-sm' : 'border-gray-200 dark:border-slate-700 opacity-60'}`}
                                            style={{ backgroundColor: c.value }}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Target */}
                    <div className={`${isZenMode ? 'border-none shadow-none mt-8' : 'bg-white dark:bg-slate-900 rounded-xl shadow-sm dark:shadow-none p-4 border dark:border-slate-800'} flex flex-col items-center gap-3 transition-colors`}>
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <span className={`text-sm font-bold ${isZenMode ? 'text-gray-900 dark:text-gray-100 text-base' : 'text-gray-700 dark:text-gray-200'}`}>{targetName[targetType]}</span>
                                <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{currentArrows.length}/{totalShots}射</span>
                                {remaining > 0 && currentArrows.length > 0 && (
                                    <span className="ml-2 text-xs text-orange-500 dark:text-orange-400 font-bold">あと{remaining}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {currentArrows.length > 0 && (
                                    <span className={`font-bold ${isZenMode ? 'text-2xl text-blue-600 dark:text-blue-400' : 'text-sm text-blue-600 dark:text-blue-400'}`}>{currentArrows.length}中</span>
                                )}
                                <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1 transition-colors">
                                    <button onClick={undo} disabled={!canUndo} className="p-1 px-2 text-gray-500 dark:text-gray-400 disabled:opacity-20"><Undo2 size={16} /></button>
                                    <button onClick={redo} disabled={!canRedo} className="p-1 px-2 text-gray-500 dark:text-gray-400 disabled:opacity-20"><Redo2 size={16} /></button>
                                </div>
                            </div>
                        </div>

                        <TargetFaceView
                            targetType={targetType}
                            arrows={currentArrows}
                            onAddArrow={handleAddArrow}
                            onRemoveArrow={handleRemoveArrow}
                            bgColor={targetBgColor}
                            size={Math.min(isZenMode ? 320 : 280, window.innerWidth - (isZenMode ? 40 : 80))}
                        />

                        {isZenMode && (
                            <button
                                onClick={() => setIsZenMode(false)}
                                className="fixed top-6 right-6 p-3 bg-gray-900/10 dark:bg-white/10 hover:bg-gray-900/20 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 rounded-full transition-all"
                                title="集中モード解除"
                            >
                                <Minimize2 size={24} />
                            </button>
                        )}

                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {isZenMode ? `${currentArrows.length} 本目の記録中` : '的をタップして矢を記録'}
                        </p>

                        {currentArrows.length === totalShots && (
                            <div className="w-full bg-blue-600 text-white rounded-xl p-3 text-center text-sm font-bold shadow-lg animate-in zoom-in slide-in-from-bottom-2">
                                ✓ {totalShots}射完了！ 記録を保存してください
                            </div>
                        )}
                    </div>

                    {/* Note - Hidden in Zen Mode */}
                    {!isZenMode && (
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">メモ（任意）</label>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                rows={2}
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="練習の感想など..."
                            />
                        </div>
                    )}

                    {/* Save */}
                    <button
                        onClick={handleSave}
                        disabled={currentArrows.length === 0}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl font-medium shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={18} />
                        記録を保存
                    </button>
                </div>
            ) : (
                <div className="flex-1 overflow-auto p-4 space-y-3">
                    {records.length === 0 ? (
                        <div className="text-center text-gray-400 dark:text-gray-500 mt-20">
                            <Target size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="dark:text-gray-400">まだ記録がありません</p>
                            <p className="text-xs mt-1 dark:text-gray-500">「記録入力」タブから記録を追加できます</p>
                        </div>
                    ) : (
                        records.map(r => {
                            const isExpanded = expandedId === r.id;
                            const rate = r.totalShots > 0 ? (r.hits / r.totalShots * 100).toFixed(0) : '0';
                            const rateNum = Number(rate);
                            return (
                                <div key={r.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <button
                                        className="w-full flex items-center p-4 text-left gap-3 active:bg-gray-50 dark:active:bg-slate-800/50 transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${rateNum >= 70 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : rateNum >= 50 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'}`}>
                                            {rate}%
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {modeName[r.mode]} ― {targetName[r.targetType]}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {formatDate(r.date)} ／ <span className="font-medium text-gray-700 dark:text-gray-300">{r.hits}/{r.totalShots}中</span>
                                            </p>
                                            {r.note && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">"{r.note}"</p>}
                                        </div>
                                        {isExpanded ? <ChevronUp size={16} className="text-gray-400 dark:text-gray-600 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 dark:text-gray-600 flex-shrink-0" />}
                                    </button>

                                    {isExpanded && (
                                        <div className="border-t border-gray-100 dark:border-slate-800 p-4 flex flex-col items-center gap-3 bg-gray-50 dark:bg-slate-800/30 transition-colors">
                                            <TargetFaceView
                                                targetType={r.targetType}
                                                arrows={r.arrows}
                                                readonly
                                                bgColor={r.targetBgColor}
                                                size={240}
                                            />
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                                <span>的中率: <strong className="text-gray-900 dark:text-gray-100">{rate}%</strong></span>
                                                <span>{r.hits}中 / {r.totalShots}射</span>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(r.id)}
                                                className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                この記録を削除
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Toast notification */}
            {savedToast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg z-50 animate-bounce-once">
                    <CheckCircle2 size={16} className="text-green-400" />
                    記録を保存しました
                </div>
            )}
        </div>
    );
}
