import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Target, BarChart2, Users, Settings } from 'lucide-react';
import { useScoreModel } from '../ScoreContext';

const steps = [
    {
        title: "記録を開始しましょう",
        description: "「記録」タブでは、部員を選んで矢本数を入力し、的中（○）と外れ（×）をタップして記録します。巻藁や的前など、練習内容に合わせて使い分けましょう。",
        icon: <Target className="text-blue-500" size={40} />,
        target: "record-tab"
    },
    {
        title: "分析で上達を実感",
        description: "「分析」タブでは、的中率のランキングやヒートマップが表示されます。自分の苦手な位置や、チーム全体の調子の波を一目で把握できます。",
        icon: <BarChart2 className="text-emerald-500" size={40} />,
        target: "analysis-tab"
    },
    {
        title: "部員情報の管理",
        description: "「設定」内の「部員管理」では、新規登録や進級・卒業処理が可能です。一括編集機能を使えば、年度末の事務作業も一瞬で終わります。",
        icon: <Users className="text-purple-500" size={40} />,
        target: "settings-tab"
    },
    {
        title: "クラウド同期で安心",
        description: "データはリアルタイムでクラウドに保存されます。複数の端末で同時に編集しても、自動的にマージされるので安心して使えます。",
        icon: <CheckCircle2 className="text-blue-600" size={40} />,
        target: "sync-status"
    }
];

export default function TutorialOverlay() {
    const model = useScoreModel();
    const [currentStep, setCurrentStep] = useState(0);

    if (model.hasSeenTutorial) return null;

    const next = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            model.markTutorialAsSeen();
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative"
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-1 p-1 px-8 pt-6">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-full flex-1 rounded-full transition-all duration-300 ${i <= currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-800'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => model.markTutorialAsSeen()}
                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-10 pt-16 text-center">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mb-6 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-3xl">
                                {steps[currentStep].icon}
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-4">
                                {steps[currentStep].title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                {steps[currentStep].description}
                            </p>
                        </motion.div>

                        <div className="mt-12 flex gap-3">
                            {currentStep > 0 && (
                                <button
                                    onClick={prev}
                                    className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                >
                                    <ChevronLeft size={20} /> 戻る
                                </button>
                            )}
                            <button
                                onClick={next}
                                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-transform"
                            >
                                {currentStep === steps.length - 1 ? "さっそくはじめる" : "次へ"}
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <button
                            onClick={() => model.markTutorialAsSeen()}
                            className="mt-6 text-xs text-gray-400 hover:text-gray-500 dark:text-slate-600 font-medium"
                        >
                            チュートリアルをスキップ
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
