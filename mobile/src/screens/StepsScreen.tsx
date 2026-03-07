import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

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

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={[s.header, { backgroundColor: '#06b6d4' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={s.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Steps</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={[s.hero, { backgroundColor: '#06b6d4' }]}>
                <Text style={s.heroValue}>{steps > 0 ? steps.toLocaleString() : '—'}</Text>
                <Text style={s.heroUnit}>steps today</Text>
                <View style={s.badge}><Text style={s.badgeText}>{Math.round(progress)}% of goal</Text></View>
            </View>

            <View style={s.statsRow}>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>🎯</Text><Text style={s.statValue}>{goal.toLocaleString()}</Text><Text style={s.statLabel}>Goal</Text></View>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>📏</Text><Text style={s.statValue}>{(distance / 1609.34).toFixed(1)}</Text><Text style={s.statLabel}>Miles</Text></View>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>🏔️</Text><Text style={s.statValue}>{floors}</Text><Text style={s.statLabel}>Floors</Text></View>
            </View>

            {/* Progress bar */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Daily Progress</Text>
                <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${progress}%`, backgroundColor: '#06b6d4' }]} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={s.progressText}>{steps.toLocaleString()} steps</Text>
                    <Text style={s.progressText}>{Math.max(0, goal - steps).toLocaleString()} to go</Text>
                </View>
            </View>

            <View style={s.card}>
                <Text style={s.cardTitle}>💡 Insights</Text>
                <Text style={s.insightText}>• Your most active period is typically between 2-6 PM.</Text>
                <Text style={s.insightText}>• Try parking further away or taking stairs to increase daily steps.</Text>
                <Text style={s.insightText}>• Consistent daily movement is more beneficial than occasional intense activity.</Text>
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
    progressBg: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5 },
    progressFill: { height: 10, borderRadius: 5 },
    progressText: { fontSize: 12, color: '#6b7280' },
    insightText: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 6 },
});
