import React, { useState, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Modal,
    TextInput, StyleSheet, Alert, SafeAreaView, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useScoreModel } from '../../src/ScoreContext';
import { Mark, Archer, Gender } from '../../src/types';
import {
    Plus, Users, Settings2, RotateCcw, RotateCw,
    Trash2, ChevronLeft, ChevronRight, Save, Menu, X
} from 'lucide-react-native';

const CELL_HEIGHT = 42;

const getMarkColor = (mark: Mark) => {
    if (mark === Mark.hit) return '#ef4444';
    if (mark === Mark.miss) return '#1f2937';
    return 'transparent';
};

export default function RecordScreen() {
    const model = useScoreModel();
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const [showArcherMenu, setShowArcherMenu] = useState<string | null>(null);
    const [showMemberSelect, setShowMemberSelect] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleAddArcher = () => {
        model.addArcher();
        setShowMenu(false);
    };

    const handleAddSeparator = () => {
        model.addSeparator();
        setShowMenu(false);
    };

    const handleAddTotal = () => {
        model.addTotalCalculator();
        setShowMenu(false);
    };

    const handleReset = () => {
        Alert.alert('リセット', '現在の記録をすべて消去しますか？', [
            { text: 'キャンセル', style: 'cancel' },
            {
                text: 'リセット', style: 'destructive', onPress: () => {
                    // 簡易的なリセット実装（既存のロジックに合わせて）
                    // 本来は model に reset 関数があるのが理想だが、今の定義に合わせて調整
                    Alert.alert('情報', '現在は「保存してリセット」のみサポートされています。そのままリセットする場合は保存ボタンを押してください。');
                    setShowMenu(false);
                }
            }
        ]);
    };

    const handleSave = () => {
        model.saveSessionAndReset('');
        Alert.alert('保存完了', '記録を保存しました。履歴タブから確認できます。');
    };

    const syncIcon = model.syncStatus === 'synced' ? 'check-circle-2' : model.syncStatus === 'pending' ? 'cloud-upload' : 'cloud-off';
    const syncColor = model.syncStatus === 'synced' ? '#22c55e' : model.syncStatus === 'pending' ? '#3b82f6' : '#ef4444';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* プレミアムヘッダー */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={[styles.statusDot, { backgroundColor: syncColor }]} />
                    <View>
                        <Text style={styles.headerTitle}>現在の記録表</Text>
                        <Text style={styles.headerSubtitle}>{model.shotsPerRound}本設定</Text>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: '#f3f4f6' }]}
                        onPress={() => model.undo()}
                        disabled={!model.canUndo}
                    >
                        <RotateCcw size={20} color={model.canUndo ? '#374151' : '#9ca3af'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: '#f3f4f6' }]}
                        onPress={() => model.redo()}
                        disabled={!model.canRedo}
                    >
                        <RotateCw size={20} color={model.canRedo ? '#374151' : '#9ca3af'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#3b82f6' }]} onPress={handleSave}>
                        <Save size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#1f2937' }]} onPress={() => setShowMenu(true)}>
                        <Menu size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 記録グリッド */}
            <ScrollView horizontal ref={scrollViewRef} contentContainerStyle={{ flexDirection: 'row-reverse' }}>
                <View style={{ flexDirection: 'row-reverse' }}>
                    {/* 行番号 */}
                    <View style={styles.rowHeaderCol}>
                        <View style={styles.headerCell} />
                        {Array.from({ length: model.shotsPerRound }).map((_, i) => {
                            const index = model.shotsPerRound - 1 - i;
                            const isSep = index % 4 === 0 && index !== 0;
                            return (
                                <View key={index} style={[styles.cell, { backgroundColor: '#f9fafb' }, isSep && styles.blockBorder]}>
                                    <Text style={styles.rowNumber}>{index + 1}</Text>
                                </View>
                            );
                        })}
                        <View style={[styles.nameCell, { backgroundColor: '#f9fafb' }]} />
                    </View>

                    {/* アーチャー列 */}
                    {model.archers.map((archer) => {
                        if (archer.isSeparator) {
                            return (
                                <TouchableOpacity
                                    key={archer.id}
                                    style={[styles.archerCol, { width: 32 }]}
                                    onLongPress={() => model.deleteArcher(archer.id)}
                                >
                                    <View style={styles.headerCell} />
                                    {Array.from({ length: model.shotsPerRound }).map((_, i) => {
                                        const index = model.shotsPerRound - 1 - i;
                                        const isSep = index % 4 === 0 && index !== 0;
                                        return <View key={index} style={[styles.cell, { backgroundColor: '#f3f4f6' }, isSep && styles.blockBorder]} />;
                                    })}
                                    <View style={[styles.nameCell, { backgroundColor: '#f3f4f6' }]} />
                                </TouchableOpacity>
                            );
                        }

                        if (archer.isTotalCalculator) {
                            const groupArchers = model.getGroupArchers(archer.id);
                            const grandTotal = groupArchers.reduce((sum, a) => sum + a.marks.filter(m => m === Mark.hit).length, 0);
                            return (
                                <TouchableOpacity
                                    key={archer.id}
                                    style={[styles.archerCol, { backgroundColor: '#eff6ff' }]}
                                    onLongPress={() => model.deleteArcher(archer.id)}
                                >
                                    <View style={[styles.headerCell, { backgroundColor: '#3b82f6' }]}>
                                        <Text style={styles.totalText}>{grandTotal}</Text>
                                    </View>
                                    {Array.from({ length: model.shotsPerRound }).map((_, i) => {
                                        const index = model.shotsPerRound - 1 - i;
                                        const isBlockBottom = index % 4 === 0;
                                        const isSep = isBlockBottom && index !== 0;
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
                                            <View key={index} style={[styles.cell, isSep && styles.blockBorder]}>
                                                {blockTotal !== null && <Text style={styles.blockTotalText}>{blockTotal}</Text>}
                                            </View>
                                        );
                                    })}
                                    <View style={styles.nameCell}>
                                        <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 13 }}>計</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }

                        const totalHits = archer.marks.filter(m => m === Mark.hit).length;
                        const displayName = model.getDisplayName(archer.name);

                        return (
                            <View key={archer.id} style={styles.archerCol}>
                                <TouchableOpacity
                                    style={[styles.headerCell, { backgroundColor: '#fefce8' }]}
                                    onPress={() => setShowArcherMenu(archer.id)}
                                >
                                    <Text style={styles.archerTotalText}>{totalHits}</Text>
                                </TouchableOpacity>
                                {Array.from({ length: model.shotsPerRound }).map((_, i) => {
                                    const index = model.shotsPerRound - 1 - i;
                                    const mark = archer.marks[index] ?? Mark.none;
                                    const isSep = index % 4 === 0 && index !== 0;
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.cell, isSep && styles.blockBorder]}
                                            onPress={() => model.toggleMark(archer.id, index)}
                                        >
                                            <Text style={{ color: getMarkColor(mark), fontWeight: 'bold', fontSize: 20 }}>
                                                {mark || ' '}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                                <TouchableOpacity
                                    style={styles.nameCell}
                                    onPress={() => setShowMemberSelect(archer.id)}
                                >
                                    <Text style={styles.archerName} numberOfLines={2}>
                                        {archer.name ? displayName : '選択'}
                                    </Text>
                                    {archer.grade > 0 && <Text style={styles.archerGrade}>{archer.grade}年</Text>}
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* メニューモーダル */}
            <Modal visible={showMenu} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
                    <View style={styles.sideMenu} onStartShouldSetResponder={() => true}>
                        <View style={styles.menuHeader}>
                            <Text style={styles.menuTitle}>メニュー</Text>
                            <TouchableOpacity onPress={() => setShowMenu(false)}><X size={24} color="#374151" /></TouchableOpacity>
                        </View>

                        <View style={styles.menuSection}>
                            <Text style={styles.menuSectionTitle}>矢数設定</Text>
                            <View style={styles.shotCountRow}>
                                {[4, 8, 12, 16, 20].map(n => (
                                    <TouchableOpacity
                                        key={n}
                                        style={[styles.shotBtn, model.shotsPerRound === n && styles.shotBtnActive]}
                                        onPress={() => model.setShotsPerRound(n)}
                                    >
                                        <Text style={[styles.shotBtnText, model.shotsPerRound === n && styles.shotBtnTextActive]}>{n}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.menuSection}>
                            <Text style={styles.menuSectionTitle}>追加・操作</Text>
                            <TouchableOpacity style={styles.menuItem} onPress={handleAddArcher}>
                                <Users size={20} color="#374151" />
                                <Text style={styles.menuItemText}>人を追加</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={handleAddSeparator}>
                                <Plus size={20} color="#374151" />
                                <Text style={styles.menuItemText}>区切りを追加</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={handleAddTotal}>
                                <Plus size={20} color="#374151" />
                                <Text style={styles.menuItemText}>合計計算を追加</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={handleReset}>
                                <Trash2 size={20} color="#ef4444" />
                                <Text style={[styles.menuItemText, { color: '#ef4444' }]}>すべてリセット</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* メンバー選択モーダル */}
            <Modal visible={!!showMemberSelect} transparent animationType="slide">
                <View style={styles.bottomSheet}>
                    <View style={styles.bottomSheetHeader}>
                        <Text style={styles.bottomSheetTitle}>メンバーを選択</Text>
                        <TouchableOpacity onPress={() => setShowMemberSelect(null)}><X size={24} color="#374151" /></TouchableOpacity>
                    </View>
                    <ScrollView style={styles.memberList}>
                        <TouchableOpacity
                            style={styles.memberItem}
                            onPress={() => {
                                model.updateArcherInfo(showMemberSelect!, '', Gender.male, 0, false);
                                setShowMemberSelect(null);
                            }}
                        >
                            <Text style={styles.memberItemName}>（未選択）</Text>
                        </TouchableOpacity>
                        {model.members.map(m => (
                            <TouchableOpacity
                                key={m.id}
                                style={styles.memberItem}
                                onPress={() => {
                                    model.updateArcherInfo(showMemberSelect!, m.name, m.gender, m.grade, false);
                                    setShowMemberSelect(null);
                                }}
                            >
                                <View>
                                    <Text style={styles.memberItemName}>{m.name}</Text>
                                    <Text style={styles.memberItemSub}>{m.grade}年 · {m.gender}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>

            {/* アーチャー個別メニュー */}
            <Modal visible={!!showArcherMenu} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowArcherMenu(null)}>
                    <View style={styles.centerMenu} onStartShouldSetResponder={() => true}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { model.deleteArcher(showArcherMenu!); setShowArcherMenu(null); }}
                        >
                            <Trash2 size={20} color="#ef4444" />
                            <Text style={[styles.menuItemText, { color: '#ef4444' }]}>この人を削除</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff'
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    headerTitle: { fontWeight: 'bold', fontSize: 16, color: '#111827' },
    headerSubtitle: { fontSize: 11, color: '#6b7280' },
    headerActions: { flexDirection: 'row', gap: 8 },
    iconButton: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    rowHeaderCol: { width: 32, borderRightWidth: 1, borderColor: '#e5e7eb' },
    archerCol: { width: 50, borderRightWidth: 1, borderColor: '#e5e7eb' },
    headerCell: {
        height: CELL_HEIGHT, alignItems: 'center', justifyContent: 'center',
        borderBottomWidth: 1, borderColor: '#111827'
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
    nameCell: {
        height: 72, alignItems: 'center', justifyContent: 'center',
        borderBottomWidth: 1, borderColor: '#111827', backgroundColor: '#f9fafb', padding: 4
    },
    archerName: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#374151' },
    archerGrade: { fontSize: 9, color: '#9ca3af', marginTop: 1 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
    sideMenu: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    menuTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    menuSection: { marginBottom: 24 },
    menuSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#6b7280', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    menuItemText: { fontSize: 16, color: '#374151', fontWeight: '500' },
    shotCountRow: { flexDirection: 'row', gap: 8 },
    shotBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center' },
    shotBtnActive: { backgroundColor: '#3b82f6' },
    shotBtnText: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
    shotBtnTextActive: { color: '#fff' },
    bottomSheet: { flex: 1, backgroundColor: '#fff', marginTop: 100, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    bottomSheetTitle: { fontSize: 18, fontWeight: 'bold' },
    memberList: { flex: 1 },
    memberItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    memberItemName: { fontSize: 16, fontWeight: '600', color: '#111827' },
    memberItemSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    centerMenu: { backgroundColor: '#fff', margin: 40, borderRadius: 16, padding: 16, alignSelf: 'center' },
});
