import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { History, BookOpen, Settings as SettingsIcon } from 'lucide-react-native';

import CloudHistoryScreen from '../screens/CloudHistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import PersonalDiaryScreen from '../screens/PersonalDiaryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import UserManagementScreen from '../screens/UserManagementScreen';

const Tab = createBottomTabNavigator();
const HistoryStack = createStackNavigator();
const SettingsStack = createStackNavigator();

function HistoryStackScreen() {
    return (
        <HistoryStack.Navigator screenOptions={{
            headerStyle: { backgroundColor: '#1a1a1a' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' }
        }}>
            <HistoryStack.Screen name="HistoryList" component={CloudHistoryScreen} options={{ title: '練習履歴' }} />
            <HistoryStack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={{ title: '記録詳細' }} />
        </HistoryStack.Navigator>
    );
}

function SettingsStackScreen() {
    return (
        <SettingsStack.Navigator screenOptions={{
            headerStyle: { backgroundColor: '#1a1a1a' },
            headerTintColor: '#fff',
        }}>
            <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: '設定' }} />
            <SettingsStack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'ユーザー管理' }} />
        </SettingsStack.Navigator>
    );
}

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#333', height: 60, paddingBottom: 8 },
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: '#666',
            }}
        >
            <Tab.Screen
                name="HistoryTab"
                component={HistoryStackScreen}
                options={{
                    tabBarLabel: '履歴',
                    tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="PersonalDiary"
                component={PersonalDiaryScreen}
                options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: '#1a1a1a' },
                    headerTintColor: '#fff',
                    title: '的中簿',
                    tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsStackScreen}
                options={{
                    tabBarLabel: '設定',
                    tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
}
