import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { ScoreProvider, useScoreModel } from '../src/ScoreContext';

export default function RootLayout() {
    return (
        <ScoreProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </ScoreProvider>
    );
}
