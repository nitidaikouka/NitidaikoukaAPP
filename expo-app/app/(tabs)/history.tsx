import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Alert,
    StyleSheet, SafeAreaView, FlatList, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useScoreModel } from '../../src/ScoreContext';
import {
    Trash2, ArrowLeft, Calendar, FileText, CheckCircle2,
    Cloud, RefreshCw, ChevronRight
} from 'lucide-react-native';

export default function HistoryScreen() {
    const model = useScoreModel();
    const router = useRouter();
    const [showTrash, setShowTrash] = useState(false);
    const [secretTapCount, setSecretTapCount] = useState(0);

    const getFiscalYear = (date: number | string) => {
        const d = new Date(date);
        const month = d.getMonth() + 1;
        return month >= 4 ? d.getFullYear() : d.getFullYear() - 1;
    };

    const availableYears = Array.from(new Set<number>(model.sessions.map(s => getFiscalYear(s.date)))).sort((a, b) => b - a);
    const [selectedYear, setSelectedYear] = useState<number | null>(availableYears[0] || null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

    const getAvailableMonths = (year: number) => {
        const filtered = model.sessions.filter(s => getFiscalYear(s.date) === year);
        const months = Array.from(new Set<number>(filtered.map(s => new Date(s.date).getMonth() + 1)));
        return months.sort((a, b) => {
            const o1 = a < 4 ? a + 12 : a;
            const o2 = b < 4 ? b + 12 : b;
            return o2 - o1;
        });
    };

    const months = selectedYear ? getAvailableMonths(selectedYear) : [];
    const currentMonth = selectedMonth ?? (months[0] || null);

    const filteredSessions = model.sessions.filter(s => {
        const d = new Date(s.date);
        return getFiscalYear(s.date) === selectedYear && (d.getMonth() + 1) === currentMonth;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (model.sessions.length === 0 && model.trash.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>履歴がありません</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {showTrash && (
                        <TouchableOpacity onPress={() => setShowTrash(false)}>
                            <ArrowLeft size={24} color="#374151" />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.headerTitle}>
                        {showTrash ? 'ゴミ箱' : '過去の記録表'}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    {!showTrash && (
                        <TouchableOpacity onPress={() => setShowTrash(true)} style={styles.iconButton}>
                            <Trash2 size={22} color="#6b7280" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {showTrash ? (
                <FlatList
                    data={model.trash}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={styles.empty}><Text style={styles.emptyText}>ゴミ箱は空です</Text></View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.sessionCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sessionDate}>
                                    {new Date(item.date).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    style={styles.btnRestore}
                                    onPress={() => model.restoreSession(item.id)}
                                >
                                    <RefreshCw size={14} color="#2563eb" />
                                    <Text style={{ color: '#2563eb', fontSize: 13, fontWeight: 'bold' }}>復元</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.btnDelete}
                                    onPress={() => Alert.alert('完全に削除', 'この操作は取り消せません。', [
                                        { text: 'キャンセル', style: 'cancel' },
                                        { text: '削除', style: 'destructive', onPress: () => model.permanentlyDeleteSession(item.id) }
                                    ])}
                                >
                                    <Trash2 size={14} color="#ef4444" />
                                    <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: 'bold' }}>削除</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            ) : (
                <>
                    <View style={styles.filterBar}>
                        <View style={styles.yearRow}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                                {availableYears.map(y => (
                                    <TouchableOpacity
                                        key={y}
                                        style={[styles.yearBtn, selectedYear === y && styles.yearBtnActive]}
                                        onPress={() => {
                                            setSelectedYear(y);
                                            setSelectedMonth(null);
                                        }}
                                    >
                                        <Text style={[styles.yearBtnText, selectedYear === y && { color: '#fff' }]}>{y}年度</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.monthRow}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                                {months.map(m => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[styles.monthBtn, currentMonth === m && styles.monthBtnActive]}
                                        onPress={() => setSelectedMonth(m)}
                                    >
                                        <Text style={[styles.monthBtnText, currentMonth === m && { color: '#fff' }]}>{m}月</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    <FlatList
                        data={filteredSessions}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            <View style={styles.empty}><Text style={styles.emptyText}>データがありません</Text></View>
                        }
                        renderItem={({ item }) => {
                            const d = new Date(item.date);
                            const dateStr = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
                            const archerCount = item.archers.filter(a => !a.isSeparator && !a.isTotalCalculator).length;
                            const isSynced = !item.syncStatus || item.syncStatus === 'synced';
                            return (
                                <TouchableOpacity
                                    style={styles.sessionCard}
                                    onPress={() => router.push({ pathname: '/session-detail', params: { sessionId: item.id } })}
                                >
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Calendar size={14} color="#9ca3af" />
                                            <Text style={styles.sessionDate}>{dateStr}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, alignItems: 'center' }}>
                                            <View style={styles.metaBadge}>
                                                <Text style={styles.metaBadgeText}>{item.shotCount}本</Text>
                                            </View>
                                            <View style={[styles.metaBadge, { backgroundColor: '#dcfce7' }]}>
                                                <Text style={[styles.metaBadgeText, { color: '#166534' }]}>{archerCount}人</Text>
                                            </View>
                                            {item.note && <FileText size={14} color="#9ca3af" />}
                                            {isSynced ? <CheckCircle2 size={14} color="#22c55e" /> : <Cloud size={14} color="#3b82f6" />}
                                        </View>
                                    </View>
                                    <ChevronRight size={20} color="#d1d5db" />
                                </TouchableOpacity>
                            );
                        }}
                    />
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb'
    },
    headerTitle: { fontWeight: 'bold', fontSize: 18, color: '#111827' },
    iconButton: { padding: 4 },
    adminBadge: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    adminBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
    yearRow: { paddingTop: 12, paddingBottom: 8 },
    yearBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
    yearBtnActive: { backgroundColor: '#2563eb' },
    yearBtnText: { fontWeight: 'bold', fontSize: 14, color: '#374151' },
    monthRow: { paddingBottom: 12 },
    monthBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e5e7eb' },
    monthBtnActive: { backgroundColor: '#2563eb' },
    monthBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
    sessionCard: {
        backgroundColor: '#fff', padding: 16, borderBottomWidth: 1,
        borderColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center'
    },
    sessionDate: { fontWeight: 'bold', fontSize: 16, color: '#1f2937' },
    metaBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    metaBadgeText: { fontSize: 11, color: '#4b5563', fontWeight: 'bold' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 100 },
    emptyText: { color: '#9ca3af', fontSize: 16 },
    btnRestore: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe'
    },
    btnDelete: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca'
    },
});
