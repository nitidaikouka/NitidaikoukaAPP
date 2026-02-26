import React, { useState, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Modal,
    TextInput, StyleSheet, Alert, SafeAreaView, StatusBar,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useScoreModel } from '../../src/ScoreContext';
import { Mark, Archer, Gender } from '../../src/types';
import {
    Plus, Users, Settings2, RotateCcw, RotateCw,
    Trash2, ChevronLeft, ChevronRight, Save, Menu, X,
    Lock, Unlock, LayoutList, Sigma, FileUp
} from 'lucide-react-native';

const CELL_HEIGHT = 44;
const NAME_CELL_HEIGHT = 80;
const HEADER_CELL_HEIGHT = 44;

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
    const [showItemMenu, setShowItemMenu] = useState<{ id: string, type: 'separator' | 'total' } | null>(null);
    const [showMemberSelect, setShowMemberSelect] = useState<string | null>(null);
    const [customShotCount, setCustomShotCount] = useState(model.shotsPerRound.toString());

    const handleAddArcher = () => { model.addArcher(); };
    const handleAddSeparator = () => { model.addSeparator(); };
    const handleAddTotal = () => { model.addTotalCalculator(); };

    const handleReset = () => {
        Alert.alert('リセット', '現在の記録をすべて消去しますか？（保存はされません）', [
            { text: 'キャンセル', style: 'cancel' },
            {
                text: 'リセット', style: 'destructive', onPress: () => {
                    model.resetCurrentSession();
                    setShowMenu(false);
                }
            }
        ]);
    };

    const handleSave = () => {
        model.saveSessionAndReset('');
        Alert.alert('保存完了', '記録を保存しました。履歴タブから確認できます。');
    };

    const handleBackup = () => {
        const json = model.exportDataToString();
        Alert.alert('バックアップ', '以下の文字列をコピーして保存してください。\n\n' + json, [
            { text: '閉じる' }
        ]);
    };

    const handleImport = () => {
        Alert.alert('復元', '復元方法を選択してください。', [
            { text: 'キャンセル', style: 'cancel' },
            {
                text: 'ファイルから復元',
                onPress: async () => {
                    const success = await model.importDataFromPicker();
                    if (success) Alert.alert('復元完了', 'データを正常に復元しました。');
                }
            },
            {
                text: 'コードを入力',
                onPress: () => {
                    Alert.prompt('コード入力', 'バックアップ文字列を貼り付けてください。', [
                        { text: 'キャンセル', style: 'cancel' },
                        {
                            text: '復元',
                            onPress: (code) => {
                                if (code && model.importDataFromCode(code)) {
                                    Alert.alert('復元完了', 'データを正常に復元しました。');
                                } else {
                                    Alert.alert('エラー', '無効なコードです。');
                                }
                            }
                        }
                    ]);
                }
            }
        ]);
    };

    const sortedMembers = [...model.members].sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        if (a.gender !== b.gender) {
            return a.gender === Gender.male ? -1 : 1;
        }
        return a.name.localeCompare(b.name, 'ja');
    });

    const QUICK_SHOTS = [4, 8, 12, 16, 20, 24];

    const syncColor = model.syncStatus === 'synced' ? '#22c55e' : model.syncStatus === 'pending' ? '#3b82f6' : '#ef4444';

    const scrollRef = useRef<ScrollView>(null);

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

            {/* クイックアクションバー */}
            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleAddArcher}>
                    <Users size={18} color="#3b82f6" />
                    <Text style={styles.actionBtnText}>人を追加</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={handleAddSeparator}>
                    <LayoutList size={18} color="#10b981" />
                    <Text style={styles.actionBtnText}>間隔</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={handleAddTotal}>
                    <Sigma size={18} color="#f59e0b" />
                    <Text style={styles.actionBtnText}>合計</Text>
                </TouchableOpacity>
            </View>

            {/* 記録グリッド - 縦横スクロールとスティッキーヘッダーの両立 */}
            <View style={{ flex: 1 }}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={{ minWidth: '100%', flexDirection: 'row-reverse' }}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
                >
                    <View style={{ width: Math.max(0, model.archers.length + 1) * 52, height: '100%' }}>
                        <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]} contentContainerStyle={{ paddingBottom: 100 }}>
                            {/* スティッキーヘッダー部分 */}
                            <View style={[styles.stickyHeaderArea, { flexDirection: 'row-reverse' }]}>
                                {/* 行番号のカラム頭 */}
                                <View style={styles.rowHeaderCol}>
                                    <View style={styles.headerCell} />
                                    <View style={[styles.nameCell, { backgroundColor: '#f9fafb' }]} />
                                </View>

                                {model.archers.map((archer) => {
                                    if (archer.isSeparator) {
                                        return (
                                            <TouchableOpacity key={archer.id} style={[styles.archerCol, { width: 32 }]} onPress={() => setShowItemMenu({ id: archer.id, type: 'separator' })}>
                                                <View style={styles.headerCell} />
                                                <View style={[styles.nameCell, { backgroundColor: '#f3f4f6' }]} />
                                            </TouchableOpacity>
                                        );
                                    }
                                    if (archer.isTotalCalculator) {
                                        const groupArchers = model.getGroupArchers(archer.id);
                                        const grandTotal = groupArchers.reduce((sum, a) => sum + a.marks.filter(m => m === Mark.hit).length, 0);
                                        return (
                                            <View key={archer.id} style={[styles.archerCol, { backgroundColor: '#eff6ff' }]}>
                                                <TouchableOpacity style={[styles.headerCell, { backgroundColor: '#3b82f6' }]} onPress={() => setShowItemMenu({ id: archer.id, type: 'total' })}>
                                                    <Text style={styles.totalText}>{grandTotal}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.nameCell} onPress={() => setShowItemMenu({ id: archer.id, type: 'total' })}>
                                                    <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 13 }}>計</Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    }
                                    const totalHits = archer.marks.filter(m => m === Mark.hit).length;
                                    const displayName = model.getDisplayName(archer.name);
                                    return (
                                        <View key={archer.id} style={styles.archerCol}>
                                            <TouchableOpacity style={[styles.headerCell, { backgroundColor: '#fefce8' }]} onPress={() => setShowArcherMenu(archer.id)}>
                                                <Text style={styles.archerTotalText}>{totalHits}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.nameCell} onPress={() => setShowMemberSelect(archer.id)}>
                                                <Text style={styles.archerName} numberOfLines={2}>{archer.name ? displayName : '選択'}</Text>
                                                {archer.grade > 0 && <Text style={styles.archerGrade}>{archer.grade}年</Text>}
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* 各射の記録行 */}
                            {Array.from({ length: model.shotsPerRound }).map((_, i) => {
                                const index = model.shotsPerRound - 1 - i;
                                const isSep = index % 4 === 0 && index !== 0;

                                return (
                                    <View key={index} style={{ flexDirection: 'row-reverse', width: '100%' }}>
                                        {/* 行番号カラム */}
                                        <View style={styles.rowHeaderCol}>
                                            <View style={[styles.cell, { backgroundColor: '#f9fafb' }, isSep && styles.blockBorder]}>
                                                <Text style={styles.rowNumber}>{index + 1}</Text>
                                            </View>
                                        </View>

                                        {/* 各アーチャーのセル列 */}
                                        {model.archers.map((archer) => {
                                            if (archer.isSeparator) {
                                                return (
                                                    <View key={archer.id} style={[styles.archerCol, { width: 32 }]}>
                                                        <View style={[styles.cell, { backgroundColor: '#f3f4f6' }, isSep && styles.blockBorder]} />
                                                    </View>
                                                );
                                            }
                                            if (archer.isTotalCalculator) {
                                                const groupArchers = model.getGroupArchers(archer.id);
                                                const isBlockBottom = index % 4 === 0;
                                                const isLocked = model.lockedBlocks[`${archer.id}-${index}`];
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
                                                        <TouchableOpacity
                                                            style={[styles.cell, isSep && styles.blockBorder, { position: 'relative' }]}
                                                            disabled={!isBlockBottom}
                                                            onPress={() => isBlockBottom && model.toggleLock(archer.id, index)}
                                                        >
                                                            {blockTotal !== null && <Text style={styles.blockTotalText}>{blockTotal}</Text>}
                                                            {isBlockBottom && (
                                                                <View style={styles.lockIconContainer}>
                                                                    {isLocked ? <Lock size={10} color="#ef4444" /> : <Unlock size={10} color="#9ca3af" />}
                                                                </View>
                                                            )}
                                                        </TouchableOpacity>
                                                    </View>
                                                );
                                            }

                                            const calculatorId = model.getCalculatorForArcher(archer.id);
                                            const mark = archer.marks[index] ?? Mark.none;
                                            const blockIndex = Math.floor(index / 4) * 4;
                                            const isLocked = !!(calculatorId && model.lockedBlocks[`${calculatorId}-${blockIndex}`]);

                                            return (
                                                <View key={archer.id} style={styles.archerCol}>
                                                    <TouchableOpacity
                                                        style={[styles.cell, isSep && styles.blockBorder, isLocked && { backgroundColor: '#f3f4f6' }]}
                                                        onPress={() => !isLocked && model.toggleMark(archer.id, index)}
                                                        disabled={isLocked}
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
            </View>

            {/* モーダル類 */}
            {/* メニューモーダル */}
            <Modal visible={showMenu} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardAvoidingView}
                    >
                        <TouchableOpacity activeOpacity={1} style={styles.sideMenu}>
                            <View style={styles.menuHeader}>
                                <Text style={styles.menuTitle}>設定・操作</Text>
                                <TouchableOpacity onPress={() => setShowMenu(false)}><X size={24} color="#374151" /></TouchableOpacity>
                            </View>

                            <View style={styles.menuSection}>
                                <Text style={styles.menuSectionTitle}>矢数設定</Text>
                                <View style={styles.quickShotRow}>
                                    {QUICK_SHOTS.map(n => (
                                        <TouchableOpacity
                                            key={n}
                                            style={[styles.quickShotBtn, model.shotsPerRound === n && styles.quickShotBtnActive]}
                                            onPress={() => { model.setShotsPerRound(n); setCustomShotCount(n.toString()); }}
                                        >
                                            <Text style={[styles.quickShotText, model.shotsPerRound === n && styles.quickShotTextActive]}>{n}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.shotInputRow}>
                                    <TextInput
                                        style={styles.shotInput}
                                        value={customShotCount}
                                        onChangeText={setCustomShotCount}
                                        keyboardType="number-pad"
                                        placeholder="任意"
                                    />
                                    <TouchableOpacity
                                        style={styles.shotApplyBtn}
                                        onPress={() => {
                                            const n = parseInt(customShotCount);
                                            if (n > 0) model.setShotsPerRound(n);
                                        }}
                                    >
                                        <Text style={styles.shotApplyBtnText}>適用</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.menuSection}>
                                <Text style={styles.menuSectionTitle}>バックアップ・復元</Text>
                                <TouchableOpacity style={styles.menuItem} onPress={model.exportDataToFile}>
                                    <Save size={20} color="#3b82f6" />
                                    <Text style={styles.menuItemText}>ファイルとして保存 (シェア)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={handleBackup}>
                                    <RotateCw size={20} color="#3b82f6" />
                                    <Text style={styles.menuItemText}>コードを表示 (コピー用)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={handleImport}>
                                    <FileUp size={20} color="#10b981" />
                                    <Text style={styles.menuItemText}>ファイル・コードから復元</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.menuSection}>
                                <Text style={styles.menuSectionTitle}>データ管理</Text>
                                <TouchableOpacity style={styles.menuItem} onPress={handleSave}>
                                    <Save size={20} color="#3b82f6" />
                                    <Text style={styles.menuItemText}>現在の記録を保存してリセット</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={handleReset}>
                                    <Trash2 size={20} color="#ef4444" />
                                    <Text style={[styles.menuItemText, { color: '#ef4444' }]}>保存せずにすべてリセット</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </Modal>

            {/* メンバー選択モーダル */}
            <Modal visible={!!showMemberSelect} transparent animationType="slide">
                <View style={[styles.bottomSheet, { height: '80%', marginTop: 'auto' }]}>
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
                            <Text style={styles.memberItemName}>（未選択・ゲスト）</Text>
                        </TouchableOpacity>
                        {sortedMembers.map(m => (
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
                        <View style={{ height: 40 }} />
                        <TouchableOpacity
                            style={[styles.memberItem, { borderBottomWidth: 0, backgroundColor: '#fef2f2', borderRadius: 12, marginBottom: 20 }]}
                            onPress={() => {
                                if (showMemberSelect) model.deleteArcher(showMemberSelect);
                                setShowMemberSelect(null);
                            }}
                        >
                            <Trash2 size={20} color="#ef4444" />
                            <Text style={[styles.memberItemName, { color: '#ef4444', marginLeft: 12 }]}>この列を削除する</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* アイテム操作メニュー（間隔・計） */}
            <Modal visible={!!showItemMenu} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowItemMenu(null)}>
                    <View style={styles.centerMenu}>
                        <Text style={styles.menuSectionTitle}>{showItemMenu?.type === 'separator' ? '間隔' : '合計計算'}の操作</Text>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => { model.deleteArcher(showItemMenu!.id); setShowItemMenu(null); }}
                        >
                            <Trash2 size={20} color="#ef4444" />
                            <Text style={[styles.menuItemText, { color: '#ef4444' }]}>削除する</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* アーチャー個別メニュー */}
            <Modal visible={!!showArcherMenu} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowArcherMenu(null)}>
                    <View style={styles.centerMenu}>
                        <Text style={styles.menuSectionTitle}>この人の操作</Text>
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
    actionBar: {
        flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8,
        gap: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#fff'
    },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#f9fafb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
        borderWidth: 1, borderColor: '#e5e7eb'
    },
    actionBtnText: { fontSize: 13, fontWeight: '600', color: '#4b5563' },
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    keyboardAvoidingView: { flex: 1, justifyContent: 'flex-end' },
    sideMenu: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 60, maxHeight: '90%' },
    menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    menuTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    menuSection: { marginBottom: 32 },
    menuSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#6b7280', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    menuItemText: { fontSize: 16, color: '#374151', fontWeight: '500' },
    shotInputRow: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'center' },
    shotInput: { flex: 1, backgroundColor: '#f3f4f6', height: 44, borderRadius: 10, paddingHorizontal: 16, fontSize: 16, fontWeight: 'bold' },
    shotApplyBtn: { backgroundColor: '#111827', paddingHorizontal: 20, height: 44, borderRadius: 10, justifyContent: 'center' },
    shotApplyBtnText: { color: '#fff', fontWeight: 'bold' },
    bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    bottomSheetTitle: { fontSize: 18, fontWeight: 'bold' },
    memberList: { flex: 1 },
    memberItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    memberItemName: { fontSize: 16, fontWeight: '600', color: '#111827' },
    memberItemSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    centerMenu: { backgroundColor: '#fff', margin: 40, borderRadius: 16, padding: 24, alignSelf: 'center', width: '80%', maxWidth: 400 },
    lockIconContainer: { position: 'absolute', top: 2, right: 2 },
    quickShotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    quickShotBtn: { flex: 1, minWidth: '30%', backgroundColor: '#f3f4f6', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
    quickShotBtnActive: { backgroundColor: '#111827', borderColor: '#111827' },
    quickShotText: { fontSize: 13, color: '#4b5563', fontWeight: 'bold' },
    quickShotTextActive: { color: '#fff' },
});
