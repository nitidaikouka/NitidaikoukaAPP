import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Alert,
    StyleSheet, SafeAreaView, StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useScoreModel } from '../src/ScoreContext';
import { Mark } from '../src/types';
import { ArrowLeft, Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react-native';

const CELL_HEIGHT = 44;
const NAME_CELL_HEIGHT = 80;
const HEADER_CELL_HEIGHT = 44;

const getMarkColor = (mark: Mark) => {
    if (mark === Mark.hit) return '#ef4444';
    if (mark === Mark.miss) return '#1f2937';
    return 'transparent';
};

export default function SessionDetailScreen() {
    const { sessionId: initialSessionId } = useLocalSearchParams<{ sessionId: string }>();
    const model = useScoreModel();
    const router = useRouter();

    const [currentSessionId, setCurrentSessionId] = useState(initialSessionId);
    const sessionIndex = model.sessions.findIndex(s => s.id === currentSessionId);
    const session = model.sessions[sessionIndex];

    const goToSession = (offset: number) => {
        const nextIndex = sessionIndex + offset;
        if (nextIndex >= 0 && nextIndex < model.sessions.length) {
            setCurrentSessionId(model.sessions[nextIndex].id);
        }
    };

    if (!session) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.empty}><Text style={styles.emptyText}>セッションが見つかりません</Text></View>
            </SafeAreaView>
        );
    }

    const dateStr = new Date(session.date).toLocaleDateString('ja-JP', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* プレミアムヘッダー */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: 44 }}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <ArrowLeft size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerCenter}>
                    <TouchableOpacity
                        onPress={() => goToSession(1)}
                        disabled={sessionIndex === model.sessions.length - 1}
                        style={{ padding: 8, opacity: sessionIndex === model.sessions.length - 1 ? 0.3 : 1 }}
                    >
                        <ChevronLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{dateStr}</Text>
                    <TouchableOpacity
                        onPress={() => goToSession(-1)}
                        disabled={sessionIndex === 0}
                        style={{ padding: 8, opacity: sessionIndex === 0 ? 0.3 : 1 }}
                    >
                        <ChevronRight size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => Alert.alert('削除', 'この記録表を削除しますか？', [
                        { text: 'キャンセル', style: 'cancel' },
                        { text: 'ゴミ箱に移動', style: 'destructive', onPress: () => { model.deleteSession(session.id); router.back(); } }
                    ])}
                    style={[styles.iconButton, { width: 44 }]}
                >
                    <Trash2 size={22} color="#ef4444" />
                </TouchableOpacity>
            </View>

            {/* メタ情報 */}
            <View style={styles.metaBar}>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>矢数:</Text>
                    <Text style={styles.metaValue}>{session.shotCount}本</Text>
                </View>
                {session.note ? (
                    <View style={[styles.metaItem, { borderLeftWidth: 1, borderColor: '#e5e7eb', flex: 1, paddingLeft: 16 }]}>
                        <FileText size={14} color="#6b7280" />
                        <Text style={styles.metaNote} numberOfLines={1}>{session.note}</Text>
                    </View>
                ) : null}
            </View>

            {/* 記録グリッド - 縦横スクロールとスティッキーヘッダー */}
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={{ flexDirection: 'row-reverse' }}>
                    <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]} contentContainerStyle={{ paddingBottom: 100 }}>

                        {/* スティッキーヘッダー部分 */}
                        <View style={styles.stickyHeaderArea}>
                            <View style={styles.rowHeaderCol}>
                                <View style={styles.headerCell} />
                                <View style={[styles.nameCell, { backgroundColor: '#f9fafb' }]} />
                            </View>

                            {session.archers.map((archer) => {
                                if (archer.isSeparator) {
                                    return (
                                        <View key={archer.id} style={[styles.archerCol, { width: 32 }]}>
                                            <View style={styles.headerCell} />
                                            <View style={[styles.nameCell, { backgroundColor: '#f3f4f6' }]} />
                                        </View>
                                    );
                                }
                                if (archer.isTotalCalculator) {
                                    const groupArchers = model.getHistoryGroupArchers(session.id, archer.id);
                                    const grandTotal = groupArchers.reduce((sum, a) => sum + a.marks.filter(m => m === Mark.hit).length, 0);
                                    return (
                                        <View key={archer.id} style={[styles.archerCol, { backgroundColor: '#eff6ff' }]}>
                                            <View style={[styles.headerCell, { backgroundColor: '#3b82f6' }]}>
                                                <Text style={styles.totalText}>{grandTotal}</Text>
                                            </View>
                                            <View style={styles.nameCell}>
                                                <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>計</Text>
                                            </View>
                                        </View>
                                    );
                                }
                                const totalHits = archer.marks.filter(m => m === Mark.hit).length;
                                const displayName = model.getDisplayName(archer.name);
                                return (
                                    <View key={archer.id} style={styles.archerCol}>
                                        <View style={[styles.headerCell, { backgroundColor: '#fefce8' }]}>
                                            <Text style={styles.archerTotalText}>{totalHits}</Text>
                                        </View>
                                        <View style={styles.nameCell}>
                                            <Text style={styles.archerName} numberOfLines={2}>{archer.name ? displayName : '—'}</Text>
                                            {archer.grade > 0 && <Text style={styles.archerGrade}>{archer.grade}年</Text>}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* 各射の記録行 */}
                        {Array.from({ length: session.shotCount }).map((_, i) => {
                            const index = session.shotCount - 1 - i;
                            const isSep = index % 4 === 0 && index !== 0;

                            return (
                                <View key={index} style={{ flexDirection: 'row-reverse' }}>
                                    {/* 行番号カラム */}
                                    <View style={styles.rowHeaderCol}>
                                        <View style={[styles.cell, { backgroundColor: '#f9fafb' }, isSep && styles.blockBorder]}>
                                            <Text style={styles.rowNumber}>{index + 1}</Text>
                                        </View>
                                    </View>

                                    {session.archers.map((archer) => {
                                        if (archer.isSeparator) {
                                            return (
                                                <View key={archer.id} style={[styles.archerCol, { width: 32 }]}>
                                                    <View style={[styles.cell, { backgroundColor: '#f3f4f6' }, isSep && styles.blockBorder]} />
                                                </View>
                                            );
                                        }
                                        if (archer.isTotalCalculator) {
                                            const groupArchers = model.getHistoryGroupArchers(session.id, archer.id);
                                            const isBlockBottom = index % 4 === 0;
                                            const isSepLocal = isBlockBottom && index !== 0;
                                            let blockTotal: number | null = null;
                                            if (isBlockBottom) {
                                                blockTotal = groupArchers.reduce((sum, a) => {
                                                    let hits = 0;
                                                    for (let offset = 0; offset < 4; offset++) {
                                                        const ti = index + offset;
                                                        if (ti < a.marks.length && a.marks[ti] === Mark.hit) hits++;
                                                    }
                                                    return sum + hits;
                                                }, 0);
                                            }
                                            return (
                                                <View key={archer.id} style={[styles.archerCol, { backgroundColor: '#eff6ff' }]}>
                                                    <View style={[styles.cell, isSepLocal && styles.blockBorder]}>
                                                        {blockTotal !== null && <Text style={styles.blockTotalText}>{blockTotal}</Text>}
                                                    </View>
                                                </View>
                                            );
                                        }
                                        const mark = archer.marks[index] ?? Mark.none;

                                        return (
                                            <View key={archer.id} style={styles.archerCol}>
                                                <TouchableOpacity
                                                    style={[styles.cell, isSep && styles.blockBorder]}
                                                    onPress={() => model.toggleHistoryMark(session.id, archer.id, index)}
                                                >
                                                    <Text style={{ color: getMarkColor(mark), fontWeight: 'bold', fontSize: 20 }}>
                                                        {mark || ' '}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#9ca3af', fontSize: 16 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff'
    },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
    headerTitle: { fontWeight: 'bold', fontSize: 14, color: '#111827', textAlign: 'center' },
    iconButton: { height: 40, alignItems: 'center', justifyContent: 'center' },
    metaBar: {
        flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10,
        backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb', alignItems: 'center'
    },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 16 },
    metaLabel: { fontSize: 11, color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' },
    metaValue: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
    metaNote: { fontSize: 13, color: '#6b7280', flex: 1 },
    stickyHeaderArea: { flexDirection: 'row-reverse', borderBottomWidth: 1, borderBottomColor: '#111827', backgroundColor: '#fff' },
    rowHeaderCol: { width: 32, borderRightWidth: 1, borderColor: '#e5e7eb' },
    archerCol: { width: 52, borderRightWidth: 1, borderColor: '#e5e7eb' },
    headerCell: {
        height: HEADER_CELL_HEIGHT, alignItems: 'center', justifyContent: 'center',
        borderBottomWidth: 1, borderColor: '#e5e7eb'
    },
    nameCell: {
        height: NAME_CELL_HEIGHT, alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f9fafb', padding: 4
    },
    cell: {
        height: CELL_HEIGHT, alignItems: 'center', justifyContent: 'center',
        borderBottomWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff'
    },
    blockBorder: { borderBottomWidth: 2, borderColor: '#111827' },
    rowNumber: { fontSize: 10, color: '#9ca3af', fontWeight: 'bold' },
    totalText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
    blockTotalText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 16 },
    archerTotalText: { color: '#2563eb', fontWeight: 'bold', fontSize: 17 },
    archerName: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#374151' },
    archerGrade: { fontSize: 9, color: '#9ca3af', marginTop: 1 },
});
