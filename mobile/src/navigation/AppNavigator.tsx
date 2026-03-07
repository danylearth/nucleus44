import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
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
import CalendarScreen from '../screens/CalendarScreen';
import BloodResultDetailScreen from '../screens/BloodResultDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
    const color = focused ? '#fff' : '#8E8E93';

    const icons: Record<string, React.ReactNode> = {
        Home: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M3 12L12 3L21 12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M5 10V20H19V10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
        ),
        AI: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M21 15C21 15.55 20.55 16 20 16H8L4 20V4C4 3.45 4.45 3 5 3H20C20.55 3 21 3.45 21 4V15Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
        ),
        Health: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Rect x={3} y={3} width={7} height={9} rx={1} stroke={color} strokeWidth={2} />
                <Rect x={14} y={3} width={7} height={5} rx={1} stroke={color} strokeWidth={2} />
                <Rect x={3} y={16} width={7} height={5} rx={1} stroke={color} strokeWidth={2} />
                <Rect x={14} y={12} width={7} height={9} rx={1} stroke={color} strokeWidth={2} />
            </Svg>
        ),
        Profile: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2} />
                <Path d="M4 20C4 17 7 14 12 14C17 14 20 17 20 20" stroke={color} strokeWidth={2} strokeLinecap="round" />
            </Svg>
        ),
    };

    if (focused) {
        return (
            <View style={[styles.tabIcon, styles.tabIconActive]}>
                {icons[label]}
                <Text style={[styles.tabLabel, styles.tabLabelActive]}>{label}</Text>
            </View>
        );
    }

    return (
        <View style={styles.tabIcon}>
            {icons[label]}
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
                        <Stack.Screen name="Calendar" component={CalendarScreen} />
                        <Stack.Screen name="BloodResultDetail" component={BloodResultDetailScreen} />
                        <Stack.Screen name="Devices" component={DevicesScreen} />
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
        backgroundColor: '#F2F2F7',
        borderTopWidth: 0,
        height: 80,
        paddingTop: 6,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 8,
    },
    tabIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        minWidth: 48,
    },
    tabIconActive: {
        backgroundColor: '#1C1C1E',
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 16,
    },
    tabLabel: {
        fontSize: 10,
        color: '#8E8E93',
        fontWeight: '500',
        marginTop: 2,
    },
    tabLabelActive: {
        color: '#fff',
        fontWeight: '600',
        marginTop: 0,
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
