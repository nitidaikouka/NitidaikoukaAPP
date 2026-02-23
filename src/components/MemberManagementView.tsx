import React, { useState } from 'react';
import { useScoreModel } from '../ScoreContext';
import { Gender } from '../types';
import { X } from 'lucide-react';
import { sortMembers } from '../utils';

export default function MemberManagementView({ onClose }: { onClose: () => void }) {
  const model = useScoreModel();
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState<Gender>(Gender.male);
  const [newGrade, setNewGrade] = useState<number>(1);
  const [editingMember, setEditingMember] = useState<any>(null);

  const sortedMembers = sortMembers(model.members);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <h2 className="font-bold text-lg">部員管理</h2>
        <button onClick={onClose} className="text-blue-500 font-bold">完了</button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Add Member */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 text-sm font-bold text-gray-600">新規部員登録</div>
          <div className="p-4 space-y-4">
            <input 
              type="text" 
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              placeholder="氏名 (例: 山田 太郎)"
              className="w-full border-b p-2 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-4">
              <select 
                value={newGender} 
                onChange={e => setNewGender(e.target.value as Gender)}
                className="flex-1 border p-2 rounded bg-white"
              >
                <option value={Gender.male}>男子</option>
                <option value={Gender.female}>女子</option>
              </select>
              <select 
                value={newGrade} 
                onChange={e => setNewGrade(parseInt(e.target.value))}
                className="flex-1 border p-2 rounded bg-white"
              >
                {[1, 2, 3, 4].map(g => <option key={g} value={g}>{g}年生</option>)}
              </select>
            </div>
            <button 
              disabled={!newName}
              onClick={() => {
                model.addMember(newName, newGender, newGrade);
                setNewName("");
              }}
              className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
            >
              追加
            </button>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 text-sm font-bold text-gray-600">現役部員 (タップして編集)</div>
          <ul className="divide-y">
            {sortedMembers.map(m => (
              <li key={m.id} className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setEditingMember(m)}>
                <span className="font-medium">{m.name}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">{m.grade}年</span>
                  <span className={m.gender === Gender.male ? "text-blue-500" : "text-red-500"}>{m.gender}</span>
                  <button onClick={(e) => { e.stopPropagation(); model.deleteMember(m.id); }} className="text-red-500 ml-2">
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
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

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingMember(null)}>
          <div className="bg-white p-4 rounded-lg w-80" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">部員情報を編集</h3>
            <input 
              type="text" 
              value={editingMember.name} 
              onChange={e => setEditingMember({...editingMember, name: e.target.value})}
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex gap-4 mb-4">
              <select 
                value={editingMember.gender} 
                onChange={e => setEditingMember({...editingMember, gender: e.target.value as Gender})}
                className="flex-1 border p-2 rounded bg-white"
              >
                <option value={Gender.male}>男子</option>
                <option value={Gender.female}>女子</option>
              </select>
              <select 
                value={editingMember.grade} 
                onChange={e => setEditingMember({...editingMember, grade: parseInt(e.target.value)})}
                className="flex-1 border p-2 rounded bg-white"
              >
                {[1, 2, 3, 4].map(g => <option key={g} value={g}>{g}年生</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-500 mb-4">名前を変更すると、過去の記録に含まれる同名のデータもすべて更新されます。</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingMember(null)} className="px-3 py-1 text-gray-600">キャンセル</button>
              <button 
                onClick={() => {
                  model.updateMember(editingMember.id, editingMember.name, editingMember.gender, editingMember.grade);
                  setEditingMember(null);
                }} 
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
