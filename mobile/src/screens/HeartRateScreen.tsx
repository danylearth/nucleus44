import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

function StatBox({ icon, value, label }: { icon: string; value: string; label: string }) {
    return (
        <View style={s.statBox}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
            <Text style={s.statValue}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
        </View>
    );
}

export default function HeartRateScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [data, setData] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const { data: records } = await supabase
            .from('health_data')
            .select('*')
            .in('data_type', ['body', 'daily', 'activity'])
            .order('synced_at', { ascending: false })
            .limit(30);

        if (records?.length) {
            const body = records.find(r => r.data_type === 'body');
            const hr = body?.data?.heart_data?.heart_rate_data?.summary;
            setData({
                avg: hr?.avg_hr_bpm || 0,
                max: hr?.max_hr_bpm || 0,
                min: hr?.min_hr_bpm || 0,
                resting: hr?.resting_hr_bpm || 0,
            });
            setActivities(records.filter(r => r.data_type === 'activity').slice(0, 5));
        }
    };

    const zone = (data?.avg || 72) >= 60 && (data?.avg || 72) < 100 ? 'Normal' : 'Elevated';

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <View style={[s.header, { backgroundColor: '#ef4444' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={s.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Heart Rate</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={[s.heroCard, { backgroundColor: '#ef4444' }]}>
                <Text style={s.heroValue}>{data?.avg || '—'}</Text>
                <Text style={s.heroUnit}>bpm average</Text>
                <View style={s.badge}><Text style={s.badgeText}>{zone}</Text></View>
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
                <StatBox icon="💓" value={data?.max?.toString() || '—'} label="Max BPM" />
                <StatBox icon="📉" value={data?.min?.toString() || '—'} label="Min BPM" />
                <StatBox icon="😴" value={data?.resting?.toString() || '—'} label="Resting" />
            </View>

            {/* HR Zones */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Heart Rate Zones</Text>
                {[
                    { zone: 'Peak', range: '154-177', pct: 5, color: '#ef4444' },
                    { zone: 'Cardio', range: '131-154', pct: 15, color: '#f97316' },
                    { zone: 'Fat Burn', range: '108-131', pct: 35, color: '#eab308' },
                    { zone: 'Light', range: '85-108', pct: 30, color: '#22c55e' },
                    { zone: 'Rest', range: '<85', pct: 15, color: '#3b82f6' },
                ].map((z, i) => (
                    <View key={i} style={s.zoneRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: z.color }} />
                            <Text style={s.zoneText}>{z.zone}</Text>
                            <Text style={s.zoneRange}>{z.range}</Text>
                        </View>
                        <View style={s.zoneBarBg}>
                            <View style={[s.zoneBarFill, { width: `${z.pct}%`, backgroundColor: z.color }]} />
                        </View>
                        <Text style={s.zonePct}>{z.pct}%</Text>
                    </View>
                ))}
            </View>

            {/* Recent Activity */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Recent Activity</Text>
                {activities.length === 0 ? (
                    <Text style={s.empty}>No recent activities</Text>
                ) : activities.map((a, i) => (
                    <View key={i} style={s.activityRow}>
                        <Text style={s.activityName}>{a.data?.metadata?.name || 'Workout'}</Text>
                        <Text style={s.activityMeta}>
                            {Math.round((a.data?.active_durations_data?.activity_seconds || 0) / 60)} min
                            {' • '}
                            {Math.round(a.data?.calories_data?.total_burned_calories || 0)} kcal
                        </Text>
                    </View>
                ))}
            </View>

            {/* Insights */}
            <View style={s.card}>
                <Text style={s.cardTitle}>💡 Insights</Text>
                <Text style={s.insightText}>• Your resting heart rate is trending well — a sign of good cardiovascular health.</Text>
                <Text style={s.insightText}>• Try to maintain 30+ min of elevated HR exercise 3-5x per week.</Text>
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 12 },
    backBtn: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
    heroCard: { alignItems: 'center', paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    heroValue: { fontSize: 56, fontWeight: '800', color: '#fff' },
    heroUnit: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: -4 },
    badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5, marginTop: 10 },
    badgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: 10, padding: 16 },
    statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    statValue: { fontSize: 22, fontWeight: '700', color: '#111', marginTop: 4 },
    statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12 },
    zoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    zoneText: { fontSize: 13, fontWeight: '500', color: '#111', width: 60 },
    zoneRange: { fontSize: 11, color: '#9ca3af', width: 55 },
    zoneBarBg: { flex: 1, height: 6, backgroundColor: '#f3f4f6', borderRadius: 3 },
    zoneBarFill: { height: 6, borderRadius: 3 },
    zonePct: { fontSize: 12, color: '#6b7280', width: 30, textAlign: 'right' },
    activityRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    activityName: { fontSize: 14, fontWeight: '600', color: '#111' },
    activityMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    empty: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingVertical: 16 },
    insightText: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 6 },
});
