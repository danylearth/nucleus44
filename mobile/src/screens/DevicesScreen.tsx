import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../lib/theme';
import { useAuth } from '../lib/AuthContext';
import { supabase, callFunction } from '../lib/supabase';

const providerDetails: Record<string, { name: string; icon: string; color: string }> = {
    GARMIN: { name: 'Garmin', icon: '⌚', color: '#1a1a1a' },
    FITBIT: { name: 'Fitbit', icon: '⌚', color: '#EC4899' },
    OURA: { name: 'Oura Ring', icon: '💍', color: '#6366F1' },
    WHOOP: { name: 'Whoop', icon: '⌚', color: '#22C55E' },
    GOOGLE_FIT: { name: 'Google Fit', icon: '📱', color: '#3B82F6' },
    APPLE_HEALTH: { name: 'Apple Health', icon: '❤️', color: '#EF4444' },
};

export default function DevicesScreen() {
    const { user } = useAuth();
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        try {
            const { data } = await supabase
                .from('terra_connections')
                .select('*')
                .order('created_at', { ascending: false });
            if (data) setConnections(data);
        } catch (error) {
            console.log('Error loading connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadConnections();
        setRefreshing(false);
    };

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const result = await callFunction('terraConnect', {
                providers: 'GARMIN,FITBIT,OURA,WHOOP,GOOGLE',
            });
            const widgetUrl = result?.url || result?.data?.url;
            if (widgetUrl) {
                await Linking.openURL(widgetUrl);
            } else {
                throw new Error('No widget URL returned');
            }
        } catch (error: any) {
            Alert.alert('Connection Error', error.message || 'Failed to start device connection.');
        } finally {
            setConnecting(false);
        }
    };

    const handleSync = async () => {
        try {
            await callFunction('forceSync', { user_id: user?.id });
            Alert.alert('Sync Started', 'Your health data is being synced.');
            setTimeout(loadConnections, 3000);
        } catch (error: any) {
            Alert.alert('Sync Failed', error.message || 'Could not sync data.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
        >
            <Text style={styles.pageTitle}>Connected Devices</Text>
            <Text style={styles.pageSubtitle}>
                Manage your health data sources and wearable devices.
            </Text>

            {/* Connected Devices */}
            {connections.map((conn) => {
                const details = providerDetails[conn.provider] || {
                    name: conn.provider,
                    icon: '⌚',
                    color: colors.textSecondary,
                };
                return (
                    <View key={conn.id} style={styles.deviceCard}>
                        <View style={styles.deviceRow}>
                            <View style={[styles.deviceIcon, { backgroundColor: details.color + '15' }]}>
                                <Text style={styles.deviceEmoji}>{details.icon}</Text>
                            </View>
                            <View style={styles.deviceInfo}>
                                <Text style={styles.deviceName}>{details.name}</Text>
                                <Text style={styles.deviceStatus}>
                                    {conn.is_active !== false ? '🟢 Connected' : '🔴 Disconnected'}
                                    {conn.last_sync ? ` • Last sync: ${new Date(conn.last_sync).toLocaleDateString()}` : ''}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleSync} style={styles.syncButton}>
                                <Text style={styles.syncText}>🔄</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            })}

            {/* Add Device */}
            <TouchableOpacity
                style={styles.addCard}
                onPress={handleConnect}
                disabled={connecting}
                activeOpacity={0.7}
            >
                {connecting ? (
                    <ActivityIndicator color={colors.primary} />
                ) : (
                    <>
                        <View style={styles.addIcon}>
                            <Text style={styles.addPlus}>+</Text>
                        </View>
                        <View>
                            <Text style={styles.addTitle}>Connect a Device</Text>
                            <Text style={styles.addSubtitle}>Garmin, Fitbit, Oura, Whoop & more</Text>
                        </View>
                    </>
                )}
            </TouchableOpacity>

            {connections.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📡</Text>
                    <Text style={styles.emptyTitle}>No Devices Connected</Text>
                    <Text style={styles.emptyText}>
                        Tap "Connect a Device" above to link your wearable and start syncing health data.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: spacing['4xl'] },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    pageTitle: {
        fontSize: fontSizes['2xl'],
        fontWeight: '700',
        color: colors.textPrimary,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing['3xl'],
    },
    pageSubtitle: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        marginTop: spacing.xs,
    },
    deviceCard: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        ...shadows.sm,
    },
    deviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    deviceEmoji: { fontSize: 22 },
    deviceInfo: { flex: 1 },
    deviceName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    deviceStatus: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    syncButton: {
        padding: spacing.sm,
    },
    syncText: { fontSize: 20 },
    addCard: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.border,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    addIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addPlus: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.primary,
    },
    addTitle: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.primary,
    },
    addSubtitle: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing['3xl'],
    },
    emptyIcon: { fontSize: 48, marginBottom: spacing.md },
    emptyTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
