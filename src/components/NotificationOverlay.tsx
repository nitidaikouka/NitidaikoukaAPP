import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X, Clock } from 'lucide-react';
import { useScoreModel } from '../ScoreContext';
import { NotificationType } from '../types';

export default function NotificationOverlay() {
    const { notifications, removeNotification } = useScoreModel();

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-green-500" size={20} />;
            case 'warning': return <AlertTriangle className="text-orange-500" size={20} />;
            case 'error': return <XCircle className="text-red-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    const getBgColor = (type: NotificationType) => {
        switch (type) {
            case 'success': return 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/20';
            case 'warning': return 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/20';
            case 'error': return 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/20';
            default: return 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/20';
        }
    };

    return (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
            <AnimatePresence mode="popLayout">
                {notifications.map((n) => (
                    <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        className={`pointer-events-auto w-full p-4 rounded-3xl shadow-2xl border backdrop-blur-md ${getBgColor(n.type)} flex items-start gap-3 relative group overflow-hidden`}
                    >
                        {/* Progress line for auto-dismiss (simulated) */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                            className="absolute bottom-0 left-0 h-1 bg-black/5 dark:bg-white/5"
                        />

                        <div className="mt-0.5">{getIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-sm text-slate-800 dark:text-gray-100 leading-none mb-1">{n.title}</h4>
                            <p className="text-xs font-medium text-slate-500 dark:text-gray-400 line-clamp-2">{n.message}</p>
                            <div className="mt-2 flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter text-gray-400">
                                <Clock size={8} />
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <button
                            onClick={() => removeNotification(n.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
