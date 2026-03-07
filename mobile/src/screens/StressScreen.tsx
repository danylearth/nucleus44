import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { supabase } from '../lib/supabase';

// ─── SVG Icons ──────────────────────────────────────────────────────
function BrainIcon({ size = 20 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M12 4C8 4 5 7 5 10C5 14 12 20 12 20C12 20 19 14 19 10C19 7 16 4 12 4Z" stroke="#F59E0B" strokeWidth={2} fill="none" />
            <Circle cx={12} cy={10} r={2} stroke="#F59E0B" strokeWidth={2} fill="none" />
        </Svg>
    );
}
function HeartWaveIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M3 12H7L9 8L12 16L15 10L17 12H21" stroke="#22C55E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function ChartIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M3 17L9 11L13 15L21 7" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M17 7H21V11" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function BoltIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke="#F97316" strokeWidth={2} strokeLinejoin="round" fill="none" />
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

// ─── HRV Sparkline ──────────────────────────────────────────────────
function HrvSparkline({ data, width = 280, height = 80 }: { data: number[]; width?: number; height?: number }) {
    const w = width; const h = height;
    const min = Math.min(...data) * 0.85;
    const max = Math.max(...data) * 1.15;
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
                <LinearGradient id="hrvFill" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#86EFAC" stopOpacity="0.4" />
                    <Stop offset="1" stopColor="#86EFAC" stopOpacity="0.02" />
                </LinearGradient>
            </Defs>
            <Path d={fillPath} fill="url(#hrvFill)" />
            <Path d={linePath} stroke="#22C55E" strokeWidth={2.5} fill="none" />
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

export default function StressScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [hrv, setHrv] = useState(0);
    const [stressLevel, setStressLevel] = useState('—');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const { data } = await supabase.from('health_data').select('*')
            .eq('data_type', 'body').order('synced_at', { ascending: false }).limit(1);
        if (data?.[0]?.data?.heart_data?.heart_rate_data?.summary) {
            const hrvVal = data[0].data.heart_data.heart_rate_data.summary.avg_hrv || 0;
            setHrv(Math.round(hrvVal));
            if (hrvVal > 50) setStressLevel('Low');
            else if (hrvVal > 30) setStressLevel('Moderate');
            else setStressLevel('High');
        }
    };

    const displayHrv = hrv > 0 ? hrv : 45;
    const displayLevel = stressLevel !== '—' ? stressLevel : 'Low';
    const sparkData = [38, 42, 35, 50, 48, 45, 52, 40, 44, 47, 50, 55, displayHrv];

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Stress & HRV</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* Hero Card */}
            <View style={s.heroCard}>
                <View style={s.heroTop}>
                    <BrainIcon size={22} />
                    <Text style={s.heroLabel}>Heart Rate Variability</Text>
                </View>
                <View style={s.heroRow}>
                    <Text style={s.heroValue}>{displayHrv}</Text>
                    <Text style={s.heroUnit}>ms</Text>
                    <View style={[s.badge, displayLevel === 'Low' ? s.badgeGood : displayLevel === 'Moderate' ? s.badgeFair : s.badgeWarn]}>
                        <Text style={[s.badgeText, displayLevel === 'Low' ? s.badgeTextGood : displayLevel === 'Moderate' ? s.badgeTextFair : s.badgeTextWarn]}>
                            {displayLevel} stress
                        </Text>
                    </View>
                </View>
                <View style={{ marginTop: 16, marginHorizontal: -16, overflow: 'hidden', borderRadius: 16 }}>
                    <HrvSparkline data={sparkData} />
                </View>
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
                <StatCard icon={<HeartWaveIcon />} value={displayLevel} label="Stress Level" />
                <StatCard icon={<ChartIcon />} value={displayHrv.toString()} label="Avg HRV" />
                <StatCard icon={<BoltIcon />} value={displayHrv > 50 ? 'Good' : 'Fair'} label="Recovery" />
            </View>

            {/* What is HRV */}
            <View style={s.card}>
                <Text style={s.cardTitle}>What is HRV?</Text>
                <Text style={s.description}>Heart Rate Variability measures the variation between heartbeats. Higher HRV indicates better stress management and recovery.</Text>
                <View style={{ marginTop: 14, gap: 10 }}>
                    {[
                        { range: '50+ ms', label: 'Excellent — low stress, good recovery', color: '#22C55E' },
                        { range: '30-50 ms', label: 'Normal — moderate stress levels', color: '#EAB308' },
                        { range: '<30 ms', label: 'Low — high stress, needs recovery', color: '#EF4444' },
                    ].map((z, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: z.color }} />
                            <Text style={s.rangeText}><Text style={{ fontWeight: '600', color: '#1C1C1E' }}>{z.range}:</Text> {z.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Tips */}
            <View style={s.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <LightbulbIcon />
                    <Text style={s.cardTitle}>Reduce Stress</Text>
                </View>
                <Text style={s.insightText}>• Practice deep breathing for 5 minutes daily.</Text>
                <Text style={s.insightText}>• Get 7-9 hours of quality sleep each night.</Text>
                <Text style={s.insightText}>• Regular exercise improves HRV over time.</Text>
                <Text style={s.insightText}>• Limit caffeine and alcohol intake for better recovery.</Text>
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
    badgeFair: { backgroundColor: '#FEF3C7' },
    badgeWarn: { backgroundColor: '#FEE2E2' },
    badgeText: { fontSize: 13, fontWeight: '600' },
    badgeTextGood: { color: '#065F46' },
    badgeTextFair: { color: '#92400E' },
    badgeTextWarn: { color: '#991B1B' },

    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
    statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    statValue: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginTop: 8, letterSpacing: -0.5 },
    statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4, fontWeight: '500' },

    card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.2 },

    description: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginTop: 4 },
    rangeText: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
    insightText: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 6 },
});
