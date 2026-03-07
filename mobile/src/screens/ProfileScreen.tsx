import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../lib/theme';
import { useAuth } from '../lib/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const { profile, signOut } = useAuth();
    const nav = useNavigation<any>();

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ]);
    };

    const menuItems = [
        { icon: '✏️', label: 'Edit Profile', onPress: () => nav.navigate('EditProfile') },
        { icon: '🎯', label: 'Goals', onPress: () => nav.navigate('Goals') },
        { icon: '🧬', label: 'Blood Results', onPress: () => nav.navigate('LabResults') },
        { icon: '💊', label: 'Supplements', onPress: () => nav.navigate('Supplements') },
        { icon: '📊', label: 'Health Bar', onPress: () => nav.navigate('HealthScore') },
        { icon: '📅', label: 'Calendar', onPress: () => nav.navigate('Calendar') },
        { icon: '⌚', label: 'Connected Devices', onPress: () => nav.navigate('Main', { screen: 'Devices' }) },
        { icon: '🔔', label: 'Notifications', onPress: () => nav.navigate('Notifications') },
        { icon: '🔒', label: 'Privacy & Security', onPress: () => { } },
        { icon: '❓', label: 'Help & Support', onPress: () => { } },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Profile Header */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {(profile?.full_name || 'U').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
                <Text style={styles.email}>{profile?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{profile?.role || 'user'}</Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuCard}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={item.label}
                        style={[
                            styles.menuItem,
                            index < menuItems.length - 1 && styles.menuItemBorder,
                        ]}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.menuIcon}>{item.icon}</Text>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Sign Out */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Nucleus v1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: spacing['4xl'] },
    profileCard: {
        alignItems: 'center',
        paddingTop: spacing['4xl'],
        paddingBottom: spacing.xl,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        marginTop: spacing['3xl'],
        ...shadows.sm,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: fontSizes['3xl'],
        fontWeight: '700',
        color: colors.textInverse,
    },
    name: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    email: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    roleBadge: {
        marginTop: spacing.md,
        backgroundColor: colors.primaryBg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    roleText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
        color: colors.primary,
        textTransform: 'capitalize',
    },
    menuCard: {
        marginHorizontal: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.xl,
        ...shadows.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    menuIcon: {
        fontSize: 20,
        marginRight: spacing.md,
    },
    menuLabel: {
        flex: 1,
        fontSize: fontSizes.md,
        color: colors.textPrimary,
    },
    menuArrow: {
        fontSize: fontSizes.xl,
        color: colors.textTertiary,
    },
    signOutButton: {
        marginHorizontal: spacing.xl,
        backgroundColor: colors.errorBg,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    signOutText: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.error,
    },
    version: {
        textAlign: 'center',
        fontSize: fontSizes.xs,
        color: colors.textTertiary,
        marginTop: spacing.xl,
    },
});
