import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../utils/firebase';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Calendar } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'cloud_sessions_cache';

export default function CloudHistoryScreen({ navigation }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { role, archerId } = useAuth();

    useEffect(() => {
        // キャッシュがあれば先に表示
        const loadCache = async () => {
            try {
                const cached = await AsyncStorage.getItem(CACHE_KEY);
                if (cached) {
                    const list = JSON.parse(cached);
                    setSessions(filterSessions(list, role, archerId));
                }
            } catch (e) { }
        };
        loadCache();

        const sessionsRef = ref(database, 'appData/sessions');
        const unsubscribe = onValue(sessionsRef, async (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const getTimestamp = (d) => typeof d === 'number' ? (d + 978307200) * 1000 : new Date(d).getTime();
                const sessionList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date));

                // キャッシュ更新
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(sessionList));

                setSessions(filterSessions(sessionList, role, archerId));
            } else {
                setSessions([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [role, archerId]);

    const filterSessions = (list, userRole, id) => {
        // 管理者はすべて表示、一般ユーザーは自分の名前/IDが含まれるもののみ
        if (userRole === 'admin') return list;
        return list.filter(s =>
            s.archers && s.archers.some(a => !a.isSeparator && !a.isTotalCalculator && (a.name === id || a.id === id))
        );
    };

    const formatDate = (dateValue) => {
        if (typeof dateValue === 'number') {
            const date = new Date((dateValue + 978307200) * 1000);
            return date.toLocaleDateString('ja-JP');
        }
        return new Date(dateValue).toLocaleDateString('ja-JP');
    };

    if (loading) return <View style={styles.center}><ActivityIndicator color="#3b82f6" /></View>;

    return (
        <View style={styles.container}>
            <View style={[styles.debugBadge, role === 'admin' && styles.adminBadge]}>
                <Text style={styles.debugText}>
                    {role === 'admin' ? '【管理者モード: 全データ表示中】' : `一般モード: ${archerId}`}
                </Text>
            </View>
            <FlatList
                data={sessions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('HistoryDetail', { session: item })}
                    >
                        <View style={styles.cardInfo}>
                            <View style={styles.dateContainer}>
                                <Calendar color="#3b82f6" size={16} />
                                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                            </View>
                            <Text style={styles.noteText} numberOfLines={1}>{item.note || '練習記録'}</Text>
                            <Text style={styles.countText}>{item.shotCount || 0}射</Text>
                        </View>
                        <ChevronRight color="#444" size={20} />
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>データがありません</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    debugBadge: { backgroundColor: '#333', padding: 8, alignItems: 'center' },
    adminBadge: { backgroundColor: '#b91c1c' },
    debugText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    listContent: { padding: 16 },
    card: { backgroundColor: '#1e1e1e', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#333' },
    cardInfo: { flex: 1 },
    dateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    dateText: { color: '#3b82f6', marginLeft: 6, fontSize: 14, fontWeight: 'bold' },
    noteText: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
    countText: { color: '#888', fontSize: 12 },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 40 }
});
