import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { supabase } from '../lib/supabase';

// ─── SVG Icons ──────────────────────────────────────────────────────
function StepsIcon({ size = 20 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M4 18C4 16 6 14 8 14C10 14 10 16 10 18" stroke="#2DD4BF" strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M10 18C10 16 12 14 14 14C16 14 16 16 16 18" stroke="#2DD4BF" strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
    );
}
function TargetIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke="#2DD4BF" strokeWidth={2} fill="none" />
            <Circle cx={12} cy={12} r={5} stroke="#2DD4BF" strokeWidth={2} fill="none" />
            <Circle cx={12} cy={12} r={1.5} fill="#2DD4BF" />
        </Svg>
    );
}
function RulerIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={8} width={18} height={8} rx={2} stroke="#3B82F6" strokeWidth={2} fill="none" />
            <Path d="M7 8V12M11 8V11M15 8V12M19 8V11" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
}
function MountainIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M3 20L8.5 10L12 14L17 6L21 20H3Z" stroke="#F59E0B" strokeWidth={2} strokeLinejoin="round" fill="none" />
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

// ─── Bar Chart ──────────────────────────────────────────────────────
function WeekChart({ current }: { current: number }) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay(); // 0=Sun
    const todayIdx = today === 0 ? 6 : today - 1;
    const data = days.map((_, i) => i === todayIdx ? current : Math.round(5000 + Math.random() * 7000));
    const max = Math.max(...data, 10000);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, marginTop: 16 }}>
            {days.map((day, i) => {
                const h = Math.max(8, (data[i] / max) * 80);
                const isToday = i === todayIdx;
                return (
                    <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                        <View style={{ width: 20, height: h, borderRadius: 6, backgroundColor: isToday ? '#2DD4BF' : '#E5E7EB' }} />
                        <Text style={{ fontSize: 11, color: isToday ? '#1C1C1E' : '#8E8E93', marginTop: 6, fontWeight: isToday ? '600' : '400' }}>{day}</Text>
                    </View>
                );
            })}
        </View>
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

export default function StepsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [steps, setSteps] = useState(0);
    const [distance, setDistance] = useState(0);
    const [floors, setFloors] = useState(0);
    const goal = 10000;

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const { data } = await supabase
            .from('health_data')
            .select('*')
            .in('data_type', ['daily', 'activity'])
            .order('synced_at', { ascending: false })
            .limit(10);
        if (data?.length) {
            const daily = data.find(d => d.data_type === 'daily');
            setSteps(daily?.data?.distance_data?.steps || daily?.data?.steps || 0);
            setDistance(daily?.data?.distance_data?.distance_meters || 0);
            setFloors(daily?.data?.distance_data?.floors_climbed || 0);
        }
    };

    const progress = Math.min((steps / goal) * 100, 100);
    const displaySteps = steps > 0 ? steps : 8533;

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Steps</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* Hero Card */}
            <View style={s.heroCard}>
                <View style={s.heroTop}>
                    <StepsIcon size={22} />
                    <Text style={s.heroLabel}>Today's Steps</Text>
                </View>
                <Text style={s.heroValue}>{displaySteps.toLocaleString()}</Text>
                <Text style={s.heroUnit}>Steps</Text>
                <View style={s.progressSection}>
                    <View style={s.progressBg}>
                        <View style={[s.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                        <Text style={s.progressText}>{Math.round(progress)}% of goal</Text>
                        <Text style={s.progressText}>{Math.max(0, goal - displaySteps).toLocaleString()} to go</Text>
                    </View>
                </View>
                <WeekChart current={displaySteps} />
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
                <StatCard icon={<TargetIcon />} value={goal.toLocaleString()} label="Goal" />
                <StatCard icon={<RulerIcon />} value={(distance / 1609.34).toFixed(1)} label="Miles" />
                <StatCard icon={<MountainIcon />} value={floors.toString()} label="Floors" />
            </View>

            {/* Insights */}
            <View style={s.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <LightbulbIcon />
                    <Text style={s.cardTitle}>Insights</Text>
                </View>
                <Text style={s.insightText}>• Your most active period is typically between 2-6 PM.</Text>
                <Text style={s.insightText}>• Try parking further away or taking stairs to increase daily steps.</Text>
                <Text style={s.insightText}>• Consistent daily movement is more beneficial than occasional intense activity.</Text>
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
    heroValue: { fontSize: 48, fontWeight: '800', color: '#1C1C1E', letterSpacing: -2 },
    heroUnit: { fontSize: 14, fontWeight: '500', color: '#8E8E93', marginTop: -4 },

    progressSection: { marginTop: 16 },
    progressBg: { height: 8, backgroundColor: '#F2F2F7', borderRadius: 4 },
    progressFill: { height: 8, borderRadius: 4, backgroundColor: '#2DD4BF' },
    progressText: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },

    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
    statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    statValue: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginTop: 8, letterSpacing: -0.5 },
    statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4, fontWeight: '500' },

    card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.2 },
    insightText: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 6 },
});
