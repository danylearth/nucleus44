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
                    <Text style={styles.arcLabel}>Health Bar</Text>
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

// ─── Macronutrients Card ────────────────────────────────────────────
function MacroRing({ value, label, color, max }: { value: number; label: string; color: string; max: number }) {
    const percentage = Math.min(value / max, 1);
    const r = 28;
    const circumference = 2 * Math.PI * r;
    const strokeDashoffset = circumference * (1 - percentage);

    return (
        <View style={styles.macroItem}>
            <View style={{ width: 68, height: 68, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={68} height={68} viewBox="0 0 68 68">
                    <Circle cx={34} cy={34} r={r} stroke="#F2F2F7" strokeWidth={5} fill="none" />
                    <Circle
                        cx={34} cy={34} r={r}
                        stroke={color} strokeWidth={5} fill="none"
                        strokeDasharray={`${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 34 34)"
                    />
                </Svg>
                <Text style={styles.macroValue}>{value}g</Text>
            </View>
            <Text style={styles.macroLabel}>{label}</Text>
        </View>
    );
}

function MacronutrientsCard() {
    return (
        <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
                <Text style={{ fontSize: 16 }}>🌾</Text>
                <Text style={styles.macroTitle}>Macronutrients</Text>
            </View>
            <View style={styles.macroRow}>
                <MacroRing value={85} label="Protein" color="#A8D8D0" max={120} />
                <MacroRing value={220} label="Carbs" color="#B8B4D0" max={300} />
                <MacroRing value={65} label="Fats" color="#D4B4A4" max={80} />
            </View>
        </View>
    );
}

// ─── SVG Icons ──────────────────────────────────────────────────────
function StepsIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M4 18C4 16 6 14 8 14C10 14 10 16 10 18" stroke="#2DD4BF" strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M10 18C10 16 12 14 14 14C16 14 16 16 16 18" stroke="#2DD4BF" strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
    );
}

function HeartIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M12 21C12 21 4 15 4 9C4 6 6 4 9 4C10.5 4 11.5 5 12 6C12.5 5 13.5 4 15 4C18 4 20 6 20 9C20 15 12 21 12 21Z" stroke="#EF4444" strokeWidth={2} fill="none" />
        </Svg>
    );
}

function BoltIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke="#2DD4BF" strokeWidth={2} strokeLinejoin="round" fill="none" />
        </Svg>
    );
}

function MoonIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="#818CF8" strokeWidth={2} fill="none" />
        </Svg>
    );
}

function BrainIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M12 4C8 4 5 7 5 10C5 14 12 20 12 20C12 20 19 14 19 10C19 7 16 4 12 4Z" stroke="#F59E0B" strokeWidth={2} fill="none" />
            <Circle cx={12} cy={10} r={2} stroke="#F59E0B" strokeWidth={2} fill="none" />
        </Svg>
    );
}

// ─── Mini Sparkline Chart ───────────────────────────────────────────
function MiniSparkline({ data, color, fillColor, height = 60 }: { data: number[]; color: string; fillColor: string; height?: number }) {
    const w = 180;
    const h = height;
    const min = Math.min(...data) * 0.9;
    const max = Math.max(...data) * 1.1;
    const range = max - min || 1;

    const points = data.map((v, i) => ({
        x: (i / (data.length - 1)) * w,
        y: h - ((v - min) / range) * h,
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
                <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={fillColor} stopOpacity="0.3" />
                    <Stop offset="1" stopColor={fillColor} stopOpacity="0.02" />
                </LinearGradient>
            </Defs>
            <Path d={fillPath} fill="url(#sparkFill)" />
            <Path d={linePath} stroke={color} strokeWidth={2} fill="none" />
        </Svg>
    );
}

// ─── Progress Bar ───────────────────────────────────────────────────
function ProgressBar({ progress, color = '#2DD4BF' }: { progress: number; color?: string }) {
    return (
        <View style={{ height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginTop: 12 }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: color, width: `${Math.min(100, progress)}%` }} />
        </View>
    );
}

// ─── Metric Cards ───────────────────────────────────────────────────
function MetricRow({ children }: { children: React.ReactNode }) {
    return <View style={styles.metricRow}>{children}</View>;
}

function MetricCard({
    icon, label, value, unit, badge, wide, onPress, children, sparkData, sparkColor, sparkFill, progress
}: {
    icon: React.ReactNode; label: string; value: string; unit?: string; badge?: string;
    wide?: boolean; onPress?: () => void; children?: React.ReactNode;
    sparkData?: number[]; sparkColor?: string; sparkFill?: string; progress?: number;
}) {
    const Wrapper = onPress ? TouchableOpacity : View;
    return (
        <Wrapper style={[styles.metricCard, wide && styles.metricCardWide]} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.metricHeader}>
                {icon}
                <Text style={styles.metricLabel}>{label}</Text>
            </View>
            <View style={styles.metricBody}>
                <Text style={styles.metricValue}>{value}</Text>
                {unit ? <Text style={styles.metricUnit}>{unit}</Text> : null}
                {badge && (
                    <View style={styles.metricBadge}>
                        <Text style={styles.metricBadgeText}>{badge}</Text>
                    </View>
                )}
            </View>
            {sparkData && (
                <View style={{ marginTop: 8, marginHorizontal: -8, overflow: 'hidden' }}>
                    <MiniSparkline data={sparkData} color={sparkColor || '#EF4444'} fillColor={sparkFill || '#FCA5A5'} />
                </View>
            )}
            {progress !== undefined && <ProgressBar progress={progress} />}
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
                    <Text style={{ fontSize: 16 }}>💊</Text>
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
                    <Text style={{ fontSize: 16 }}>✅</Text>
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

            {/* Health Bar */}
            <TouchableOpacity onPress={() => nav.navigate('HealthScore')}>
                <HealthScoreArc score={healthScore} />
            </TouchableOpacity>

            {/* Macronutrients */}
            <MacronutrientsCard />

            {/* Steps & Heart Rate row */}
            <MetricRow>
                <MetricCard
                    icon={<StepsIcon />}
                    label="Steps"
                    value={metrics.steps > 0 ? metrics.steps.toLocaleString() : '8,533'}
                    unit="Steps"
                    progress={((metrics.steps || 8533) / 10000) * 100}
                    onPress={() => nav.navigate('Steps')}
                />
                <MetricCard
                    icon={<HeartIcon />}
                    label="Heart Rate"
                    value={metrics.heartRate > 0 ? metrics.heartRate.toString() : '87'}
                    unit="bpm"
                    badge={hrStatus || 'normal'}
                    sparkData={[72, 85, 78, 68, 82, 90, 75, 88, 95, 80, 85, 92]}
                    sparkColor="#EF4444"
                    sparkFill="#FCA5A5"
                    onPress={() => nav.navigate('HeartRate')}
                />
            </MetricRow>

            {/* Calories & Sleep row */}
            <MetricRow>
                <MetricCard
                    icon={<BoltIcon />}
                    label="Calories"
                    value={metrics.calories > 0 ? metrics.calories.toLocaleString() : '933'}
                    unit="Kcal"
                    progress={((metrics.calories || 933) / 2000) * 100}
                    onPress={() => nav.navigate('Calories')}
                />
                <MetricCard
                    icon={<MoonIcon />}
                    label="Sleep"
                    value={metrics.sleepHours > 0 ? `${metrics.sleepHours}h` : '7.5h'}
                    unit={metrics.deepSleep > 0 ? `${metrics.deepSleep}m Deep` : '45m Deep'}
                    progress={((metrics.sleepHours || 7.5) / 8) * 100}
                    onPress={() => nav.navigate('Sleep')}
                />
            </MetricRow>

            {/* Stress (wide) */}
            <MetricCard
                icon={<BrainIcon />}
                label="HRV / Stress"
                value={metrics.hrv > 0 ? metrics.hrv.toString() : '45'}
                unit="ms HRV"
                wide
                sparkData={[38, 42, 35, 50, 48, 45, 52, 40, 44, 47, 50, 55]}
                sparkColor="#F59E0B"
                sparkFill="#FDE68A"
                onPress={() => nav.navigate('Stress')}
            />

            {/* Goals Card */}
            <TouchableOpacity style={styles.goalsCard} onPress={() => nav.navigate('Goals')}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 24 }}>🎯</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>90-Day Goals</Text>
                        <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Set targets & track your progress</Text>
                    </View>
                    <Text style={{ fontSize: 20, color: '#9ca3af' }}>›</Text>
                </View>
            </TouchableOpacity>

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
        flex: 1, backgroundColor: '#fff', borderRadius: 24, padding: 16,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    metricCardWide: { marginBottom: 12 },
    metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    metricLabel: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', letterSpacing: -0.2 },
    metricBody: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
    metricValue: { fontSize: 32, fontWeight: '800', color: '#1C1C1E', letterSpacing: -1 },
    metricUnit: { fontSize: 14, fontWeight: '400', color: '#8E8E93' },
    metricBadge: { backgroundColor: '#D1FAE5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
    metricBadgeText: { fontSize: 12, fontWeight: '600', color: '#065F46' },

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

    // Goals card
    goalsCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },

    // Macronutrients
    macroCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    macroHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    macroTitle: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', letterSpacing: -0.2 },
    macroRow: { flexDirection: 'row', justifyContent: 'space-around' },
    macroItem: { alignItems: 'center' },
    macroValue: { position: 'absolute', fontSize: 13, fontWeight: '600', color: '#1C1C1E' },
    macroLabel: { fontSize: 13, color: '#8E8E93', marginTop: 4 },
});
