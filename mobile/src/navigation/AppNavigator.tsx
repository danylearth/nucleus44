import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { colors, fontSizes } from '../lib/theme';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AIAgentScreen from '../screens/AIAgentScreen';
import DevicesScreen from '../screens/DevicesScreen';
import HealthScreen from '../screens/HealthScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
    const icons: Record<string, string> = {
        Home: '🏠',
        AI: '🧬',
        Health: '📊',
        Devices: '⌚',
        Profile: '👤',
    };
    return (
        <View style={styles.tabIcon}>
            <Text style={styles.tabEmoji}>{icons[label] || '📋'}</Text>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {label}
            </Text>
        </View>
    );
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
                tabBarIcon: ({ focused }) => (
                    <TabIcon label={route.name} focused={focused} />
                ),
            })}
        >
            <Tab.Screen name="Home" component={DashboardScreen} />
            <Tab.Screen name="AI" component={AIAgentScreen} />
            <Tab.Screen name="Health" component={HealthScreen} />
            <Tab.Screen name="Devices" component={DevicesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingLogo}>
                    <Text style={styles.loadingLogoText}>N</Text>
                </View>
                <Text style={styles.loadingText}>NUCLEUS</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {session ? (
                    <Stack.Screen name="Main" component={MainTabs} />
                ) : (
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ animationTypeForReplace: 'pop' }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        height: 85,
        paddingTop: 8,
        paddingBottom: 20,
    },
    tabIcon: {
        alignItems: 'center',
        gap: 2,
    },
    tabEmoji: {
        fontSize: 22,
    },
    tabLabel: {
        fontSize: fontSizes.xs,
        color: colors.textTertiary,
        fontWeight: '500',
    },
    tabLabelActive: {
        color: colors.primary,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingLogo: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    loadingLogoText: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.textInverse,
    },
    loadingText: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.textSecondary,
        letterSpacing: 4,
    },
});
