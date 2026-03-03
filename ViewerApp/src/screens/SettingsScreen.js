import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, User, Shield, BarChart2 } from 'lucide-react-native';
import { LineChart } from "react-native-chart-kit";
import { database } from '../utils/firebase';
import { ref, onValue } from 'firebase/database';

export default function SettingsScreen({ navigation }) {
    const [statsData, setStatsData] = useState({ labels: [], datasets: [{ data: [0] }] });
    const { user, role, archerId } = useAuth();

    useEffect(() => {
        if (!archerId) return;

        const sessionsRef = ref(database, 'appData/sessions');
        const unsubscribe = onValue(sessionsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const getTimestamp = (d) => typeof d === 'number' ? (d + 978307200) * 1000 : new Date(d).getTime();

                const relevantSessions = Object.values(data)
                    .sort((a, b) => getTimestamp(a.date) - getTimestamp(b.date))
                    .slice(-6); // 直近6回

                const formatDate = (dateValue) => {
                    if (typeof dateValue === 'number') {
                        const date = new Date((dateValue + 978307200) * 1000);
                        return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
                    }
                    return new Date(dateValue).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
                };

                const labels = relevantSessions.map(s => formatDate(s.date));
                const dataPoints = relevantSessions.map(s => {
                    const archer = s.archers?.find(a => a.name === archerId || a.id === archerId);
                    if (!archer) return 0;
                    const hits = archer.marks.filter(m => m === 'hit' || m === '○').length;
                    return (hits / archer.marks.length) * 100;
                });

                if (dataPoints.length > 0) {
                    setStatsData({
                        labels,
                        datasets: [{ data: dataPoints }]
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [archerId]);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileSection}>
                <View style={styles.avatar}>
                    <User color="#fff" size={40} />
                </View>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.badge}>
                    {role === 'admin' ? <Shield size={14} color="#fcd34d" /> : null}
                    <Text style={styles.roleText}>{role === 'admin' ? '管理者' : '一般ユーザー'}</Text>
                </View>
                {archerId && <Text style={styles.archerId}>紐付け: {archerId}</Text>}
            </View>

            <View style={styles.statsSection}>
                <View style={styles.sectionHeader}>
                    <BarChart2 color="#3b82f6" size={20} />
                    <Text style={styles.sectionTitle}>的中率の推移 (%)</Text>
                </View>
                {statsData.labels.length > 0 ? (
                    <LineChart
                        data={statsData}
                        width={Dimensions.get("window").width - 32}
                        height={220}
                        chartConfig={{
                            backgroundColor: "#1e1e1e",
                            backgroundGradientFrom: "#1e1e1e",
                            backgroundGradientTo: "#1e1e1e",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            propsForDots: { r: "4", strokeWidth: "2", stroke: "#3b82f6" }
                        }}
                        bezier
                        style={styles.chart}
                    />
                ) : (
                    <Text style={styles.noData}>統計データがありません</Text>
                )}
            </View>

            <View style={styles.menu}>
                {role === 'admin' && (
                    <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('UserManagement')}>
                        <Shield color="#fff" size={20} />
                        <Text style={styles.adminButtonText}>ユーザー管理（紐付け）</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.logoutButton} onPress={() => signOut(auth)}>
                    <LogOut color="#fff" size={20} />
                    <Text style={styles.logoutText}>ログアウト</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    profileSection: { alignItems: 'center', padding: 32, borderBottomWidth: 1, borderBottomColor: '#333' },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    email: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
    roleText: { color: '#aaa', fontSize: 12, marginLeft: 4 },
    archerId: { color: '#666', marginTop: 8, fontSize: 14 },
    statsSection: { padding: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    chart: { marginVertical: 8, borderRadius: 16 },
    noData: { color: '#666', textAlign: 'center', marginVertical: 20 },
    menu: { padding: 24 },
    adminButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#333', borderRadius: 12, marginBottom: 12 },
    adminButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#ef4444', borderRadius: 12 },
    logoutText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 }
});
