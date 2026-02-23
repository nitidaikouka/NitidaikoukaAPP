import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, SafeAreaView,
    FlatList, StyleSheet, StatusBar
} from 'react-native';
import { useScoreModel } from '../../src/ScoreContext';
import { Gender, Mark } from '../../src/types';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react-native';

export default function AnalysisScreen() {
    const model = useScoreModel();
    const [selectedPeriod, setSelectedPeriod] = useState('月ごと');
    const [selectedGender, setSelectedGender] = useState('全員');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const changeMonth = (offset: number) => {
        const d = new Date(currentMonth);
        d.setMonth(d.getMonth() + offset);
        setCurrentMonth(d);
    };

    const stats = (() => {
        const filtered = model.sessions.filter(s => {
            const d = new Date(s.date);
            if (selectedPeriod === '月ごと') {
                return d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth();
            }
            if (selectedPeriod === 'すべて') return true;
            if (selectedPeriod === '直近1ヶ月') {
                const ago = new Date(); ago.setDate(ago.getDate() - 30); return d >= ago;
            }
            return true;
        });

        const temp: Record<string, { name: string, gender: Gender, grade: number, totalShots: number, totalHits: number }> = {};
        filtered.forEach(session => {
            session.archers.forEach(archer => {
                if (archer.isSeparator || archer.isTotalCalculator || archer.isGuest || !archer.name) return;
                if (selectedGender === '男子' && archer.gender !== Gender.male) return;
                if (selectedGender === '女子' && archer.gender !== Gender.female) return;
                if (!temp[archer.name]) temp[archer.name] = { name: archer.name, gender: archer.gender, grade: archer.grade, totalShots: 0, totalHits: 0 };
                const validMarks = archer.marks.slice(0, session.shotCount);
                const hits = validMarks.filter(m => m === Mark.hit).length;
                const shots = validMarks.filter(m => m !== Mark.none).length;
                if (shots > 0) { temp[archer.name].totalShots += shots; temp[archer.name].totalHits += hits; }
            });
        });
        return Object.values(temp)
            .map(s => ({ ...s, rate: s.totalShots > 0 ? s.totalHits / s.totalShots : 0 }))
            .sort((a, b) => b.rate - a.rate);
    })();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TrendingUp size={20} color="#3b82f6" />
                <Text style={styles.headerTitle}>的中分析</Text>
                <View style={{ width: 20 }} />
            </View>

            <View style={styles.filterSection}>
                <View style={styles.segmentRow}>
                    {['月ごと', 'すべて', '直近1ヶ月'].map(p => (
                        <TouchableOpacity
                            key={p} style={[styles.segBtn, selectedPeriod === p && styles.segBtnActive]}
                            onPress={() => setSelectedPeriod(p)}
                        >
                            <Text style={[styles.segBtnText, selectedPeriod === p && styles.segBtnTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedPeriod === '月ごと' && (
                    <View style={styles.monthNav}>
                        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                            <ChevronLeft size={20} color="#374151" />
                        </TouchableOpacity>
                        <Text style={styles.monthText}>{currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月</Text>
                        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
                            <ChevronRight size={20} color="#374151" />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.segmentRow}>
                    {['全員', '男子', '女子'].map(g => (
                        <TouchableOpacity
                            key={g} style={[styles.segBtn, selectedGender === g && styles.segBtnActive]}
                            onPress={() => setSelectedGender(g)}
                        >
                            <Text style={[styles.segBtnText, selectedGender === g && styles.segBtnTextActive]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: 36 }]}>順位</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'left', paddingLeft: 10 }]}>氏名</Text>
                <Text style={[styles.tableHeaderCell, { width: 72 }]}>的中</Text>
                <Text style={[styles.tableHeaderCell, { width: 60 }]}>的中率</Text>
            </View>

            <FlatList
                data={stats}
                keyExtractor={item => item.name}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={<View style={{ padding: 40, alignItems: 'center' }}><Text style={{ color: '#9ca3af' }}>データなし</Text></View>}
                renderItem={({ item, index }) => (
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: 36, color: '#9ca3af', fontWeight: 'bold' }]}>{index + 1}</Text>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 10 }}>
                            <Text style={[styles.tableCell, { fontWeight: '600' }]}>{item.name}</Text>
                            <Text style={{ fontSize: 11, color: '#9ca3af' }}>({item.grade}年)</Text>
                            <View style={[styles.genderBadge, { backgroundColor: item.gender === Gender.male ? '#eff6ff' : '#fff1f2' }]}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: item.gender === Gender.male ? '#2563eb' : '#e11d48' }}>
                                    {item.gender === Gender.male ? '男' : '女'}
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.tableCell, { width: 72, fontFamily: 'monospace', fontSize: 13, color: '#4b5563' }]}>
                            {item.totalHits}/{item.totalShots}
                        </Text>
                        <Text style={[styles.tableCell, { width: 60, fontWeight: 'bold', color: item.rate >= 0.5 ? '#ef4444' : '#1f2937' }]}>
                            {(item.rate * 100).toFixed(0)}%
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: {
        flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1,
        borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', gap: 8
    },
    headerTitle: { fontWeight: 'bold', fontSize: 18, color: '#111827' },
    filterSection: { backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderColor: '#e5e7eb', gap: 10 },
    segmentRow: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 3 },
    segBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    segBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    segBtnText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
    segBtnTextActive: { fontWeight: 'bold', color: '#111827' },
    monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderRadius: 8, paddingVertical: 2 },
    navBtn: { padding: 10 },
    monthText: { fontWeight: 'bold', fontSize: 15, color: '#1f2937' },
    tableHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderColor: '#e5e7eb' },
    tableHeaderCell: { fontWeight: 'bold', fontSize: 12, color: '#6b7280', textAlign: 'center' },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#f3f4f6', backgroundColor: '#fff' },
    tableCell: { fontSize: 14, textAlign: 'center', color: '#1f2937' },
    genderBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
});
