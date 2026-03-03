import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useScoreModel } from '../ScoreContext';
import { Calendar as CalendarIcon, Users, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { sortMembers } from '../utils';

export default function AttendanceView() {
    const model = useScoreModel();
    const [viewDate, setViewDate] = useState(new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const monthSessions = useMemo(() => {
        return model.sessions.filter(s => {
            const d = new Date(s.date);
            return d.getFullYear() === year && d.getMonth() === month;
        });
    }, [model.sessions, year, month]);

    const attendanceMap = useMemo(() => {
        const map: Record<string, Set<number>> = {};
        monthSessions.forEach(s => {
            const day = new Date(s.date).getDate();
            s.archers.forEach(a => {
                if (a.isSeparator || a.isTotalCalculator || !a.name) return;
                if (!map[a.name]) map[a.name] = new Set();
                map[a.name].add(day);
            });
        });
        return map;
    }, [monthSessions]);

    const sortedMembers = useMemo(() => sortMembers(model.members), [model.members]);

    const changeMonth = (offset: number) => {
        setViewDate(new Date(year, month + offset, 1));
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 overflow-hidden pb-20 transition-colors duration-300">
            {/* Header */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex justify-between items-center transition-colors">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-gray-100 flex items-center gap-2">
                        <CalendarIcon className="text-emerald-600 dark:text-emerald-400" />
                        出席管理・活動ログ
                    </h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">月々の練習参加状況を確認できます</p>
                </div>
                <div className="flex items-center gap-4 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95 text-gray-600 dark:text-gray-300">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-black text-lg min-w-[8rem] text-center dark:text-gray-200">
                        {year}年 {month + 1}月
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95 text-gray-600 dark:text-gray-300">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Main Grid Area */}
            <div className="flex-1 overflow-auto p-4">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden min-w-max">
                    <div className="grid grid-cols-[180px_1fr] divide-x dark:divide-slate-800">
                        {/* Left: Members Sidebar */}
                        <div className="bg-gray-50/50 dark:bg-slate-900/50">
                            <div className="h-12 border-b dark:border-slate-800 px-4 flex items-center font-bold text-[10px] text-gray-400 uppercase tracking-widest">
                                部員名 / 合計
                            </div>
                            <div className="divide-y dark:divide-slate-800">
                                {sortedMembers.map(m => (
                                    <div key={m.id} className="h-12 px-4 flex items-center justify-between group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                        <span className="font-bold text-sm text-gray-700 dark:text-gray-300 truncate mr-2">{m.name}</span>
                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                            {attendanceMap[m.name]?.size || 0}日
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Scrollable Calendar Grid */}
                        <div className="overflow-x-auto overflow-y-hidden">
                            <div className="flex h-12 border-b dark:border-slate-800">
                                {daysArray.map(day => (
                                    <div key={day} className="flex-none w-10 flex flex-col items-center justify-center border-r dark:border-slate-800 last:border-r-0">
                                        <span className="text-[10px] font-black text-gray-400">{day}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="divide-y dark:divide-slate-800">
                                {sortedMembers.map(m => (
                                    <div key={m.id} className="flex h-12 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        {daysArray.map(day => {
                                            const isAttended = attendanceMap[m.name]?.has(day);
                                            return (
                                                <div key={day} className="flex-none w-10 flex items-center justify-center border-r dark:border-slate-800 last:border-r-0">
                                                    {isAttended && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-sm"
                                                        >
                                                            <Check size={14} strokeWidth={4} />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend / Stats */}
            <div className="p-4 px-6 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex items-center gap-6 transition-colors">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">出席（記録あり）</span>
                </div>
                <div className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    ※ 「記録」に残っている部員を自動的に出席としてカウントしています。
                </div>
            </div>
        </div>
    );
}
