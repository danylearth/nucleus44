import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

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

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={[s.header, { backgroundColor: '#8b5cf6' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={s.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Sleep</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={[s.hero, { backgroundColor: '#8b5cf6' }]}>
                <Text style={s.heroValue}>{sleep.hours > 0 ? `${sleep.hours}h` : '—'}</Text>
                <Text style={s.heroUnit}>{sleep.deep > 0 ? `${sleep.deep}m Deep` : 'No sleep data'}</Text>
                <View style={s.badge}><Text style={s.badgeText}>Sleep Score: {sleep.score || '—'}</Text></View>
            </View>

            <View style={s.statsRow}>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>🎯</Text><Text style={s.statValue}>8h</Text><Text style={s.statLabel}>Goal</Text></View>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>🕐</Text><Text style={s.statValue}>11:15</Text><Text style={s.statLabel}>Bedtime</Text></View>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>🌅</Text><Text style={s.statValue}>7:15</Text><Text style={s.statLabel}>Wake up</Text></View>
            </View>

            {/* Sleep Stages */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Sleep Stages</Text>
                {[
                    { stage: 'Deep Sleep', mins: sleep.deep, color: '#6d28d9' },
                    { stage: 'Light Sleep', mins: sleep.light, color: '#a78bfa' },
                    { stage: 'REM Sleep', mins: sleep.rem, color: '#c4b5fd' },
                    { stage: 'Awake', mins: sleep.awake, color: '#e5e7eb' },
                ].map((s2, i) => {
                    const total = sleep.deep + sleep.light + sleep.rem + sleep.awake;
                    const pct = total > 0 ? Math.round((s2.mins / total) * 100) : 0;
                    return (
                        <View key={i} style={s.stageRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s2.color }} />
                                <Text style={s.stageText}>{s2.stage}</Text>
                            </View>
                            <Text style={s.stageTime}>{s2.mins}m</Text>
                            <View style={s.stageBarBg}>
                                <View style={[s.stageBarFill, { width: `${pct}%`, backgroundColor: s2.color }]} />
                            </View>
                            <Text style={s.stagePct}>{pct}%</Text>
                        </View>
                    );
                })}
            </View>

            {/* Quality */}
            <View style={s.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={s.cardTitle}>Sleep Quality</Text>
                    <Text style={{ color: '#8b5cf6', fontWeight: '600', fontSize: 14 }}>{sleep.score}/100</Text>
                </View>
                <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${sleep.score}%` }]} />
                </View>
            </View>

            <View style={s.card}>
                <Text style={s.cardTitle}>💡 Insights</Text>
                <Text style={s.insightText}>• Consistent bedtime helps improve sleep quality over time.</Text>
                <Text style={s.insightText}>• Avoid screens 1 hour before bed for better sleep onset.</Text>
                <Text style={s.insightText}>• 7-9 hours is the recommended sleep range for adults.</Text>
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 12 },
    backBtn: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
    hero: { alignItems: 'center', paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    heroValue: { fontSize: 56, fontWeight: '800', color: '#fff' },
    heroUnit: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
    badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5, marginTop: 10 },
    badgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: 10, padding: 16 },
    statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    statValue: { fontSize: 22, fontWeight: '700', color: '#111', marginTop: 4 },
    statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12 },
    stageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
    stageText: { fontSize: 13, fontWeight: '500', color: '#111', width: 80 },
    stageTime: { fontSize: 12, color: '#6b7280', width: 35 },
    stageBarBg: { flex: 1, height: 6, backgroundColor: '#f3f4f6', borderRadius: 3 },
    stageBarFill: { height: 6, borderRadius: 3 },
    stagePct: { fontSize: 12, color: '#6b7280', width: 30, textAlign: 'right' },
    progressBg: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5 },
    progressFill: { height: 10, borderRadius: 5, backgroundColor: '#8b5cf6' },
    insightText: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 6 },
});
