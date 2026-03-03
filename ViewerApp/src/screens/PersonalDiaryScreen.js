import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus, Trash2, X, Target as TargetIcon } from 'lucide-react-native';
import TargetView from '../components/TargetView';

export default function PersonalDiaryScreen() {
    const [records, setRecords] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentTarget, setCurrentTarget] = useState('kasumi_12'); // kasumi_12, hoshi_12, hoshi_8
    const [currentPoints, setCurrentPoints] = useState([]);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        try {
            const stored = await AsyncStorage.getItem('personal_records_v2');
            if (stored) setRecords(JSON.parse(stored));
        } catch (e) { console.error(e); }
    };

    const handleTargetPress = (point) => {
        // 的の範囲内判定（中心からの距離が1.0以内なら的中扱いとする簡易ロジック）
        const dist = Math.sqrt(point.x * point.x + point.y * point.y);
        const isHit = dist <= 1.0;
        setCurrentPoints([...currentPoints, { ...point, isHit }]);
    };

    const saveRecord = async () => {
        if (currentPoints.length === 0) {
            Alert.alert('エラー', '矢の場所を記録してください');
            return;
        }
        const hits = currentPoints.filter(p => p.isHit).length;
        const newRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            targetType: currentTarget,
            points: currentPoints,
            hits: hits,
            total: currentPoints.length,
        };
        const updated = [newRecord, ...records];
        setRecords(updated);
        await AsyncStorage.setItem('personal_records_v2', JSON.stringify(updated));
        setModalVisible(false);
        setCurrentPoints([]);
    };

    const deleteRecord = (id) => {
        Alert.alert('削除', 'この記録を削除しますか？', [
            { text: 'キャンセル', style: 'cancel' },
            {
                text: '削除', style: 'destructive', onPress: async () => {
                    const updated = records.filter(r => r.id !== id);
                    setRecords(updated);
                    await AsyncStorage.setItem('personal_records_v2', JSON.stringify(updated));
                }
            }
        ]);
    };

    const getTargetLabel = (type) => {
        switch (type) {
            case 'kasumi_12': return '尺二寸 (霞)';
            case 'hoshi_12': return '尺二寸 (星)';
            case 'hoshi_8': return '八寸 (星)';
            default: return '';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>的中簿</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Plus color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={records}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()} - {getTargetLabel(item.targetType)}</Text>
                            <Text style={styles.result}>{item.hits} / {item.total} 中</Text>
                            <View style={styles.miniPoints}>
                                {item.points.map((p, i) => (
                                    <View key={i} style={[styles.dot, { backgroundColor: p.isHit ? '#3b82f6' : '#ef4444' }]} />
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => deleteRecord(item.id)}>
                            <Trash2 color="#ef4444" size={20} />
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={styles.list}
            />

            <Modal animationType="slide" transparent={false} visible={modalVisible}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <X color="#fff" size={24} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>新しい記録</Text>
                        <TouchableOpacity onPress={saveRecord}>
                            <Text style={styles.saveText}>保存</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ flex: 1 }}>
                        <View style={styles.pickerContainer}>
                            {['kasumi_12', 'hoshi_12', 'hoshi_8'].map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.typeBtn, currentTarget === t && styles.typeBtnActive]}
                                    onPress={() => { setCurrentTarget(t); setCurrentPoints([]); }}
                                >
                                    <Text style={[styles.typeBtnText, currentTarget === t && styles.typeBtnTextActive]}>{getTargetLabel(t)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.instr}>的をタップして矢の位置を記録</Text>

                        <TargetView
                            type={currentTarget}
                            onTargetPress={handleTargetPress}
                            points={currentPoints}
                        />

                        <View style={styles.currentStats}>
                            <Text style={styles.statText}>合計: {currentPoints.length} 射</Text>
                            <Text style={styles.statText}>的中: {currentPoints.filter(p => p.isHit).length} 中</Text>
                            <TouchableOpacity onPress={() => setCurrentPoints(currentPoints.slice(0, -1))} style={styles.undoBtn}>
                                <Text style={{ color: '#aaa' }}>1つ戻す</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, backgroundColor: '#1a1a1a' },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    addButton: { backgroundColor: '#3b82f6', padding: 8, borderRadius: 24 },
    list: { padding: 16 },
    card: { backgroundColor: '#1e1e1e', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
    date: { color: '#888', fontSize: 13 },
    result: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
    miniPoints: { flexDirection: 'row', marginTop: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },

    modalContainer: { flex: 1, backgroundColor: '#121212' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1a1a1a' },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    saveText: { color: '#3b82f6', fontSize: 18, fontWeight: 'bold' },
    pickerContainer: { flexDirection: 'row', padding: 16, justifyContent: 'space-around' },
    typeBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#333' },
    typeBtnActive: { backgroundColor: '#3b82f6' },
    typeBtnText: { color: '#888', fontSize: 13 },
    typeBtnTextActive: { color: '#fff', fontWeight: 'bold' },
    instr: { color: '#aaa', textAlign: 'center', marginTop: 10 },
    currentStats: { padding: 20, alignItems: 'center' },
    statText: { color: '#fff', fontSize: 16, marginBottom: 8 },
    undoBtn: { marginTop: 10, padding: 8 },
});
