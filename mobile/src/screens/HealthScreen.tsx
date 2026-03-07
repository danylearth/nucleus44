import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../lib/theme';
import { supabase } from '../lib/supabase';

export default function HealthScreen() {
    const [healthData, setHealthData] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const { data } = await supabase
            .from('health_data')
            .select('*')
            .order('synced_at', { ascending: false })
            .limit(50);
        if (data) setHealthData(data);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Group by data_type
    const grouped = healthData.reduce((acc: Record<string, any[]>, item) => {
        const type = item.data_type || 'other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
    }, {});

    const typeIcons: Record<string, string> = {
        daily: '📊',
        body: '🏋️',
        activity: '🏃',
        sleep: '😴',
        nutrition: '🍎',
        heart_rate: '❤️',
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
        >
            <Text style={styles.pageTitle}>Health Data</Text>
            <Text style={styles.pageSubtitle}>
                Your health metrics from connected devices.
            </Text>

            {healthData.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📈</Text>
                    <Text style={styles.emptyTitle}>No Health Data Yet</Text>
                    <Text style={styles.emptyText}>
                        Connect a wearable device from the Devices tab to see your health metrics here.
                    </Text>
                </View>
            ) : (
                Object.entries(grouped).map(([type, items]) => (
                    <View key={type} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionIcon}>{typeIcons[type] || '📋'}</Text>
                            <Text style={styles.sectionTitle}>
                                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                            </Text>
                            <Text style={styles.sectionCount}>{items.length} records</Text>
                        </View>
                        {items.slice(0, 3).map((item, i) => (
                            <View key={item.id || i} style={styles.dataRow}>
                                <Text style={styles.dataTime}>
                                    {new Date(item.synced_at).toLocaleDateString()}
                                </Text>
                                <Text style={styles.dataSource}>
                                    {item.source || 'terra'}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: spacing['4xl'] },
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
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing['4xl'],
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
    section: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        ...shadows.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionIcon: { fontSize: 20, marginRight: spacing.sm },
    sectionTitle: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
    },
    sectionCount: {
        fontSize: fontSizes.xs,
        color: colors.textTertiary,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    dataTime: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    dataSource: {
        fontSize: fontSizes.xs,
        color: colors.primary,
        fontWeight: '500',
    },
});
