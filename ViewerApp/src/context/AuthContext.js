import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, database } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null); // 'admin' or 'user'
    const [archerId, setArcherId] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                // ユーザー情報を取得 (Realtime Database の /users/{uid} に保存する想定)
                const userRef = ref(database, `users/${authUser.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setRole(userData.role || 'user');
                    // archerId または memberId を識別子として使用
                    setArcherId(userData.archerId || userData.memberId || null);
                } else {
                    // 初期値（管理者が手動で設定するまで、または初回ログイン時）
                    setRole('user');
                    setArcherId(null);
                }
                setUser(authUser);
            } else {
                setUser(null);
                setRole(null);
                setArcherId(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, role, archerId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
