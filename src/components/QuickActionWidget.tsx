import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ClipboardEdit, Megaphone, FileText, X, Settings } from 'lucide-react';

interface QuickActionWidgetProps {
    onNavigate: (tab: string) => void;
}

export default function QuickActionWidget({ onNavigate }: QuickActionWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { id: 'record', icon: ClipboardEdit, label: '記録開始', color: 'bg-blue-600' },
        { id: 'announcements', icon: Megaphone, label: '掲示板', color: 'bg-orange-500' },
        { id: 'report', icon: FileText, label: 'レポート', color: 'bg-indigo-600' },
        { id: 'settings', icon: Settings, label: '設定', color: 'bg-gray-600' },
    ];

    return (
        <div className="fixed bottom-24 right-6 z-40">
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30"
                        />
                        {/* Action Buttons */}
                        <div className="flex flex-col items-end gap-3 mb-4 relative z-40">
                            {actions.map((action, i) => (
                                <motion.button
                                    key={action.id}
                                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                    transition={{ delay: i * 0.05, type: 'spring', damping: 15 }}
                                    onClick={() => {
                                        onNavigate(action.id);
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center gap-3 group"
                                >
                                    <span className="bg-white dark:bg-slate-800 text-slate-800 dark:text-gray-100 text-xs font-black px-3 py-1.5 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {action.label}
                                    </span>
                                    <div className={`${action.color} text-white p-4 rounded-2xl shadow-xl shadow-black/10 transition-transform active:scale-90`}>
                                        <action.icon size={24} />
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative z-40 w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all ${isOpen ? 'bg-gray-900 group shadow-gray-500/30 rotate-90' : 'bg-blue-600 shadow-blue-500/30'}`}
            >
                {isOpen ? (
                    <X size={32} className="text-white" />
                ) : (
                    <Plus size={32} className="text-white" />
                )}
            </motion.button>
        </div>
    );
}
