import React, { useState, useRef } from 'react';
import { useScoreModel } from '../ScoreContext';
import { UserRole, UserAccount } from '../types';
import { RefreshCw, Download, Upload, FileSpreadsheet, UserPlus, Trash2, LogOut, KeyRound, ShieldAlert, Eye, EyeOff, CheckCircle2, Moon, Sun } from 'lucide-react';

export default function SettingsView() {
  const model = useScoreModel();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // Account management states
  const [newId, setNewId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.member);
  const [newMemberId, setNewMemberId] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [accountError, setAccountError] = useState('');

  const handleDownloadBackup = () => {
    const data = model.exportDataToString();
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kyudo_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (model.importDataFromString(text)) {
        showToast('✓ データを復元しました');
      } else {
        showToast('⚠ 形式が不正です');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportCSV = () => {
    let csv = '日付,氏名,学年,性別,的中数,矢数,的中率\n';
    model.history.forEach(record => {
      const date = new Date(record.date).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
      record.entries.forEach(entry => {
        const rate = entry.totalShots > 0 ? (entry.hits / entry.totalShots * 100).toFixed(1) + '%' : '0%';
        csv += `${date},${entry.name},${entry.grade},${entry.gender},${entry.hits},${entry.totalShots},${rate}\n`;
      });
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kyudo_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ CSVを出力しました');
  };

  const handleAddAccount = () => {
    setAccountError('');
    if (!newId.trim() || !newPassword.trim()) {
      setAccountError('IDとパスワードを入力してください');
      return;
    }
    if (model.accounts.some(a => a.id === newId.trim())) {
      setAccountError('このIDはすでに使われています');
      return;
    }
    const account: UserAccount = {
      id: newId.trim(),
      passwordHash: newPassword.trim(),
      role: newRole,
      name: newRole === UserRole.admin ? "管理者" : undefined,
      memberId: newRole === UserRole.member && newMemberId ? newMemberId : undefined
    };
    model.addAccount(account);
    setNewId('');
    setNewPassword('');
    setNewMemberId('');
    setNewRole(UserRole.member);
    showToast(`✓ アカウント「${account.id}」を追加しました`);
  };

  const handleDeleteAccount = (id: string) => {
    if (id === 'admin') {
      showToast('⚠ デフォルトの管理者アカウントは削除できません');
      return;
    }
    if (model.currentUser?.id === id) {
      showToast('⚠ 現在ログイン中のアカウントは削除できません');
      return;
    }
    if (window.confirm(`アカウント「${id}」を削除しますか？`)) {
      model.deleteAccount(id);
      showToast(`削除しました: ${id}`);
    }
  };

  const isAdmin = model.currentUser?.role === UserRole.admin;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between">
        <h2 className="font-bold text-lg dark:text-gray-100">設定・データ管理</h2>
        <button
          onClick={model.logout}
          className="flex items-center gap-1 text-sm text-red-500 font-medium px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
        >
          <LogOut size={16} />
          ログアウト
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* ログイン情報 */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-sm font-bold text-gray-600 dark:text-gray-400">ログイン情報</div>
          <div className="p-4">
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <ShieldAlert size={18} className="text-orange-500" />
              ) : (
                <KeyRound size={18} className="text-blue-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  ID: {model.currentUser?.id}
                </p>
                <p className={`text-xs font-semibold ${isAdmin ? 'text-orange-500' : 'text-blue-500'}`}>
                  {isAdmin ? '管理者' : '部員'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 表示設定 */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-sm font-bold text-gray-600 dark:text-gray-400">表示設定</div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {model.theme === 'dark' ? (
                <Moon size={18} className="text-indigo-400" />
              ) : (
                <Sun size={18} className="text-amber-500" />
              )}
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                ダークモード: {model.theme === 'dark' ? 'ON' : 'OFF'}
              </span>
            </div>
            <button
              onClick={model.toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${model.theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${model.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        {/* アカウント管理（管理者のみ） */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 py-2 bg-gray-100 text-sm font-bold text-gray-600">アカウント管理</div>
            <div className="p-4 space-y-4">
              {/* 既存アカウント一覧 */}
              <div className="space-y-2">
                {model.accounts.map(account => {
                  const linkedMember = account.memberId ? model.members.find(m => m.id === account.memberId) : null;
                  return (
                    <div key={account.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{account.id}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${account.role === UserRole.admin ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}>
                          {account.role === UserRole.admin ? '管理者' : '部員'}
                        </span>
                        {linkedMember && (
                          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">→ {linkedMember.name}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">新しいアカウントを追加</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newId}
                    onChange={e => { setNewId(e.target.value); setAccountError(''); }}
                    className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ログインID"
                  />
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 pr-9 text-sm text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="パスワード"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={UserRole.member}>部員</option>
                  <option value={UserRole.admin}>管理者</option>
                </select>

                {newRole === UserRole.member && (
                  <select
                    value={newMemberId}
                    onChange={e => setNewMemberId(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">部員と紐づける（任意）</option>
                    {model.members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.grade}年)</option>
                    ))}
                  </select>
                )}

                {accountError && (
                  <p className="text-xs text-red-500">{accountError}</p>
                )}

                <button
                  onClick={handleAddAccount}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <UserPlus size={16} />
                  アカウントを追加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* データ管理（管理者のみ） */}
        {isAdmin && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-b dark:border-slate-700 flex items-center gap-2">
              <RefreshCw size={16} className="text-blue-500" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">データ管理</span>
            </div>
            <div className="p-4 space-y-6">
              {/* バックアップと復旧 */}
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3 tracking-wider">バックアップと復元 (JSON)</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadBackup}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95 transition-all group"
                  >
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                      <Download size={20} />
                    </div>
                    <span className="text-xs font-bold">エクスポート</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl border border-orange-100 dark:border-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 active:scale-95 transition-all group"
                  >
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                      <Upload size={20} />
                    </div>
                    <span className="text-xs font-bold">インポート</span>
                  </button>
                </div>
              </div>

              {/* テキスト復元（緊急用） */}
              <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">テキストによる手動復元</span>
                  <button
                    onClick={() => {
                      if (importText && model.importDataFromString(importText)) {
                        showToast('✓ データを復元しました');
                        setImportText('');
                      }
                    }}
                    disabled={!importText}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 px-2 py-1 bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700 rounded-lg disabled:opacity-30"
                  >
                    適用
                  </button>
                </div>
                <textarea
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  className="w-full h-16 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2 text-[10px] font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="バックアップ文字列をここに貼り付け..."
                />
              </div>

              {/* レポート出力 */}
              <div className="pt-4 border-t border-gray-50 dark:border-slate-800">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3 tracking-wider">レポート出力 (CSV)</p>
                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 active:scale-95 transition-all shadow-sm"
                >
                  <FileSpreadsheet size={18} />
                  <span className="text-sm font-bold">Excel/スプレッドシート用に出力</span>
                </button>
                <p className="mt-2 text-[10px] text-center text-gray-400 dark:text-gray-500">
                  ※ 全履歴をExcel等で閲覧・編集できる形式で保存します。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg z-50">
          <CheckCircle2 size={15} className="text-green-400 flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
