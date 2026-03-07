import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { colors, fontSizes } from '../lib/theme';

// Main screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AIAgentScreen from '../screens/AIAgentScreen';
import DevicesScreen from '../screens/DevicesScreen';
import HealthScreen from '../screens/HealthScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Detail screens - biometrics
import HeartRateScreen from '../screens/HeartRateScreen';
import StepsScreen from '../screens/StepsScreen';
import SleepScreen from '../screens/SleepScreen';
import CaloriesScreen from '../screens/CaloriesScreen';
import WaterScreen from '../screens/WaterScreen';
import StressScreen from '../screens/StressScreen';

// Feature screens
import HealthScoreScreen from '../screens/HealthScoreScreen';
import SupplementsScreen from '../screens/SupplementsScreen';
import LabResultsScreen from '../screens/LabResultsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import GoalsScreen from '../screens/GoalsScreen';
import GoalDetailScreen from '../screens/GoalDetailScreen';

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
    const { session, loading, profile } = useAuth();

    const needsOnboarding = session && profile && profile.onboarding_complete === false;

    // Deep linking config
    const linking = {
        prefixes: ['nucleus://', 'https://nucleus.health'],
        config: {
            screens: {
                Main: 'main',
                HeartRate: 'heart-rate',
                Steps: 'steps',
                Sleep: 'sleep',
                Calories: 'calories',
                Water: 'water',
                Stress: 'stress',
                HealthScore: 'health-score',
                Supplements: 'supplements',
                LabResults: 'lab-results',
                Notifications: 'notifications',
                Onboarding: 'onboarding',
                Login: 'login',
            },
        },
    } as any;

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
        <NavigationContainer linking={linking}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {session ? (
                    <>
                        {needsOnboarding ? (
                            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        ) : null}
                        <Stack.Screen name="Main" component={MainTabs} />
                        {/* Biometric detail screens */}
                        <Stack.Screen name="HeartRate" component={HeartRateScreen} />
                        <Stack.Screen name="Steps" component={StepsScreen} />
                        <Stack.Screen name="Sleep" component={SleepScreen} />
                        <Stack.Screen name="Calories" component={CaloriesScreen} />
                        <Stack.Screen name="Water" component={WaterScreen} />
                        <Stack.Screen name="Stress" component={StressScreen} />
                        {/* Feature screens */}
                        <Stack.Screen name="HealthScore" component={HealthScoreScreen} />
                        <Stack.Screen name="Supplements" component={SupplementsScreen} />
                        <Stack.Screen name="LabResults" component={LabResultsScreen} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="Goals" component={GoalsScreen} />
                        <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
                        {!needsOnboarding ? (
                            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        ) : null}
                    </>
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
