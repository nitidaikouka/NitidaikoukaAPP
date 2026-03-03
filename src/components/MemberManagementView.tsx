import React, { useState } from 'react';
import { useScoreModel } from '../ScoreContext';
import { Gender } from '../types';
import { X, UserPlus, GraduationCap, User, UserCircle2, Edit2, Search, Trash2, CheckCircle2, Users } from 'lucide-react';
import { sortMembers } from '../utils';

export default function MemberManagementView({ onClose }: { onClose: () => void }) {
  const model = useScoreModel();
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState<Gender>(Gender.male);
  const [newGrade, setNewGrade] = useState<number>(1);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const filteredMembers = sortMembers(model.members).filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map(m => m.id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex justify-between items-center p-4 bg-white border-b sticky top-0 z-20 shadow-sm">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <UserCircle2 className="text-blue-500" size={24} />
          部員管理
        </h2>
        <button onClick={onClose} className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-bold text-sm active:bg-blue-100 transition-colors">
          完了
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Add Member */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2">
            <UserPlus size={16} className="text-blue-500" />
            <span className="text-sm font-bold text-gray-700">新規部員登録</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="relative">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="氏名 (例: 山田 太郎)"
                className="w-full border-b border-gray-200 p-2 focus:outline-none focus:border-blue-500 transition-colors bg-transparent"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 block mb-1">性別</label>
                <select
                  value={newGender}
                  onChange={e => setNewGender(e.target.value as Gender)}
                  className="w-full border border-gray-200 p-2 rounded-lg bg-gray-50 text-sm"
                >
                  <option value={Gender.male}>男子</option>
                  <option value={Gender.female}>女子</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 block mb-1">学年</label>
                <select
                  value={newGrade}
                  onChange={e => setNewGrade(parseInt(e.target.value))}
                  className="w-full border border-gray-200 p-2 rounded-lg bg-gray-50 text-sm"
                >
                  {[1, 2, 3, 4].map(g => <option key={g} value={g}>{g}年生</option>)}
                </select>
              </div>
            </div>
            <button
              disabled={!newName}
              onClick={() => {
                model.addMember(newName, newGender, newGrade);
                setNewName("");
                showToast("✓ 部員を追加しました");
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-30 shadow-sm active:bg-blue-700"
            >
              部員を追加
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="部員を検索..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Active Members */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.length > 0 && selectedIds.length === filteredMembers.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-bold text-gray-700">現役部員 ({filteredMembers.length})</span>
            </div>
            <span className="text-[10px] text-gray-400">タップして詳細編集</span>
          </div>
          <ul className="divide-y divide-gray-50">
            {filteredMembers.map(m => (
              <li key={m.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setEditingMember(m)}>
                <div className="flex items-center gap-3">
                  <div
                    onClick={(e) => { e.stopPropagation(); toggleSelect(m.id); }}
                    className="p-1 -ml-1 hover:bg-gray-100 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(m.id)}
                      readOnly
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                    />
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border ${m.gender === Gender.male ? "bg-blue-100 text-blue-600 border-blue-200" : "bg-red-100 text-red-600 border-red-200"}`}
                    style={m.color ? { backgroundColor: m.color, color: 'white', borderColor: 'transparent' } : {}}
                  >
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{m.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{m.grade}年生</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`${m.name}さんを卒業（OB/OGへ移動）させますか？`)) {
                        model.promoteToAlumni(m.id);
                        showToast("🎓 卒業生へ移動しました");
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                    title="卒業"
                  >
                    <GraduationCap size={18} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); if (window.confirm('削除しますか？')) model.deleteMember(m.id); }} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
            {filteredMembers.length === 0 && (
              <li className="p-8 text-center text-gray-400 text-sm">該当する部員がいません</li>
            )}
          </ul>
        </div>

        {/* Alumni */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-4 py-2 bg-gray-100 text-sm font-bold text-gray-600">卒業生</div>
          <ul className="divide-y">
            {model.alumni.map(a => (
              <li key={a.id} className="flex items-center justify-between p-4">
                <span className="text-gray-500">{a.name}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">{a.graduationYear}</span>
                  <button onClick={() => model.deleteAlumni(a.id)} className="text-red-500 ml-2">
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-100 p-4 pb-8 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] flex items-center justify-between animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
              {selectedIds.length}
            </div>
            <span className="text-sm font-black text-gray-700">選択中</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (window.confirm(`${selectedIds.length}名をまとめて進級させますか？（4年生は卒業処理されます）`)) {
                  model.bulkPromoteGrades(selectedIds);
                  setSelectedIds([]);
                  showToast("✨ 一括進級処理を完了しました");
                }
              }}
              className="flex items-center gap-1.5 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold text-sm active:bg-green-100"
            >
              <Users size={16} /> 進級
            </button>
            <button
              onClick={() => {
                if (window.confirm(`${selectedIds.length}名をまとめて卒業させますか？`)) {
                  model.bulkPromoteToAlumni(selectedIds);
                  setSelectedIds([]);
                  showToast("🎓 一括卒業処理を完了しました");
                }
              }}
              className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-4 py-2 rounded-xl font-bold text-sm active:bg-orange-100"
            >
              <GraduationCap size={16} /> 卒業
            </button>
            <button
              onClick={() => {
                if (window.confirm(`選択した ${selectedIds.length} 名のデータを完全に削除しますか？`)) {
                  model.bulkDeleteMembers(selectedIds);
                  setSelectedIds([]);
                  showToast("🗑️ 一括削除しました");
                }
              }}
              className="flex items-center gap-1.5 bg-red-50 text-red-700 px-4 py-2 rounded-xl font-bold text-sm active:bg-red-100"
            >
              <Trash2 size={16} /> 削除
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingMember(null)}>
          <div className="bg-white p-6 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border-2 shadow-inner ${editingMember.gender === Gender.male ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-red-50 text-red-600 border-red-100"}`}
                style={editingMember.color ? { backgroundColor: editingMember.color, color: 'white', borderColor: 'transparent' } : {}}
              >
                {editingMember.avatarUrl ? (
                  <img src={editingMember.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 size={36} />
                )}
              </div>
              <div>
                <h3 className="font-black text-xl text-gray-800">部員詳細編集</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Profile Settings</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">氏名</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-800"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">性別</label>
                  <select
                    value={editingMember.gender}
                    onChange={e => setEditingMember({ ...editingMember, gender: e.target.value as Gender })}
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800"
                  >
                    <option value={Gender.male}>男子</option>
                    <option value={Gender.female}>女子</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">学年</label>
                  <select
                    value={editingMember.grade}
                    onChange={e => setEditingMember({ ...editingMember, grade: parseInt(e.target.value) })}
                    className="w-full bg-gray-50 border-none p-4 rounded-2xl font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800"
                  >
                    {[1, 2, 3, 4].map(g => <option key={g} value={g}>{g}年生</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block ml-1">プロフィールカラー</label>
                <div className="flex flex-wrap gap-2">
                  {['#1D4ED8', '#059669', '#DC2626', '#7C3AED', '#DB2777', '#EA580C', '#4B5563'].map(c => (
                    <button
                      key={c}
                      onClick={() => setEditingMember({ ...editingMember, color: c })}
                      className={`w-9 h-9 rounded-xl border-2 transition-all active:scale-90 ${editingMember.color === c ? 'border-gray-800 scale-110 shadow-lg' : 'border-transparent opacity-80'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <button
                    onClick={() => setEditingMember({ ...editingMember, color: undefined })}
                    className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-gray-400 active:scale-90 transition-all ${!editingMember.color ? 'border-gray-800 bg-white' : 'border-gray-100 bg-gray-50'}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">アイコン画像URL (任意)</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.png"
                  value={editingMember.avatarUrl || ''}
                  onChange={e => setEditingMember({ ...editingMember, avatarUrl: e.target.value })}
                  className="w-full bg-gray-50 border-none p-4 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-600"
                />
              </div>

              <p className="text-[9px] text-gray-400 px-2 leading-relaxed">
                ※ 氏名を変更すると、過去の記録に含まれる同名のデータもすべて更新されます。
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingMember(null)} className="flex-1 py-4 text-gray-400 font-bold active:bg-gray-100 rounded-2xl transition-all">キャンセル</button>
              <button
                onClick={() => {
                  model.updateMember(editingMember.id, editingMember.name, editingMember.gender, editingMember.grade, editingMember.color, editingMember.avatarUrl);
                  setEditingMember(null);
                  showToast("✓ 部員情報を更新しました");
                }}
                className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl shadow-gray-200 active:scale-95 transition-all"
              >
                変更を保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-900 text-white text-sm px-6 py-4 rounded-[2rem] shadow-2xl z-[60] animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={18} className="text-green-400" />
          <span className="font-bold">{toast}</span>
        </div>
      )}
    </div>
  );
}
