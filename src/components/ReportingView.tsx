import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useScoreModel } from '../ScoreContext';
import { Mark, SessionRecord } from '../types';
import { Printer, FileText, Calendar, Filter, Download } from 'lucide-react';

export default function ReportingView() {
    const model = useScoreModel();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedMember, setSelectedMember] = useState<string>("all");

    const reportData = useMemo(() => {
        const sessions = model.sessions.filter(s => s.date.startsWith(selectedMonth));

        if (selectedMember === "all") {
            return sessions;
        } else {
            return sessions.map(s => ({
                ...s,
                archers: s.archers.filter(a => a.name === selectedMember || a.isSeparator || a.isTotalCalculator)
            })).filter(s => s.archers.some(a => a.name === selectedMember));
        }
    }, [model.sessions, selectedMonth, selectedMember]);

    const summary = useMemo(() => {
        let totalShots = 0;
        let totalHits = 0;

        reportData.forEach(s => {
            s.archers.forEach(a => {
                if (a.isSeparator || a.isTotalCalculator || !a.name) return;
                if (selectedMember !== "all" && a.name !== selectedMember) return;

                const validMarks = a.marks.slice(0, s.shotCount);
                totalHits += validMarks.filter(m => m === Mark.hit).length;
                totalShots += validMarks.filter(m => m !== Mark.none).length;
            });
        });

        return {
            totalShots,
            totalHits,
            rate: totalShots > 0 ? ((totalHits / totalShots) * 100).toFixed(1) : "0.0"
        };
    }, [reportData, selectedMember]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 overflow-auto pb-24">
            {/* Header - Screen Only */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 print:hidden transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-gray-100 flex items-center gap-2">
                            <FileText className="text-blue-600 dark:text-blue-400" />
                            報告書作成
                        </h2>
                        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">月間の練習記録をPDFとして出力・印刷できます</p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                    >
                        <Printer size={20} />
                        PDFを出力
                    </button>
                </div>

                {/* Filters */}
                <div className="mt-8 flex flex-wrap gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">対象月</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none w-48"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">部員</label>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={selectedMember}
                                onChange={(e) => setSelectedMember(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none w-48 appearance-none"
                            >
                                <option value="all">全員（まとめ）</option>
                                {model.members.map(m => (
                                    <option key={m.id} value={m.name}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Content - Print Area */}
            <div className="p-8 max-w-[210mm] mx-auto w-full print:p-0 print:m-0 print:bg-white bg-white dark:bg-slate-900 shadow-xl print:shadow-none min-h-[297mm] transition-colors mt-8 print:mt-0 mb-8 rounded-3xl print:rounded-none">

                {/* Report Header */}
                <div className="border-b-4 border-slate-800 p-8 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-gray-100">弓道部 的中記録報告書</h1>
                        <p className="text-slate-500 dark:text-gray-400 font-bold mt-2">
                            対象: {selectedMonth.replace("-", "年")}月 | 抽出: {selectedMember === "all" ? "チーム全体" : `${selectedMember} 殿`}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-black">発行日: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-3 gap-8 px-8 mb-12">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">合計射数</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-gray-100">{summary.totalShots}<span className="text-sm ml-1">射</span></p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">合計的中数</p>
                        <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{summary.totalHits}<span className="text-sm ml-1">中</span></p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">平均的中率</p>
                        <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{summary.rate}<span className="text-sm ml-1">%</span></p>
                    </div>
                </div>

                {/* Details Table */}
                <div className="px-8 pb-12">
                    <h3 className="text-lg font-bold mb-4 border-l-4 border-blue-600 pl-3">練習ログ明細</h3>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest text-left">
                                <th className="p-3 pl-4">日付</th>
                                <th className="p-3">部員名</th>
                                <th className="p-3">記録 (的中詳細)</th>
                                <th className="p-3 pr-4 text-right">的中率</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {reportData.flatMap(s => s.archers
                                .filter(a => !a.isSeparator && !a.isTotalCalculator && a.name)
                                .filter(a => selectedMember === "all" || a.name === selectedMember)
                                .map((a, i) => (
                                    <tr key={`${s.id}-${a.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <td className="p-4 pl-4 border-b dark:border-slate-800">{s.date}</td>
                                        <td className="p-4 border-b dark:border-slate-800 font-bold">{a.name}</td>
                                        <td className="p-4 border-b dark:border-slate-800">
                                            <div className="flex gap-0.5">
                                                {a.marks.slice(0, s.shotCount).map((m, idx) => (
                                                    <span key={idx} className={`w-4 h-4 text-[10px] flex items-center justify-center rounded-sm ${m === Mark.hit ? 'bg-blue-50 text-blue-600 font-black' : 'text-gray-300'}`}>
                                                        {m || '･'}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 pr-4 border-b dark:border-slate-800 text-right font-black">
                                            {((a.marks.slice(0, s.shotCount).filter(m => m === Mark.hit).length /
                                                a.marks.slice(0, s.shotCount).filter(m => m !== Mark.none).length) * 100).toFixed(0)}%
                                        </td>
                                    </tr>
                                ))
                            )}
                            {reportData.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-gray-400 italic">期間内のデータが見つかりませんでした</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-auto border-t border-gray-100 dark:border-slate-800 p-8 text-center text-[10px] text-gray-400 font-bold">
                    Archery Score Management System | (C) 2024 Nitidaikouka Archery Club
                </div>
            </div>

            {/* Print styles */}
            <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          .flex-col { height: auto !important; overflow: visible !important; }
          .pb-24 { padding-bottom: 0 !important; }
          ::-webkit-scrollbar { display: none; }
        }
      `}</style>
        </div>
    );
}
