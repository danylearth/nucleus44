import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { supabase } from '../lib/supabase';

// ─── SVG Icons ──────────────────────────────────────────────────────
function HeartIcon({ size = 20, color = '#EF4444' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M12 21C12 21 4 15 4 9C4 6 6 4 9 4C10.5 4 11.5 5 12 6C12.5 5 13.5 4 15 4C18 4 20 6 20 9C20 15 12 21 12 21Z" stroke={color} strokeWidth={2} fill="none" />
        </Svg>
    );
}
function MaxIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M3 17L9 11L13 15L21 7" stroke="#EF4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M17 7H21V11" stroke="#EF4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function MinIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M3 7L9 13L13 9L21 17" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M17 17H21V13" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function RestIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="#8B5CF6" strokeWidth={2} fill="none" />
        </Svg>
    );
}
function LightbulbIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M9 21H15M12 3C8.68629 3 6 5.68629 6 9C6 11.2208 7.20617 13.1599 9 14.1973V17H15V14.1973C16.7938 13.1599 18 11.2208 18 9C18 5.68629 15.3137 3 12 3Z" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

// ─── Sparkline ──────────────────────────────────────────────────────
function HeartSparkline({ data, width = 280, height = 100 }: { data: number[]; width?: number; height?: number }) {
    const w = width; const h = height;
    const min = Math.min(...data) * 0.9;
    const max = Math.max(...data) * 1.1;
    const range = max - min || 1;

    const points = data.map((v, i) => ({
        x: (i / (data.length - 1)) * w,
        y: h - ((v - min) / range) * h * 0.8 - h * 0.1,
    }));

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx1 = prev.x + (curr.x - prev.x) / 3;
        const cpx2 = prev.x + (2 * (curr.x - prev.x)) / 3;
        linePath += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    const fillPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;

    return (
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <Defs>
                <LinearGradient id="hrFill" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#FCA5A5" stopOpacity="0.4" />
                    <Stop offset="1" stopColor="#FCA5A5" stopOpacity="0.02" />
                </LinearGradient>
            </Defs>
            <Path d={fillPath} fill="url(#hrFill)" />
            <Path d={linePath} stroke="#EF4444" strokeWidth={2.5} fill="none" />
        </Svg>
    );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <View style={s.statBox}>
            {icon}
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

    const avgHr = data?.avg || 72;
    const zone = avgHr >= 60 && avgHr < 100 ? 'normal' : avgHr < 60 ? 'low' : 'elevated';
    const sparkData = [68, 72, 85, 78, 90, 82, 76, 88, 92, 80, 74, 86, 78, 82, avgHr];

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Heart Rate</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* Hero Card */}
            <View style={s.heroCard}>
                <View style={s.heroTop}>
                    <HeartIcon size={22} />
                    <Text style={s.heroLabel}>Current Heart Rate</Text>
                </View>
                <View style={s.heroRow}>
                    <Text style={s.heroValue}>{avgHr}</Text>
                    <Text style={s.heroUnit}>bpm</Text>
                    <View style={[s.badge, zone === 'normal' ? s.badgeGood : s.badgeWarn]}>
                        <Text style={[s.badgeText, zone === 'normal' ? s.badgeTextGood : s.badgeTextWarn]}>{zone}</Text>
                    </View>
                </View>
                <View style={{ marginTop: 16, marginHorizontal: -16, overflow: 'hidden', borderRadius: 16 }}>
                    <HeartSparkline data={sparkData} />
                </View>
            </View>

            {/* Stats Row */}
            <View style={s.statsRow}>
                <StatCard icon={<MaxIcon />} value={data?.max?.toString() || '—'} label="Max BPM" />
                <StatCard icon={<MinIcon />} value={data?.min?.toString() || '—'} label="Min BPM" />
                <StatCard icon={<RestIcon />} value={data?.resting?.toString() || '—'} label="Resting" />
            </View>

            {/* HR Zones */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Heart Rate Zones</Text>
                {[
                    { zone: 'Peak', range: '154-177', pct: 5, color: '#EF4444' },
                    { zone: 'Cardio', range: '131-154', pct: 15, color: '#F97316' },
                    { zone: 'Fat Burn', range: '108-131', pct: 35, color: '#EAB308' },
                    { zone: 'Light', range: '85-108', pct: 30, color: '#22C55E' },
                    { zone: 'Rest', range: '<85', pct: 15, color: '#3B82F6' },
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <LightbulbIcon />
                    <Text style={s.cardTitle}>Insights</Text>
                </View>
                <Text style={s.insightText}>• Your resting heart rate is trending well — a sign of good cardiovascular health.</Text>
                <Text style={s.insightText}>• Try to maintain 30+ min of elevated HR exercise 3-5x per week.</Text>
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 28, fontWeight: '300', color: '#1C1C1E' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.3 },

    heroCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    heroLabel: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', letterSpacing: -0.2 },
    heroRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
    heroValue: { fontSize: 52, fontWeight: '800', color: '#1C1C1E', letterSpacing: -2 },
    heroUnit: { fontSize: 18, fontWeight: '400', color: '#8E8E93' },
    badge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 3, marginLeft: 4 },
    badgeGood: { backgroundColor: '#D1FAE5' },
    badgeWarn: { backgroundColor: '#FEF3C7' },
    badgeText: { fontSize: 13, fontWeight: '600' },
    badgeTextGood: { color: '#065F46' },
    badgeTextWarn: { color: '#92400E' },

    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
    statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    statValue: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginTop: 8, letterSpacing: -0.5 },
    statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4, fontWeight: '500' },

    card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 12, letterSpacing: -0.2 },

    zoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    zoneText: { fontSize: 13, fontWeight: '500', color: '#1C1C1E', width: 60 },
    zoneRange: { fontSize: 11, color: '#8E8E93', width: 55 },
    zoneBarBg: { flex: 1, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3 },
    zoneBarFill: { height: 6, borderRadius: 3 },
    zonePct: { fontSize: 12, color: '#8E8E93', width: 30, textAlign: 'right', fontWeight: '500' },

    activityRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    activityName: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
    activityMeta: { fontSize: 12, color: '#8E8E93', marginTop: 3 },
    empty: { fontSize: 13, color: '#8E8E93', textAlign: 'center', paddingVertical: 20 },
    insightText: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 6 },
});
