import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Modal, Alert, StyleSheet, SafeAreaView, FlatList, StatusBar,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { useScoreModel } from '../../src/ScoreContext';
import { Gender } from '../../src/types';
import {
    UserPlus, Settings, UserMinus, Edit2, GraduationCap, X, Check
} from 'lucide-react-native';

export default function SettingsScreen() {
    const model = useScoreModel();
    const [showAddMember, setShowAddMember] = useState(false);
    const [newName, setNewName] = useState('');
    const [newGender, setNewGender] = useState<Gender>(Gender.male);
    const [newGrade, setNewGrade] = useState(1);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tab, setTab] = useState<'members' | 'alumni'>('members');

    const sortedMembers = [...model.members].sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        if (a.gender !== b.gender) {
            return a.gender === Gender.male ? -1 : 1;
        }
        return a.name.localeCompare(b.name, 'ja');
    });

    const openAdd = () => {
        setEditingId(null);
        setNewName(''); setNewGender(Gender.male); setNewGrade(1);
        setShowAddMember(true);
    };

    const openEdit = (m: any) => {
        setEditingId(m.id);
        setNewName(m.name); setNewGender(m.gender); setNewGrade(m.grade);
        setShowAddMember(true);
    };

    const handleSave = () => {
        if (!newName.trim()) return;
        if (editingId) {
            model.updateMember(editingId, newName.trim(), newGender, newGrade);
        } else {
            model.addMember(newName.trim(), newGender, newGrade);
        }
        setShowAddMember(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <Settings size={20} color="#3b82f6" />
                <Text style={styles.headerTitle}>設定</Text>
                <View style={{ width: 20 }} />
            </View>

            <View style={styles.tabRow}>
                {(['members', 'alumni'] as const).map(t => (
                    <TouchableOpacity
                        key={t} style={[styles.tab, tab === t && styles.tabActive]}
                        onPress={() => setTab(t)}
                    >
                        <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                            {t === 'members' ? `部員 (${model.members.length})` : `OB/OG (${model.alumni.length})`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {tab === 'members' ? (
                <>
                    <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
                        <UserPlus size={20} color="#fff" />
                        <Text style={styles.addBtnText}>部員を追加</Text>
                    </TouchableOpacity>
                    <FlatList
                        data={sortedMembers}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={<View style={{ padding: 40, alignItems: 'center' }}><Text style={{ color: '#9ca3af' }}>部員がいません</Text></View>}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.memberRow} onPress={() => openEdit(item)}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.memberName}>{item.name}</Text>
                                    <Text style={styles.memberMeta}>{item.grade}年 · {item.gender}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
                                        <Edit2 size={16} color="#3b82f6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.iconBtn, { backgroundColor: '#fef2f2' }]}
                                        onPress={() => Alert.alert('削除', `${item.name}を削除しますか？`, [
                                            { text: 'キャンセル', style: 'cancel' },
                                            { text: '削除', style: 'destructive', onPress: () => model.deleteMember(item.id) }
                                        ])}
                                    >
                                        <UserMinus size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </>
            ) : null}

            {/* 部員追加モーダル */}
            <Modal visible={showAddMember} transparent animationType="slide" onRequestClose={() => setShowAddMember(false)}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ width: '100%', justifyContent: 'flex-end' }}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                    >
                        <TouchableOpacity activeOpacity={1} onPress={() => { }} style={styles.menuCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{editingId ? '部員情報を編集' : '部員を追加'}</Text>
                                <TouchableOpacity onPress={() => setShowAddMember(false)}><X size={24} color="#374151" /></TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>氏名</Text>
                                <TextInput style={styles.textInput} value={newName} onChangeText={setNewName} placeholder="例: 日本 太郎" autoFocus />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>性別</Text>
                                <View style={styles.toggleRow}>
                                    {([Gender.male, Gender.female] as const).map(g => (
                                        <TouchableOpacity
                                            key={g}
                                            style={[styles.toggleBtn, newGender === g && styles.toggleBtnActive]}
                                            onPress={() => setNewGender(g)}
                                        >
                                            <Text style={[styles.toggleText, newGender === g && styles.toggleTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>学年</Text>
                                <View style={styles.toggleRow}>
                                    {[1, 2, 3, 4].map(g => (
                                        <TouchableOpacity
                                            key={g}
                                            style={[styles.toggleBtn, newGrade === g && styles.toggleBtnActive]}
                                            onPress={() => setNewGrade(g)}
                                        >
                                            <Text style={[styles.toggleText, newGrade === g && styles.toggleTextActive]}>{g}年</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Check size={20} color="#fff" />
                                <Text style={styles.saveBtnText}>保存する</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

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
    tabRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
    tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderColor: '#3b82f6' },
    tabText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
    tabTextActive: { color: '#3b82f6', fontWeight: 'bold' },
    addBtn: {
        margin: 16, backgroundColor: '#3b82f6', padding: 14, borderRadius: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4
    },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    memberRow: {
        flexDirection: 'row', alignItems: 'center', padding: 16,
        backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f3f4f6'
    },
    memberName: { fontWeight: 'bold', fontSize: 16, color: '#1f2937' },
    memberMeta: { color: '#6b7280', fontSize: 13, marginTop: 2 },
    iconBtn: { backgroundColor: '#eff6ff', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    menuCard: {
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontWeight: 'bold', fontSize: 20, color: '#111827' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' },
    textInput: {
        borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 16,
        paddingVertical: 12, fontSize: 16, backgroundColor: '#f9fafb'
    },
    toggleRow: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 10, padding: 3, gap: 4 },
    toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    toggleText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
    toggleTextActive: { fontWeight: 'bold', color: '#111827' },
    saveBtn: {
        backgroundColor: '#111827', padding: 16, borderRadius: 12, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10
    },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    roleAdmin: { backgroundColor: '#fee2e2' },
    roleMember: { backgroundColor: '#f3f4f6' },
    roleText: { fontSize: 10, fontWeight: 'bold', color: '#374151' },
    linkBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    linkText: { fontSize: 10, color: '#3b82f6', fontWeight: '600' },
    miniChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
    miniChipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
    miniChipText: { fontSize: 12, color: '#6b7280' },
    miniChipTextActive: { color: '#fff', fontWeight: 'bold' },
});
