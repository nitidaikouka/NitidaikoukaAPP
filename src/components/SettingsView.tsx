import React, { useState, useRef } from 'react';
import { useScoreModel } from '../ScoreContext';
import { Copy, RefreshCw, Download, Upload, FileSpreadsheet } from 'lucide-react';

export default function SettingsView() {
  const model = useScoreModel();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState("");

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
        alert("データを復元しました");
      } else {
        alert("形式が不正です");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExportCSV = () => {
    let csv = "日付,氏名,学年,性別,的中数,矢数,的中率\n";
    model.history.forEach(record => {
      const date = new Date(record.date).toLocaleDateString('ja-JP');
      record.entries.forEach(entry => {
        const rate = entry.totalShots > 0 ? (entry.hits / entry.totalShots * 100).toFixed(1) + "%" : "0%";
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
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white border-b">
        <h2 className="font-bold text-lg text-center">設定・データ管理</h2>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 text-sm font-bold text-gray-600">データのバックアップ</div>
          <div className="p-4">
            <button onClick={handleDownloadBackup} className="flex items-center gap-2 text-blue-500 font-medium w-full p-2 hover:bg-blue-50 rounded">
              <Download size={20} /> バックアップファイルとして保存 (.json)
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 text-sm font-bold text-gray-600">データの復元</div>
          <div className="p-4 space-y-4">
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef}
              onChange={handleFileImport}
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="flex items-center justify-center gap-2 text-red-500 font-medium w-full p-2 hover:bg-red-50 rounded border border-red-200"
            >
              <Upload size={20} /> ファイルからデータを復元する
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">またはテキストで復元</span>
              </div>
            </div>

            <textarea 
              value={importText} 
              onChange={e => setImportText(e.target.value)}
              className="w-full h-32 border border-gray-300 rounded-lg p-2 text-sm font-mono"
              placeholder="ここにバックアップデータを貼り付けてください..."
            />
            <button 
              disabled={!importText}
              onClick={() => {
                if (model.importDataFromString(importText)) {
                  alert("データを復元しました");
                  setImportText("");
                } else {
                  alert("形式が不正です");
                }
              }} 
              className="flex items-center justify-center gap-2 text-red-500 font-medium w-full p-2 hover:bg-red-50 rounded disabled:opacity-50"
            >
              <RefreshCw size={20} /> テキストからデータを復元する
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 text-sm font-bold text-gray-600">レポート出力</div>
          <div className="p-4">
            <button onClick={handleExportCSV} className="flex items-center gap-2 text-green-600 font-medium w-full p-2 hover:bg-green-50 rounded">
              <FileSpreadsheet size={20} /> 過去の全記録をCSVで書き出す
            </button>
            <p className="text-xs text-gray-500 mt-2 px-2">
              ※Excelなどで開いて集計や印刷に利用できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
