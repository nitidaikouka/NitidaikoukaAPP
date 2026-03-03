import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { ref, onValue, update, set } from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../utils/firebase';
import { UserPlus, Save, User as UserIcon, Trash2 } from 'lucide-react-native';

export default function UserManagementScreen() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newId, setNewId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [regLoading, setRegLoading] = useState(false);

    useEffect(() => {
        const usersRef = ref(database, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setUsers(Object.keys(data).map(key => ({ uid: key, ...data[key] })));
            } else {
                setUsers([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleRegister = async () => {
        if (newId.length !== 4 || newPassword.length !== 4) {
            Alert.alert('エラー', 'IDとパスワードは4桁の数字で入力してください');
            return;
        }

        setRegLoading(true);
        const virtualEmail = `${newId}@nitidai.app`;
        const securePassword = `${newPassword}00`;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, virtualEmail, securePassword);
            const uid = userCredential.user.uid;

            await set(ref(database, `users/${uid}`), {
                memberId: newId,
                role: 'user',
                createdAt: new Date().toISOString()
            });

            Alert.alert('成功', `部員ID: ${newId} を登録しました`);
            setNewId('');
            setNewPassword('');
        } catch (e) {
            if (e.code === 'auth/email-already-in-use') {
                Alert.alert('エラー', 'このIDは既に登録されています');
            } else {
                Alert.alert('登録失敗', e.message);
            }
        } finally {
            setRegLoading(false);
        }
    };

    const handleUpdate = async (uid, mId, role) => {
        try {
            await update(ref(database, `users/${uid}`), { memberId: mId, role });
            Alert.alert('成功', '保存しました');
        } catch (e) {
            Alert.alert('エラー', e.message);
        }
    };

    const handleDelete = (uid, mId, userRole) => {
        if (userRole === 'admin') {
            Alert.alert('エラー', '管理者は削除できません。まず一般へ降格させてください。');
            return;
        }

        Alert.alert(
            'アカウント紐付け削除',
            `ID: ${mId} の紐付けを削除しますか？\n※ログインできなくなりますが、練習データは残ります。`,
            [
                { text: 'キャンセル', style: 'cancel' },
                {
                    text: '削除',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await set(ref(database, `users/${uid}`), null);
                            Alert.alert('削除完了', '紐付けを削除しました');
                        } catch (e) {
                            Alert.alert('エラー', e.message);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <View style={styles.center}><ActivityIndicator color="#3b82f6" /></View>;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.versionBadge}>
                <Text style={styles.versionText}>★ UPDATE v2 ACTIVE - TRASH ICON ENABLED ★</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>新規部員登録</Text>
                <View style={styles.registerForm}>
                    <View style={styles.regInputGroup}>
                        <TextInput
                            style={styles.regInput}
                            placeholder="ID (4桁)"
                            placeholderTextColor="#444"
                            value={newId}
                            onChangeText={setNewId}
                            keyboardType="number-pad"
                            maxLength={4}
                        />
                        <TextInput
                            style={styles.regInput}
                            placeholder="PASS (4桁)"
                            placeholderTextColor="#444"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            keyboardType="number-pad"
                            maxLength={4}
                            secureTextEntry={false}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.registerBtn}
                        onPress={handleRegister}
                        disabled={regLoading}
                    >
                        {regLoading ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <UserPlus color="#fff" size={18} />
                                <Text style={styles.registerBtnText}>新規登録</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>登録済み一覧</Text>
                {users.length === 0 ? <Text style={styles.emptyText}>登録ユーザーはいません</Text> :
                    users.map(u => (
                        <UserItem
                            key={u.uid}
                            user={u}
                            onSave={(mId, r) => handleUpdate(u.uid, mId, r)}
                            onDelete={() => handleDelete(u.uid, u.memberId, u.role)}
                        />
                    ))}
            </View>
        </ScrollView>
    );
}

const UserItem = ({ user, onDelete, onSave }) => {
    const [mId, setMId] = useState(user.memberId || '');
    const [role, setRole] = useState(user.role || 'user');

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <UserIcon color="#aaa" size={16} />
                    <Text style={styles.uidText}>{user.memberId || '未設定'} ({user.uid.substring(0, 6)})</Text>
                </View>
                <TouchableOpacity onPress={onDelete} style={{ padding: 10, backgroundColor: '#331111', borderRadius: 20 }}>
                    <Trash2 color="#ff4444" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <TextInput
                    style={styles.input}
                    value={mId}
                    onChangeText={setMId}
                    placeholder="部員ID"
                    placeholderTextColor="#444"
                    keyboardType="number-pad"
                    maxLength={4}
                />
                <View style={styles.roleToggle}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, role === 'user' && styles.toggleActive]}
                        onPress={() => setRole('user')}
                    >
                        <Text style={[styles.toggleText, role === 'user' && styles.toggleTextActive]}>一般</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, role === 'admin' && styles.toggleActive]}
                        onPress={() => setRole('admin')}
                    >
                        <Text style={[styles.toggleText, role === 'admin' && styles.toggleTextActive]}>管理</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(mId, role)}>
                    <Save color="#fff" size={18} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
    versionBadge: { backgroundColor: '#3b82f6', padding: 4, alignItems: 'center' },
    versionText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    registerForm: { backgroundColor: '#1e1e1e', padding: 16, borderRadius: 12 },
    regInputGroup: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    regInput: { flex: 0.48, backgroundColor: '#121212', color: '#fff', padding: 12, borderRadius: 8, textAlign: 'center', fontSize: 16 },
    registerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6', padding: 14, borderRadius: 8 },
    registerBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

    card: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 10, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    uidText: { color: '#aaa', fontSize: 12, marginLeft: 6 },
    inputGroup: { flexDirection: 'row', alignItems: 'center' },
    input: { flex: 1, backgroundColor: '#121212', color: '#fff', padding: 10, borderRadius: 6, marginRight: 10, textAlign: 'center' },
    roleToggle: { flexDirection: 'row', backgroundColor: '#121212', borderRadius: 6, padding: 2, marginRight: 10 },
    toggleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
    toggleActive: { backgroundColor: '#333' },
    toggleText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
    toggleTextActive: { color: '#3b82f6' },
    saveBtn: { backgroundColor: '#059669', padding: 10, borderRadius: 6 },
    emptyText: { color: '#666', textAlign: 'center', marginTop: 20 }
});
