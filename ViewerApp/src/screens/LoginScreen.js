import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../utils/firebase';
import { ref, get } from 'firebase/database';

export default function LoginScreen() {
    const [memberId, setMemberId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (memberId.length !== 4 || password.length !== 4) {
            Alert.alert('エラー', 'IDとパスワードは4桁の数字で入力してください');
            return;
        }

        setLoading(true);
        const virtualEmail = `${memberId}@nitidai.app`;
        const securePassword = `${password}00`;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, virtualEmail, securePassword);

            // 重要: 削除されたユーザー（DBに登録がないユーザー）をブロック
            const userRef = ref(database, `users/${userCredential.user.uid}`);
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
                await auth.signOut();
                Alert.alert('認証失敗', 'このIDは現在有効ではありません。\n管理者に確認してください。');
                return;
            }

            // 成功（AuthContextが自動的に状態を更新します）
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                Alert.alert('認証失敗', 'IDまたはパスワードが間違っています。');
            } else {
                Alert.alert('認証エラー', 'ログインに失敗しました。時間をおいて再度お試しください。');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.inner}>
                <Text style={styles.title}>的中簿 ビューワー</Text>
                <Text style={styles.subtitle}>部員ID(4桁)でログインしてください</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>部員ID</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0000"
                        placeholderTextColor="#444"
                        value={memberId}
                        onChangeText={(text) => setMemberId(text.replace(/[^0-9]/g, '').slice(0, 4))}
                        keyboardType="number-pad"
                        maxLength={4}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>パスワード</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="****"
                        placeholderTextColor="#444"
                        value={password}
                        onChangeText={(text) => setPassword(text.replace(/[^0-9]/g, '').slice(0, 4))}
                        secureTextEntry
                        keyboardType="number-pad"
                        maxLength={4}
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleAuth}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>ログイン</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.helperText}>※初回ログイン後もID/PASSは変わりません</Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    inner: { padding: 24, flex: 1, justifyContent: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 40 },
    inputContainer: { marginBottom: 20 },
    label: { color: '#888', fontSize: 12, marginBottom: 8, marginLeft: 4 },
    input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 16, borderRadius: 12, fontSize: 24, textAlign: 'center', letterSpacing: 10, fontWeight: 'bold', borderWidth: 1, borderColor: '#333' },
    button: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    helperText: { color: '#444', textAlign: 'center', marginTop: 32, fontSize: 12 }
});
