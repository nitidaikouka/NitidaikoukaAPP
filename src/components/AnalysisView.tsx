import React, { useState } from 'react';
import { useScoreModel } from '../ScoreContext';
import { Gender, Mark } from '../types';
import { UserRole } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AnalysisView() {
  const model = useScoreModel();
  const [selectedPeriod, setSelectedPeriod] = useState('月ごと');
  const [selectedGender, setSelectedGender] = useState('全員');
  const [selectedGrade, setSelectedGrade] = useState('全学年');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'ranking' | 'heatmap' | 'trend'>('ranking');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, date: string, hits: number, shots: number, rate: number } | null>(null);

  const isAdmin = model.currentUser?.role === UserRole.admin;

  const changeMonth = (offset: number) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + offset);
    setCurrentMonth(d);
  };

  const calculatedStats = () => {
    const filteredHistory = model.sessions.filter(session => {
      const d = new Date(session.date);
      if (selectedPeriod === '月ごと') {
        return d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth();
      }
      if (selectedPeriod === 'すべて') return true;
      if (selectedPeriod === '期間指定') {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setDate(end.getDate() + 1);
        return d >= start && d < end;
      }
      if (selectedPeriod === '直近1ヶ月') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return d >= thirtyDaysAgo;
      }
      return true;
    });

    const temp: Record<string, { name: string, gender: Gender, grade: number, totalShots: number, totalHits: number }> = {};

    const heatmapArrows: { x: number, y: number }[] = [];

    filteredHistory.forEach(session => {
      session.archers.forEach(archer => {
        if (archer.isSeparator || archer.isTotalCalculator || archer.isGuest || !archer.name) return;

        // Member-only: filter to logged-in member
        if (!isAdmin && model.currentUser?.memberId) {
          const linkedMember = model.members.find(m => m.id === model.currentUser?.memberId);
          if (linkedMember && archer.name !== linkedMember.name) return;
        }

        if (selectedGender !== '全員') {
          if (selectedGender === '男子' && archer.gender !== Gender.male) return;
          if (selectedGender === '女子' && archer.gender !== Gender.female) return;
        }

        if (selectedGrade !== '全学年') {
          const gradeNum = parseInt(selectedGrade);
          if (archer.grade !== gradeNum) return;
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

        // Collect arrows for heatmap
        if (archer.arrows) {
          archer.arrows.forEach(arrow => {
            if (arrow.shotIndex < session.shotCount) {
              heatmapArrows.push({ x: arrow.x, y: arrow.y });
            }
          });
        }
      });
    });

    const result = Object.values(temp)
      .map(s => ({ ...s, rate: s.totalShots > 0 ? s.totalHits / s.totalShots : 0 }))
      .sort((a, b) => b.rate - a.rate);

    return { stats: result, heatmapArrows };
  };

  const { stats, heatmapArrows } = calculatedStats();
  const maxRate = stats.length > 0 ? Math.max(...stats.map(s => s.rate)) : 1;
  const totalGlobalHits = stats.reduce((sum, s) => sum + s.totalHits, 0);
  const totalGlobalShots = stats.reduce((sum, s) => sum + s.totalShots, 0);
  const globalRate = totalGlobalShots > 0 ? totalGlobalHits / totalGlobalShots : 0;

  const getRateInfo = (rate: number) => {
    if (rate >= 0.8) return { label: '極意', color: 'bg-yellow-100 text-yellow-700', bar: 'from-yellow-400 to-orange-400' };
    if (rate >= 0.5) return { label: '好調', color: 'bg-green-100 text-green-700', bar: 'from-green-400 to-emerald-500' };
    if (rate >= 0.2) return { label: '並', color: 'bg-blue-100 text-blue-700', bar: 'from-blue-400 to-indigo-500' };
    return { label: '不調', color: 'bg-gray-100 text-gray-700', bar: 'from-gray-300 to-gray-400' };
  };

  const genderBadge = (gender: Gender) =>
    gender === Gender.male ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600';

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 transition-colors">
        <h2 className="font-bold text-lg text-center dark:text-gray-100">的中分析</h2>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 shadow-sm z-10 space-y-3 transition-colors">
        {/* Global Summary */}
        <div className="flex gap-2 mb-1">
          <div className="flex-1 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100/50 dark:border-blue-900/30">
            <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase mb-0.5">全体的中率</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-700 dark:text-blue-200">{(globalRate * 100).toFixed(1)}</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">%</span>
            </div>
          </div>
          <div className="flex-1 bg-gray-50/50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-slate-700">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase mb-0.5">総射数 / 総的中</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{totalGlobalShots}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">射</span>
              <span className="mx-1 text-gray-300 dark:text-gray-600">/</span>
              <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{totalGlobalHits}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">中</span>
            </div>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {['月ごと', 'すべて', '期間指定', '直近1ヶ月'].map(p => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`flex-1 py-1.5 text-xs rounded-lg transition-all ${selectedPeriod === p ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {p}
            </button>
          ))}
        </div>

        {selectedPeriod === '月ごと' && (
          <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 p-2 rounded-lg transition-colors">
            <button onClick={() => changeMonth(-1)} className="p-2 text-gray-600 dark:text-gray-400"><ChevronLeft size={20} /></button>
            <span className="font-bold dark:text-gray-200">{currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月</span>
            <button onClick={() => changeMonth(1)} className="p-2 text-gray-600 dark:text-gray-400"><ChevronRight size={20} /></button>
          </div>
        )}

        {selectedPeriod === '期間指定' && (
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/50 p-2 rounded-lg transition-colors">
            <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="flex-1 bg-transparent border-none text-sm dark:text-gray-200" />
            <span className="dark:text-gray-400">〜</span>
            <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="flex-1 bg-transparent border-none text-sm dark:text-gray-200" />
          </div>
        )}

        {/* Gender filter */}
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl transition-colors">
          {['全員', '男子', '女子'].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`flex-1 py-1.5 text-sm rounded-lg transition-all ${selectedGender === g ? 'bg-white dark:bg-slate-700 shadow dark:shadow-none text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Grade filter */}
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg transition-colors">
          {['全学年', '1年', '2年', '3年', '4年'].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`flex-1 py-1 text-xs rounded-md transition-all ${selectedGrade === g ? 'bg-white dark:bg-slate-700 shadow dark:shadow-none font-bold dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* View Switch */}
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl transition-colors relative">
          {[
            { id: 'ranking', label: 'ランキング' },
            { id: 'heatmap', label: 'ヒートマップ' },
            { id: 'trend', label: '推移グラフ' }
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id as any)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative z-10 ${viewMode === v.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {v.label}
              {viewMode === v.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow dark:shadow-none -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {viewMode === 'heatmap' ? (
            <motion.div
              key="heatmap"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-col items-center transition-colors"
            >
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-6">的中位置の分布 ({heatmapArrows.length}射)</h3>
              <div className="relative w-full max-w-[300px] aspect-square rounded-full border-4 border-gray-800 dark:border-gray-700 shadow-xl overflow-hidden bg-white dark:bg-slate-950 transition-colors">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Simplified Target Rings */}
                  <circle cx="50" cy="50" r="48.5" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-500" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-500" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-500" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-500" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" className="text-gray-800 dark:text-gray-500" strokeWidth="0.5" />
                  {/* Heatmap Dots */}
                  {heatmapArrows.map((a, i) => (
                    <circle
                      key={i}
                      cx={a.x * 100}
                      cy={a.y * 100}
                      r="2"
                      fill="currentColor"
                      className="text-blue-600/40 dark:text-blue-400/40 mix-blend-multiply dark:mix-blend-screen"
                    />
                  ))}
                  {/* Grid Lines for reference */}
                  <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" className="text-gray-400/10 dark:text-gray-500/10" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-gray-400/10 dark:text-gray-500/10" strokeWidth="0.5" />
                </svg>
              </div>
              <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                矢が密集している場所ほど濃く表示されます。<br />
                狙いの偏りや「癖」を把握するのに役立ててください。
              </p>
            </motion.div>
          ) : viewMode === 'trend' ? (
            <motion.div
              key="trend"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 transition-colors"
            >
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center justify-between">
                的中率推移
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-blue-500"></div>
                    <span className="text-[10px] text-gray-400">的中率</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-orange-400"></div>
                    <span className="text-[10px] text-gray-400">5回移動平均</span>
                  </div>
                </div>
              </h3>

              {/* Trend Graph Implementation */}
              {(() => {
                const trendData = model.sessions
                  .filter(s => {
                    const d = new Date(s.date);
                    // Apply same timeframe filter as ranking
                    if (selectedPeriod === '月ごと') return d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth();
                    if (selectedPeriod === '直近1ヶ月') {
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return d >= thirtyDaysAgo;
                    }
                    if (selectedPeriod === '期間指定') {
                      const start = new Date(customStartDate);
                      const end = new Date(customEndDate);
                      end.setDate(end.getDate() + 1);
                      return d >= start && d < end;
                    }
                    return true;
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(s => {
                    let shots = 0;
                    let hits = 0;
                    s.archers.forEach(a => {
                      if (a.isSeparator || a.isTotalCalculator || a.isGuest || !a.name) return;
                      if (!isAdmin && model.currentUser?.memberId) {
                        const linkedMember = model.members.find(m => m.id === model.currentUser?.memberId);
                        if (linkedMember && a.name !== linkedMember.name) return;
                      }
                      if (selectedGender !== '全員' && ((selectedGender === '男子' && a.gender !== Gender.male) || (selectedGender === '女子' && a.gender !== Gender.female))) return;
                      if (selectedGrade !== '全学年' && a.grade !== parseInt(selectedGrade)) return;

                      const valid = a.marks.slice(0, s.shotCount);
                      hits += valid.filter(m => m === Mark.hit).length;
                      shots += valid.filter(m => m !== Mark.none).length;
                    });
                    return { date: new Date(s.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }), rate: shots > 0 ? (hits / shots) : null, hits, shots };
                  })
                  .filter(d => d.rate !== null);

                if (trendData.length < 2) return <div className="h-48 flex items-center justify-center text-gray-400 text-sm">データが不足しています</div>;

                // Calculate Moving Average (Window: 5)
                const movingAverage = trendData.map((d, i) => {
                  const window = trendData.slice(Math.max(0, i - 4), i + 1);
                  const sum = window.reduce((a, b) => a + (b.rate || 0), 0);
                  return sum / window.length;
                });

                const width = 300;
                const height = 150;
                const padding = 20;

                const getX = (i: number) => padding + (i / (trendData.length - 1)) * (width - padding * 2);
                const getY = (rate: number) => height - padding - (rate * (height - padding * 2));

                const points = trendData.map((d, i) => `${getX(i)},${getY(d.rate!)}`).join(' ');
                const maPoints = movingAverage.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');

                return (
                  <div className="relative group/chart">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                      {/* Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map(lvl => (
                        <g key={lvl}>
                          <line x1={padding} y1={getY(lvl)} x2={width - padding} y2={getY(lvl)} stroke="currentColor" className="text-gray-100 dark:text-slate-800" strokeWidth="0.5" />
                          <text x={padding - 5} y={getY(lvl)} textAnchor="end" alignmentBaseline="middle" className="text-[6px] fill-gray-400">{lvl * 100}%</text>
                        </g>
                      ))}

                      {/* Moving Average Line */}
                      <polyline fill="none" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={maPoints} opacity="0.6" />

                      {/* Main Trend Line */}
                      <polyline fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />

                      {/* Interactive Points */}
                      {trendData.map((d, i) => (
                        <circle
                          key={i}
                          cx={getX(i)}
                          cy={getY(d.rate!)}
                          r="3"
                          className="fill-white stroke-blue-600 cursor-pointer hover:r-5 transition-all"
                          strokeWidth="1.5"
                          onMouseEnter={() => setHoveredPoint({ x: getX(i), y: getY(d.rate!), date: d.date, hits: d.hits, shots: d.shots, rate: d.rate! })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}
                    </svg>

                    {/* Tooltip */}
                    {hoveredPoint && (
                      <div
                        className="absolute bg-slate-800 text-white p-2 rounded-lg text-[10px] shadow-xl pointer-events-none z-20 animate-in fade-in zoom-in duration-200"
                        style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: hoveredPoint.y - 40, transform: 'translateX(-50%)' }}
                      >
                        <div className="font-bold border-b border-slate-700 pb-1 mb-1">{hoveredPoint.date}</div>
                        <div>的中: {hoveredPoint.hits}/{hoveredPoint.shots}</div>
                        <div>的中率: {(hoveredPoint.rate * 100).toFixed(1)}%</div>
                      </div>
                    )}
                  </div>
                );
              })()}
              <p className="mt-6 text-[10px] text-gray-400 dark:text-gray-500 text-center">
                セッションごとの的中率の推移です。点をホバーすると詳細が表示されます。
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="ranking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-sm dark:shadow-none overflow-hidden border dark:border-slate-800 transition-colors"
            >
              <div className="flex items-center p-3 bg-gray-50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-xs font-bold text-gray-600 dark:text-gray-400">
                <div className="w-8 text-center">#</div>
                <div className="flex-1">氏名</div>
                <div className="w-20 text-center">的中</div>
                <div className="w-16 text-right">率</div>
              </div>

              <ul className="divide-y dark:divide-slate-800">
                {stats.length === 0 ? (
                  <li className="p-8 text-center text-gray-500 dark:text-gray-400">データがありません</li>
                ) : (
                  stats.map((stat, index) => {
                    const info = getRateInfo(stat.rate);
                    const barWidth = maxRate > 0 ? (stat.rate / maxRate) * 100 : 0;
                    return (
                      <motion.li
                        key={stat.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3.5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-8 flex-shrink-0 text-center text-sm font-black text-gray-300 dark:text-gray-600 italic">{index + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-gray-800 dark:text-gray-200">{stat.name}</span>
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${info.color.replace(' text-', ' dark:text-').replace(' bg-', ' dark:bg-opacity-20 bg-')}`}>
                                {info.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">({stat.grade}年)</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${genderBadge(stat.gender).replace(' bg-', ' dark:bg-opacity-20 bg-').replace(' text-', ' dark:text-')}`}>
                                {stat.gender === Gender.male ? '男子' : '女子'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <div className={`font-black text-lg leading-tight ${stat.rate >= 0.5 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {(stat.rate * 100).toFixed(1)}<span className="text-[10px] ml-0.5">%</span>
                            </div>
                            <div className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{stat.totalHits}/{stat.totalShots}中</div>
                          </div>
                        </div>
                        {/* Inline bar graph */}
                        <div className="ml-8 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner flex items-center transition-colors">
                          <div
                            className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r shadow-sm ${info.bar}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </motion.li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
