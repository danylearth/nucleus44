import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { supabase } from '../lib/supabase';

// ─── SVG Icons ──────────────────────────────────────────────────────
function MoonIcon({ size = 20 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="#8B5CF6" strokeWidth={2} fill="none" />
        </Svg>
    );
}
function TargetIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke="#8B5CF6" strokeWidth={2} fill="none" />
            <Circle cx={12} cy={12} r={5} stroke="#8B5CF6" strokeWidth={2} fill="none" />
            <Circle cx={12} cy={12} r={1.5} fill="#8B5CF6" />
        </Svg>
    );
}
function ClockIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke="#6366F1" strokeWidth={2} fill="none" />
            <Path d="M12 7V12L15 15" stroke="#6366F1" strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
}
function SunIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={4} stroke="#F59E0B" strokeWidth={2} fill="none" />
            <Path d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />
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

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <View style={s.statBox}>
            {icon}
            <Text style={s.statValue}>{value}</Text>
            <Text style={s.statLabel}>{label}</Text>
        </View>
    );
}

export default function SleepScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [sleep, setSleep] = useState({ hours: 0, minutes: 0, deep: 0, light: 0, rem: 0, awake: 0, score: 0 });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const { data } = await supabase
            .from('health_data')
            .select('*')
            .eq('data_type', 'sleep')
            .order('synced_at', { ascending: false })
            .limit(1);
        if (data?.[0]?.data?.sleep_durations_data?.asleep) {
            const d = data[0].data.sleep_durations_data.asleep;
            const total = d.duration_asleep_state_seconds || 0;
            const deep = d.duration_deep_sleep_state_seconds || 0;
            const light = d.duration_light_sleep_state_seconds || 0;
            const rem = d.duration_REM_sleep_state_seconds || 0;
            const awake = data[0].data.sleep_durations_data?.awake?.duration_awake_state_seconds || 0;
            setSleep({
                hours: Math.floor(total / 3600),
                minutes: Math.floor((total % 3600) / 60),
                deep: Math.round(deep / 60),
                light: Math.round(light / 60),
                rem: Math.round(rem / 60),
                awake: Math.round(awake / 60),
                score: Math.min(100, Math.round((total / (8 * 3600)) * 100)),
            });
        }
    };

    const displayHours = sleep.hours > 0 ? sleep.hours : 7;
    const displayMins = sleep.hours > 0 ? sleep.minutes : 32;
    const displayScore = sleep.score || 82;

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Sleep</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* Hero Card */}
            <View style={s.heroCard}>
                <View style={s.heroTop}>
                    <MoonIcon size={22} />
                    <Text style={s.heroLabel}>Last Night</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={s.heroValue}>{displayHours}</Text>
                    <Text style={s.heroSmall}>h</Text>
                    <Text style={s.heroValue}>{displayMins}</Text>
                    <Text style={s.heroSmall}>m</Text>
                </View>
                <View style={s.scoreRow}>
                    <View style={[s.scoreBadge, displayScore >= 75 ? s.scoreBadgeGood : s.scoreBadgeFair]}>
                        <Text style={[s.scoreBadgeText, displayScore >= 75 ? s.scoreBadgeTextGood : s.scoreBadgeTextFair]}>
                            Score: {displayScore}/100
                        </Text>
                    </View>
                </View>
                <View style={s.qualityBar}>
                    <View style={[s.qualityFill, { width: `${displayScore}%` }]} />
                </View>
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
                <StatCard icon={<TargetIcon />} value="8h" label="Goal" />
                <StatCard icon={<ClockIcon />} value="11:15" label="Bedtime" />
                <StatCard icon={<SunIcon />} value="7:15" label="Wake up" />
            </View>

            {/* Sleep Stages */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Sleep Stages</Text>
                {[
                    { stage: 'Deep Sleep', mins: sleep.deep || 95, color: '#6D28D9' },
                    { stage: 'Light Sleep', mins: sleep.light || 180, color: '#A78BFA' },
                    { stage: 'REM Sleep', mins: sleep.rem || 110, color: '#C4B5FD' },
                    { stage: 'Awake', mins: sleep.awake || 15, color: '#E5E7EB' },
                ].map((st, i) => {
                    const total = (sleep.deep || 95) + (sleep.light || 180) + (sleep.rem || 110) + (sleep.awake || 15);
                    const pct = total > 0 ? Math.round((st.mins / total) * 100) : 0;
                    return (
                        <View key={i} style={s.stageRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: st.color }} />
                                <Text style={s.stageText}>{st.stage}</Text>
                            </View>
                            <Text style={s.stageTime}>{st.mins}m</Text>
                            <View style={s.stageBarBg}>
                                <View style={[s.stageBarFill, { width: `${pct}%`, backgroundColor: st.color }]} />
                            </View>
                            <Text style={s.stagePct}>{pct}%</Text>
                        </View>
                    );
                })}
            </View>

            {/* Insights */}
            <View style={s.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <LightbulbIcon />
                    <Text style={s.cardTitle}>Insights</Text>
                </View>
                <Text style={s.insightText}>• Consistent bedtime helps improve sleep quality over time.</Text>
                <Text style={s.insightText}>• Avoid screens 1 hour before bed for better sleep onset.</Text>
                <Text style={s.insightText}>• 7-9 hours is the recommended sleep range for adults.</Text>
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
    heroValue: { fontSize: 52, fontWeight: '800', color: '#1C1C1E', letterSpacing: -2 },
    heroSmall: { fontSize: 22, fontWeight: '500', color: '#8E8E93', marginBottom: 8 },

    scoreRow: { marginTop: 12 },
    scoreBadge: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
    scoreBadgeGood: { backgroundColor: '#EDE9FE' },
    scoreBadgeFair: { backgroundColor: '#FEF3C7' },
    scoreBadgeText: { fontSize: 13, fontWeight: '600' },
    scoreBadgeTextGood: { color: '#6D28D9' },
    scoreBadgeTextFair: { color: '#92400E' },
    qualityBar: { height: 6, backgroundColor: '#F2F2F7', borderRadius: 3, marginTop: 12 },
    qualityFill: { height: 6, borderRadius: 3, backgroundColor: '#8B5CF6' },

    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
    statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    statValue: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginTop: 8, letterSpacing: -0.5 },
    statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4, fontWeight: '500' },

    card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.2 },

    stageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
    stageText: { fontSize: 13, fontWeight: '500', color: '#1C1C1E', width: 80 },
    stageTime: { fontSize: 12, color: '#8E8E93', width: 35 },
    stageBarBg: { flex: 1, height: 6, backgroundColor: '#F2F2F7', borderRadius: 3 },
    stageBarFill: { height: 6, borderRadius: 3 },
    stagePct: { fontSize: 12, color: '#8E8E93', width: 30, textAlign: 'right', fontWeight: '500' },

    insightText: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 6 },
});
