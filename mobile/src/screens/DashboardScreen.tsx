import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    RefreshControl,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { colors, fontSizes, spacing, borderRadius, shadows } from '../lib/theme';
import { useAuth } from '../lib/AuthContext';
import { supabase, callFunction } from '../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Health Score Arc ───────────────────────────────────────────────
function HealthScoreArc({ score }: { score: number }) {
    const maxScore = 1000;
    const percentage = Math.min(score / maxScore, 1);
    const isDefault = !score || score === 750;

    // Arc geometry
    const svgW = 240;
    const svgH = 140;
    const cx = svgW / 2;
    const cy = svgH - 16;
    const rx = 100;
    const ry = 90;
    const sw = 28;
    const circumference = (Math.PI * (rx + ry)) / 2;
    const progress = percentage * circumference;

    // Badge label
    const getLabel = () => {
        if (percentage >= 0.8) return 'Great';
        if (percentage >= 0.65) return 'Good';
        if (percentage >= 0.4) return 'Fair';
        return 'Low';
    };

    return (
        <View style={styles.arcCard}>
            <View style={{ width: svgW, height: svgH, alignSelf: 'center' }}>
                <Svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor="#ff8c69" />
                            <Stop offset="0.4" stopColor="#ffd93d" />
                            <Stop offset="1" stopColor="#84e1a9" />
                        </LinearGradient>
                    </Defs>
                    {/* Background arc */}
                    <Path
                        d={`M ${cx - rx},${cy} A ${rx},${ry} 0 0 1 ${cx + rx},${cy}`}
                        stroke="#f0f0f0"
                        strokeWidth={sw}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Progress arc */}
                    {!isDefault && (
                        <Path
                            d={`M ${cx - rx},${cy} A ${rx},${ry} 0 0 1 ${cx + rx},${cy}`}
                            stroke="url(#grad)"
                            strokeWidth={sw}
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${progress} ${circumference}`}
                        />
                    )}
                    {/* Dots */}
                    {Array.from({ length: 13 }).map((_, i) => {
                        const t = Math.PI - (i * Math.PI) / 12;
                        const ir = rx - sw / 2 - 6;
                        const irY = ry - sw / 2 - 6;
                        return (
                            <Circle
                                key={i}
                                cx={cx + ir * Math.cos(t)}
                                cy={cy - irY * Math.sin(t)}
                                r={2}
                                fill="#e2e8f0"
                            />
                        );
                    })}
                </Svg>

                {/* Score text */}
                <View style={styles.arcScoreOverlay}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.arcScoreText, isDefault && { color: '#ccc' }]}>
                            {score}
                        </Text>
                        {!isDefault && (
                            <View style={styles.arcArrowUp} />
                        )}
                    </View>
                    <Text style={styles.arcLabel}>Health Score</Text>
                </View>

                {/* Badge */}
                {!isDefault && percentage >= 0.65 && (
                    <View style={styles.arcBadge}>
                        <Text style={styles.arcBadgeText}>{getLabel()}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

// ─── Metric Cards ───────────────────────────────────────────────────
function MetricRow({ children }: { children: React.ReactNode }) {
    return <View style={styles.metricRow}>{children}</View>;
}

function MetricCard({
    icon, label, value, unit, badge, wide, onPress, children
}: {
    icon: string; label: string; value: string; unit?: string; badge?: string; wide?: boolean; onPress?: () => void; children?: React.ReactNode;
}) {
    const Wrapper = onPress ? TouchableOpacity : View;
    return (
        <Wrapper style={[styles.metricCard, wide && styles.metricCardWide]} onPress={onPress}>
            <View style={styles.metricHeader}>
                <Text style={styles.metricIcon}>{icon}</Text>
                <Text style={styles.metricLabel}>{label}</Text>
            </View>
            <View style={styles.metricBody}>
                <Text style={styles.metricValue}>
                    {value}
                    {unit ? <Text style={styles.metricUnit}> {unit}</Text> : null}
                </Text>
                {badge && (
                    <View style={styles.metricBadge}>
                        <Text style={styles.metricBadgeText}>{badge}</Text>
                    </View>
                )}
            </View>
            {children}
        </Wrapper>
    );
}

// ─── Supplements Card ───────────────────────────────────────────────
function SupplementsCard({ supplements }: { supplements: any[] }) {
    const active = supplements.filter(s => s.active !== false);
    const taken = Math.min(active.length, 5);

    return (
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.metricIcon}>💊</Text>
                    <Text style={styles.sectionTitle}>Supplements</Text>
                </View>
                <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>7 day streak</Text>
                </View>
            </View>
            <Text style={styles.supplementCount}>
                <Text style={styles.supplementBold}>{taken}/{active.length}</Text>
                {'  '}taken today
            </Text>
            <View style={styles.tagContainer}>
                {active.slice(0, 8).map((s, i) => (
                    <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{s.name}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ─── Lab Results Card ───────────────────────────────────────────────
function LabResultsCard({ results }: { results: any[] }) {
    return (
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.metricIcon}>✅</Text>
                    <Text style={styles.sectionTitle}>Lab Results</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>
            {results.length === 0 ? (
                <Text style={styles.emptyText}>No lab results yet</Text>
            ) : (
                results.slice(0, 3).map((r, i) => (
                    <TouchableOpacity key={i} style={styles.labResultRow}>
                        <View style={styles.labResultIcon}>
                            <Text style={{ fontSize: 18 }}>🩸</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.labResultName}>{r.test_name || r.test_type || 'Lab Test'}</Text>
                            <Text style={styles.labResultDate}>{r.test_date || r.created_at?.split('T')[0]}</Text>
                            <View style={[styles.labStatusBadge, r.status === 'normal' && styles.labStatusNormal]}>
                                <Text style={[styles.labStatusText, r.status === 'normal' && styles.labStatusTextNormal]}>
                                    {r.status || 'Pending'}
                                </Text>
                            </View>
                        </View>
                        <Text style={{ color: '#ccc', fontSize: 20 }}>›</Text>
                    </TouchableOpacity>
                ))
            )}
        </View>
    );
}

// ─── Main Dashboard ─────────────────────────────────────────────────
export default function DashboardScreen() {
    const { profile } = useAuth();
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [healthScore, setHealthScore] = useState(profile?.health_score || 750);
    const [metrics, setMetrics] = useState({
        steps: 0, heartRate: 0, calories: 0,
        sleepHours: 0, sleepMinutes: 0, deepSleep: 0,
        hrv: 0, hrvMinutes: 0,
    });
    const [supplements, setSupplements] = useState<any[]>([]);
    const [labResults, setLabResults] = useState<any[]>([]);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            // Health data
            const { data: healthData } = await supabase
                .from('health_data')
                .select('*')
                .order('synced_at', { ascending: false })
                .limit(30);

            if (healthData?.length) {
                const daily = healthData.find(d => d.data_type === 'daily');
                const body = healthData.find(d => d.data_type === 'body');
                const sleep = healthData.find(d => d.data_type === 'sleep');
                const activity = healthData.find(d => d.data_type === 'activity');

                const steps = daily?.data?.steps || activity?.data?.distance_data?.steps || 0;
                const calories = daily?.data?.calories || activity?.data?.calories_data?.total_burned_calories || 0;
                const hr = body?.data?.heart_data?.heart_rate_data?.summary?.avg_hr_bpm || 0;
                const hrv = body?.data?.heart_data?.heart_rate_data?.summary?.avg_hrv || 0;

                let sleepHrs = 0, sleepMins = 0, deepMins = 0;
                if (sleep?.data?.sleep_durations_data?.asleep) {
                    const totalSec = sleep.data.sleep_durations_data.asleep.duration_asleep_state_seconds || 0;
                    sleepHrs = Math.floor(totalSec / 3600);
                    sleepMins = Math.floor((totalSec % 3600) / 60);
                    deepMins = Math.floor((sleep.data.sleep_durations_data.asleep.duration_deep_sleep_state_seconds || 0) / 60);
                }

                setMetrics({
                    steps, heartRate: Math.round(hr), calories: Math.round(calories),
                    sleepHours: sleepHrs, sleepMinutes: sleepMins, deepSleep: deepMins,
                    hrv: Math.round(hrv), hrvMinutes: 0,
                });
            }

            // Supplements
            try {
                const { data: supps } = await supabase
                    .from('supplements')
                    .select('*')
                    .eq('active', true);
                if (supps) setSupplements(supps);
            } catch (e) { }

            // Lab results
            try {
                const { data: labs } = await supabase
                    .from('lab_results')
                    .select('*')
                    .order('test_date', { ascending: false })
                    .limit(5);
                if (labs) setLabResults(labs);
            } catch (e) {
                try {
                    const { data: labs } = await supabase
                        .from('blood_results')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(5);
                    if (labs) setLabResults(labs);
                } catch (e2) { }
            }

            // Health score
            try {
                const result = await callFunction('healthScore', {});
                if (result?.score != null) setHealthScore(result.score);
            } catch (e) { }
        } catch (error) {
            console.log('Dashboard load error:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboard();
        setRefreshing(false);
    };

    const firstName = profile?.full_name?.split(' ')[0] || 'there';
    const hrStatus = metrics.heartRate > 0 ? (metrics.heartRate >= 60 && metrics.heartRate < 100 ? 'normal' : 'elevated') : '';
    const nav = useNavigation<any>();

    return (
        <ScrollView
            style={[styles.container, { paddingTop: insets.top }]}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.greeting}>{greeting}</Text>
                        <Text style={styles.userName}>{firstName}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.notifButton} onPress={() => nav.navigate('Notifications')}>
                    <Text style={{ fontSize: 18 }}>🔔</Text>
                </TouchableOpacity>
            </View>

            {/* Health Score */}
            <TouchableOpacity onPress={() => nav.navigate('HealthScore')}>
                <HealthScoreArc score={healthScore} />
            </TouchableOpacity>

            {/* Steps & Heart Rate row */}
            <MetricRow>
                <MetricCard icon="👟" label="Steps" value={metrics.steps > 0 ? metrics.steps.toLocaleString() : '—'} unit="Steps" onPress={() => nav.navigate('Steps')} />
                <MetricCard icon="❤️" label="Heart Rate" value={metrics.heartRate > 0 ? metrics.heartRate.toString() : '—'} unit="bpm" badge={hrStatus} onPress={() => nav.navigate('HeartRate')} />
            </MetricRow>

            {/* Calories (wide) */}
            <MetricCard icon="🔥" label="Calories" value={metrics.calories > 0 ? metrics.calories.toLocaleString() : '—'} unit="Kcal" wide onPress={() => nav.navigate('Calories')} />

            {/* Sleep & Stress row */}
            <MetricRow>
                <MetricCard icon="😴" label="Sleep" value={metrics.sleepHours > 0 ? `${metrics.sleepHours}h` : '—'} unit={metrics.deepSleep > 0 ? `${metrics.deepSleep}m Deep` : ''} onPress={() => nav.navigate('Sleep')} />
                <MetricCard icon="🧘" label="Stress" value={metrics.hrv > 0 ? metrics.hrv.toString() : '—'} unit="HRV" onPress={() => nav.navigate('Stress')} />
            </MetricRow>

            {/* Supplements */}
            <TouchableOpacity onPress={() => nav.navigate('Supplements')}>
                <SupplementsCard supplements={supplements.length > 0 ? supplements : [
                    { name: 'Vitamin D', active: true },
                    { name: 'Omega-3', active: true },
                    { name: 'Magnesium', active: true },
                    { name: 'Probiotics', active: true },
                    { name: 'Zinc', active: true },
                ]} />
            </TouchableOpacity>

            {/* Lab Results */}
            <TouchableOpacity onPress={() => nav.navigate('LabResults')}>
                <LabResultsCard results={labResults} />
            </TouchableOpacity>

            {/* Order Tests Button */}
            <TouchableOpacity style={styles.orderButton} onPress={() => nav.navigate('LabResults')}>
                <Text style={styles.orderButtonText}>Order New Tests</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F8' },
    scrollContent: { paddingHorizontal: spacing.lg },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.lg, paddingBottom: spacing.md },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 22, fontWeight: '700', color: '#6366f1' },
    greeting: { fontSize: 14, color: '#9ca3af', fontWeight: '400' },
    userName: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: -2 },
    notifButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadows.sm },

    // Arc
    arcCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 16, marginTop: spacing.md, marginBottom: spacing.md,
        ...shadows.sm,
    },
    arcScoreOverlay: { position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' },
    arcScoreText: { fontSize: 48, fontWeight: '800', color: '#111827', letterSpacing: -1 },
    arcArrowUp: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#48bb78', marginLeft: 4, marginTop: -8 },
    arcLabel: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
    arcBadge: { position: 'absolute', top: 20, right: 16, backgroundColor: '#dcfce7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    arcBadgeText: { fontSize: 12, fontWeight: '600', color: '#166534' },

    // Metric cards
    metricRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    metricCard: {
        flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 16,
        ...shadows.sm,
    },
    metricCardWide: { marginBottom: 12 },
    metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    metricIcon: { fontSize: 16 },
    metricLabel: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
    metricBody: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    metricValue: { fontSize: 32, fontWeight: '700', color: '#111827' },
    metricUnit: { fontSize: 14, fontWeight: '400', color: '#9ca3af' },
    metricBadge: { backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 4 },
    metricBadgeText: { fontSize: 11, fontWeight: '600', color: '#166534' },

    // Supplements
    sectionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, ...shadows.sm },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
    streakBadge: { borderWidth: 1, borderColor: '#06b6d4', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
    streakText: { fontSize: 11, fontWeight: '600', color: '#06b6d4' },
    supplementCount: { fontSize: 15, color: '#6b7280', marginBottom: 10 },
    supplementBold: { fontSize: 24, fontWeight: '700', color: '#111827' },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tag: { backgroundColor: '#e0f2fe', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
    tagText: { fontSize: 12, fontWeight: '500', color: '#0369a1' },

    // Lab Results
    viewAllText: { fontSize: 13, fontWeight: '600', color: '#06b6d4' },
    emptyText: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingVertical: 16 },
    labResultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', gap: 12 },
    labResultIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
    labResultName: { fontSize: 14, fontWeight: '600', color: '#111827' },
    labResultDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    labStatusBadge: { marginTop: 4, alignSelf: 'flex-start', backgroundColor: '#fef9c3', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
    labStatusNormal: { backgroundColor: '#dcfce7' },
    labStatusText: { fontSize: 11, fontWeight: '500', color: '#854d0e' },
    labStatusTextNormal: { color: '#166534' },

    // Order button
    orderButton: { backgroundColor: '#111827', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 4, marginBottom: 12 },
    orderButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
