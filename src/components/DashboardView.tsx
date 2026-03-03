import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useScoreModel } from '../ScoreContext';
import { Mark } from '../types';
import { TrendingUp, Users, Calendar, Award } from 'lucide-react';

export default function DashboardView() {
    const model = useScoreModel();

    // 1. Calculate Team Stats
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const memberStats: Record<string, {
            id: string,
            name: string,
            attendance: number,
            totalHits: number,
            totalShots: number,
            trendRates: number[]
        }> = {};

        // Initialize with current members
        model.members.forEach(m => {
            memberStats[m.name] = {
                id: m.id,
                name: m.name,
                attendance: 0,
                totalHits: 0,
                totalShots: 0,
                trendRates: []
            };
        });

        const sessions = [...model.sessions]
            .filter(s => !s.isArchived)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Attendance & Basic Totals
        sessions.forEach(session => {
            session.archers.forEach(archer => {
                if (archer.isSeparator || archer.isTotalCalculator || !archer.name) return;
                if (!memberStats[archer.name]) return;

                memberStats[archer.name].attendance += 1;

                const validMarks = archer.marks.slice(0, session.shotCount);
                const hits = validMarks.filter(m => m === Mark.hit).length;
                const shots = validMarks.filter(m => m !== Mark.none).length;

                if (shots > 0) {
                    memberStats[archer.name].totalHits += hits;
                    memberStats[archer.name].totalShots += shots;
                    memberStats[archer.name].trendRates.push(hits / shots);
                }
            });
        });

        // Limit trend to last 10
        Object.values(memberStats).forEach(m => {
            if (m.trendRates.length > 10) m.trendRates = m.trendRates.slice(-10);
        });

        const sortedByRate = Object.values(memberStats)
            .filter(s => s.totalShots > 0)
            .map(s => ({ ...s, rate: (s.totalHits / s.totalShots) * 100 }))
            .sort((a, b) => b.rate - a.rate);

        const totalShots = Object.values(memberStats).reduce((sum, m) => sum + m.totalShots, 0);
        const totalHits = Object.values(memberStats).reduce((sum, m) => sum + m.totalHits, 0);
        const teamHitRate = totalShots > 0 ? ((totalHits / totalShots) * 100).toFixed(1) : '0.0';

        const todayParticipants = model.sessions.filter(s => {
            const sessionDate = new Date(s.date);
            return sessionDate.toDateString() === now.toDateString();
        }).flatMap(s => s.archers.filter(a => !a.isSeparator && !a.isTotalCalculator && a.name).map(a => a.name)).filter((value, index, self) => self.indexOf(value) === index).length;

        const activeMembersCount = Object.values(memberStats).filter(m => m.totalShots > 0).length;
        const alumniCount = model.alumni.length;

        return {
            memberStats: Object.values(memberStats).sort((a, b) => b.attendance - a.attendance),
            topPerformers: sortedByRate.slice(0, 5),
            totalShots,
            totalHits,
            teamHitRate,
            todayParticipants,
            activeMembersCount,
            alumniCount,
            totalSessions: model.sessions.length
        };
    }, [model.sessions, model.members, model.alumni]);

    // Helper for dynamic colors to avoid interpolation issues with Tailwind JIT
    const getColorClass = (color: string) => {
        const mapping: Record<string, string> = {
            blue: 'text-blue-600 dark:text-blue-400',
            emerald: 'text-emerald-600 dark:text-emerald-400',
            orange: 'text-orange-600 dark:text-orange-400',
            indigo: 'text-indigo-600 dark:text-indigo-400'
        };
        return mapping[color] || 'text-gray-600';
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 overflow-auto pb-20 transition-colors duration-300">
            {/* Header Area */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 transition-colors">
                <h2 className="text-2xl font-black text-slate-800 dark:text-gray-100 flex items-center gap-2">
                    <TrendingUp className="text-blue-600 dark:text-blue-400" />
                    チームダッシュボード
                </h2>
                <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">チーム全体の活動状況と的中率の概況</p>
            </div>

            {/* Global Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                {[
                    { label: "全体の合計射数", value: `${stats.totalShots}射`, sub: "全期間", color: "blue" },
                    { label: "チーム平均的中率", value: `${stats.teamHitRate}%`, sub: `${stats.totalHits}中 / ${stats.totalShots}射`, color: "emerald" },
                    { label: "本日の参加人数", value: `${stats.todayParticipants}名`, sub: "記録あり", color: "orange" },
                    { label: "登録部員数", value: `${model.members.length}名`, sub: `${stats.activeMembersCount}名(現役) / ${stats.alumniCount}名(卒業)`, color: "indigo" }
                ].map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors"
                    >
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                        <p className={`text-2xl font-black ${getColorClass(item.color)}`}>{item.value}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{item.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="px-4 space-y-6">
                {/* Top Performers */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
                        <Award className="text-yellow-500" size={20} />
                        的中率ランキング (TOP 5)
                    </h3>
                    <div className="space-y-4">
                        {stats.topPerformers.map((p, i) => (
                            <div key={p.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400'}`}>
                                        {i + 1}
                                    </div>
                                    <span className="font-bold dark:text-gray-200">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                        <div className="h-full bg-blue-500" style={{ width: `${p.rate}%` }}></div>
                                    </div>
                                    <span className="font-black text-blue-600 dark:text-blue-400 min-w-[3rem] text-right">{p.rate.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                        {stats.topPerformers.length === 0 && (
                            <p className="text-center text-slate-400 py-4 text-sm">データがありません</p>
                        )}
                    </div>
                </div>

                {/* Member Attendance Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
                        <Calendar className="text-green-500" size={20} />
                        全部員の活動状況
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b dark:border-slate-800">
                                    <th className="pb-3 px-2">名前</th>
                                    <th className="pb-3 px-2">出席数</th>
                                    <th className="pb-3 px-2 text-right">的中率</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {stats.memberStats.map((m, i) => (
                                    <motion.tr
                                        key={m.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 + i * 0.03 }}
                                        className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="py-4 pl-4 pr-2">
                                            <div className="font-bold dark:text-gray-200">{m.name}</div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className="text-sm font-medium dark:text-gray-400">{m.attendance} 回</span>
                                        </td>
                                        <td className="py-4 px-2 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-sm font-black ${m.totalShots > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-700'}`}>
                                                    {m.totalShots > 0 ? `${((m.totalHits / m.totalShots) * 100).toFixed(1)}%` : '--'}
                                                </span>
                                                {m.trendRates.length >= 2 && (
                                                    <div className="w-16 h-4">
                                                        <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
                                                            <polyline
                                                                fill="none"
                                                                stroke="#3b82f6"
                                                                strokeWidth="3"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                points={m.trendRates.map((r, i) => `${(i / (m.trendRates.length - 1)) * 100},${20 - (r * 20)}`).join(' ')}
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
