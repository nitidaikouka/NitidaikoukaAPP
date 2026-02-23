import { Tabs } from 'expo-router';
import { ClipboardEdit, History, BarChart, Settings } from 'lucide-react-native';
import { useScoreModel } from '../../src/ScoreContext';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: '#e5e7eb',
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 5,
                },
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: '#6b7280',
                tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: '記録',
                    tabBarIcon: ({ color, size }) => <ClipboardEdit color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: '履歴',
                    tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="analysis"
                options={{
                    title: '分析',
                    tabBarIcon: ({ color, size }) => <BarChart color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: '設定',
                    tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
