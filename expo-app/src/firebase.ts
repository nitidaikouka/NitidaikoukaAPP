import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import {
    getAuth,
    initializeAuth,
    // @ts-ignore
    getReactNativePersistence
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from './constants';

const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];

// React Native での永続化設定を含めた Auth 初期化
export const auth = (() => {
    try {
        return initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage)
        });
    } catch (e) {
        // すでに初期化されている場合は getAuth を返す
        return getAuth(app);
    }
})();

export const db = getDatabase(app);
