import React, { useState } from 'react';
import { useScoreModel } from '../ScoreContext';
import { LogIn, KeyRound, User } from 'lucide-react';

export default function LoginView() {
    const { login } = useScoreModel();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId.trim() || !password.trim()) return;

        setLoading(true);
        // Simulate slight delay for UX feedback
        await new Promise(r => setTimeout(r, 150));
        const success = await login(userId.trim(), password);
        setLoading(false);
        if (!success) {
            setError(true);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl">🏹</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">日本大学工学部</h1>
                    <p className="text-blue-100 text-sm">弓道部 記録管理システム</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} autoComplete="on" className="space-y-5">
                        <div>
                            <label htmlFor="login-id" className="block text-sm font-medium text-gray-700 mb-1.5">
                                ログインID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-gray-400" />
                                </div>
                                <input
                                    id="login-id"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    value={userId}
                                    onChange={(e) => {
                                        setUserId(e.target.value);
                                        setError(false);
                                    }}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                    placeholder="IDを入力"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                パスワード
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound size={18} className="text-gray-400" />
                                </div>
                                <input
                                    id="login-password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(false);
                                    }}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                    placeholder="パスワードを入力"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 text-center bg-red-50 border border-red-100 p-2.5 rounded-xl">
                                IDまたはパスワードが間違っています
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !userId || !password}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <LogIn size={18} />
                            )}
                            {loading ? '認証中...' : 'ログイン'}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-gray-100 pt-5">
                        <p className="text-xs text-center text-gray-400 leading-relaxed">
                            ※最初は管理者アカウント<br />
                            <span className="font-mono text-gray-600">ID: admin　PW: 1234</span><br />
                            でログインし、部員用アカウントを発行してください。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
