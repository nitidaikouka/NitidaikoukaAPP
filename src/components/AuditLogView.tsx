import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useScoreModel } from '../ScoreContext';
import { Shield, Search, Filter, Clock, User, Info, AlertTriangle, AlertOctagon, Calendar } from 'lucide-react';

export default function AuditLogView() {
    const { auditLogs } = useScoreModel();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSeverity, setFilterSeverity] = useState<string>("all");

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = filterSeverity === "all" || log.severity === filterSeverity;
        return matchesSearch && matchesSeverity;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20';
            case 'medium': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20';
            default: return 'text-blue-500 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high': return <AlertOctagon size={16} />;
            case 'medium': return <AlertTriangle size={16} />;
            default: return <Info size={16} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 overflow-hidden pb-24 transition-colors">
            {/* Header */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 transition-colors">
                <h2 className="text-2xl font-black text-slate-800 dark:text-gray-100 flex items-center gap-2">
                    <Shield className="text-blue-600" />
                    セキュリティ監査ログ
                </h2>
                <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">システムの重要な操作履歴を確認できます</p>

                <div className="mt-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="操作、ユーザー名、詳細で検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-gray-100 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {['all', 'low', 'medium', 'high'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterSeverity(s)}
                                className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${filterSeverity === s ? 'bg-gray-900 text-white shadow-xl' : 'bg-white dark:bg-slate-900 text-gray-400 border border-gray-100 dark:border-slate-800'}`}
                            >
                                {s === 'all' ? 'すべて' : s.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredLogs.map((log) => (
                        <motion.div
                            key={log.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center gap-4 group transition-all hover:shadow-md"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-colors ${getSeverityColor(log.severity)}`}>
                                {getSeverityIcon(log.severity)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-black text-slate-800 dark:text-gray-100">{log.action}</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${getSeverityColor(log.severity)}`}>{log.severity}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{log.details}</p>
                            </div>

                            <div className="flex items-center gap-6 text-[10px] font-black tracking-widest text-gray-400 border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-6 shrink-0">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5"><User size={12} /> {log.userName}</div>
                                    <div className="flex items-center gap-1.5 text-blue-500/60 font-mono tracking-tighter">ID: {log.userId}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(log.timestamp).toLocaleDateString()}</div>
                                    <div className="flex items-center gap-1.5"><Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredLogs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-300 select-none">
                        <Shield size={64} className="opacity-10 mb-4" />
                        <p className="font-bold">ログは見つかりません</p>
                    </div>
                )}
            </div>
        </div>
    );
}
