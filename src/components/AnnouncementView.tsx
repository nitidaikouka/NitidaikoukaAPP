import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useScoreModel } from '../ScoreContext';
import { Megaphone, Plus, X, Trash2, Calendar, User, AlertCircle, ChevronDown } from 'lucide-react';
import { UserRole } from '../types';

export default function AnnouncementView() {
    const model = useScoreModel();
    const [showAddModal, setShowAddModal] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isImportant, setIsImportant] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const isAdmin = model.currentUser?.role === UserRole.admin;

    const handleAdd = () => {
        if (!title || !content) return;
        model.addAnnouncement(title, content, isImportant);
        setShowAddModal(false);
        setTitle("");
        setContent("");
        setIsImportant(false);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 overflow-hidden pb-24 transition-colors">
            {/* Header */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex justify-between items-center transition-colors">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-gray-100 flex items-center gap-2">
                        <Megaphone className="text-orange-500" />
                        掲示板・お知らせ
                    </h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">練習の連絡や重要な告知を共有します</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-90 transition-all"
                    >
                        <Plus size={24} />
                    </button>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                <AnimatePresence mode="popLayout">
                    {model.announcements.map((a) => (
                        <motion.div
                            key={a.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border ${a.isImportant ? 'border-orange-200 dark:border-orange-900/50' : 'border-gray-100 dark:border-slate-800'} overflow-hidden transition-colors cursor-pointer`}
                            onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                        >
                            <div className={`p-5 flex items-start gap-4 ${a.isImportant ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${a.isImportant ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 dark:bg-slate-800'}`}>
                                    {a.isImportant ? <AlertCircle size={24} /> : <Megaphone size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-black text-lg ${a.isImportant ? 'text-orange-900 dark:text-orange-100' : 'text-slate-800 dark:text-gray-100'} truncate`}>
                                            {a.title}
                                        </h3>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(a.date).toLocaleDateString()}</span>
                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); if (window.confirm('削除しますか？')) model.deleteAnnouncement(a.id); }}
                                                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className={`text-sm mt-1 line-clamp-1 transition-all ${expandedId === a.id ? 'line-clamp-none' : ''} ${a.isImportant ? 'text-orange-800/70 dark:text-orange-200/60' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {a.content}
                                    </p>

                                    <div className="mt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <span className="flex items-center gap-1"><User size={12} /> {a.author}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <ChevronDown size={20} className={`text-gray-300 transition-transform ${expandedId === a.id ? 'rotate-180' : ''}`} />
                            </div>
                            {expandedId === a.id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-5 pb-5 pt-0 text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap border-t border-gray-50 dark:border-slate-800 mt-2 pt-4"
                                >
                                    {a.content}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {model.announcements.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-300 select-none">
                        <Megaphone size={64} className="opacity-10 mb-4" />
                        <p className="font-bold">お知らせはありません</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black dark:text-gray-100">お知らせを投稿</h3>
                                    <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={24} /></button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1 block">タイトル</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="例: 今後の練習予定について"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-gray-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-1 block">内容</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="詳細を入力..."
                                            rows={5}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-gray-100 resize-none"
                                        />
                                    </div>
                                    <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-pointer active:scale-95 transition-transform">
                                        <input
                                            type="checkbox"
                                            checked={isImportant}
                                            onChange={(e) => setIsImportant(e.target.checked)}
                                            className="w-5 h-5 rounded-lg border-none text-orange-500 focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-black text-slate-700 dark:text-gray-200">重要フラグ（ハイライト表示）</span>
                                    </label>
                                </div>

                                <button
                                    onClick={handleAdd}
                                    disabled={!title || !content}
                                    className="w-full bg-blue-600 disabled:bg-gray-200 dark:disabled:bg-slate-800 text-white py-4 rounded-2xl font-black mt-8 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                >
                                    投稿する
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
