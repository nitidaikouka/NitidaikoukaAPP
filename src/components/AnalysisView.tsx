import React, { useState } from 'react';
import { useScoreModel } from '../ScoreContext';
import { Gender, Mark } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AnalysisView() {
  const model = useScoreModel();
  const [selectedPeriod, setSelectedPeriod] = useState("月ごと");
  const [selectedGender, setSelectedGender] = useState("全員");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

  const changeMonth = (offset: number) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + offset);
    setCurrentMonth(d);
  };

  const calculatedStats = () => {
    const filteredHistory = model.sessions.filter(session => {
      const d = new Date(session.date);
      if (selectedPeriod === "月ごと") {
        return d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth();
      }
      if (selectedPeriod === "すべて") return true;
      if (selectedPeriod === "期間指定") {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setDate(end.getDate() + 1);
        return d >= start && d < end;
      }
      if (selectedPeriod === "直近1ヶ月") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return d >= thirtyDaysAgo;
      }
      return true;
    });

    const temp: Record<string, { name: string, gender: Gender, grade: number, totalShots: number, totalHits: number }> = {};

    filteredHistory.forEach(session => {
      session.archers.forEach(archer => {
        if (archer.isSeparator || archer.isTotalCalculator || archer.isGuest || !archer.name) return;

        if (selectedGender !== "全員") {
          if (selectedGender === "男子" && archer.gender !== Gender.male) return;
          if (selectedGender === "女子" && archer.gender !== Gender.female) return;
        }

        if (!temp[archer.name]) {
          temp[archer.name] = { name: archer.name, gender: archer.gender, grade: archer.grade, totalShots: 0, totalHits: 0 };
        }

        const validMarks = archer.marks.slice(0, session.shotCount);
        const hits = validMarks.filter(m => m === Mark.hit).length;
        const shots = validMarks.filter(m => m !== Mark.none).length;

        if (shots > 0) {
          temp[archer.name].totalShots += shots;
          temp[archer.name].totalHits += hits;
        }
      });
    });

    return Object.values(temp)
      .map(s => ({ ...s, rate: s.totalShots > 0 ? s.totalHits / s.totalShots : 0 }))
      .sort((a, b) => b.rate - a.rate);
  };

  const stats = calculatedStats();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 bg-white border-b">
        <h2 className="font-bold text-lg text-center">的中分析</h2>
      </div>

      <div className="p-4 bg-white shadow-sm z-10 space-y-4">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {["月ごと", "すべて", "期間指定", "直近1ヶ月"].map(p => (
            <button 
              key={p} 
              onClick={() => setSelectedPeriod(p)}
              className={`flex-1 py-1 text-sm rounded-md ${selectedPeriod === p ? 'bg-white shadow font-bold' : 'text-gray-600'}`}
            >
              {p}
            </button>
          ))}
        </div>

        {selectedPeriod === "月ごと" && (
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
            <button onClick={() => changeMonth(-1)} className="p-2"><ChevronLeft size={20} /></button>
            <span className="font-bold">{currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月</span>
            <button onClick={() => changeMonth(1)} className="p-2"><ChevronRight size={20} /></button>
          </div>
        )}

        {selectedPeriod === "期間指定" && (
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
            <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="flex-1 bg-transparent border-none text-sm" />
            <span>〜</span>
            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="flex-1 bg-transparent border-none text-sm" />
          </div>
        )}

        <div className="flex bg-gray-100 p-1 rounded-lg">
          {["全員", "男子", "女子"].map(g => (
            <button 
              key={g} 
              onClick={() => setSelectedGender(g)}
              className={`flex-1 py-1 text-sm rounded-md ${selectedGender === g ? 'bg-white shadow font-bold' : 'text-gray-600'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center p-3 bg-gray-50 border-b text-sm font-bold text-gray-600">
            <div className="w-10 text-center">順位</div>
            <div className="flex-1">氏名</div>
            <div className="w-16 text-center">的中</div>
            <div className="w-16 text-center">率</div>
          </div>
          
          <ul className="divide-y">
            {stats.length === 0 ? (
              <li className="p-8 text-center text-gray-500">データなし</li>
            ) : (
              stats.map((stat, index) => (
                <li key={stat.name} className="flex items-center p-3 hover:bg-gray-50">
                  <div className="w-10 text-center font-bold text-gray-400">{index + 1}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-medium">{stat.name}</span>
                    <span className="text-[10px] text-gray-400">({stat.grade}年)</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${stat.gender === Gender.male ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                      {stat.gender.charAt(0)}
                    </span>
                  </div>
                  <div className="w-16 text-center font-mono text-sm">{stat.totalHits}/{stat.totalShots}</div>
                  <div className={`w-16 text-center font-bold ${stat.rate >= 0.5 ? 'text-red-500' : 'text-gray-800'}`}>
                    {(stat.rate * 100).toFixed(1)}%
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
