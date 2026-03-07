import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

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

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={[s.header, { backgroundColor: '#22c55e' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backBtn}>← Back</Text></TouchableOpacity>
                <Text style={s.headerTitle}>Stress & HRV</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={[s.hero, { backgroundColor: '#22c55e' }]}>
                <Text style={s.heroValue}>{hrv > 0 ? hrv : '—'}</Text>
                <Text style={s.heroUnit}>HRV (ms)</Text>
                <View style={s.badge}><Text style={s.badgeText}>Stress: {stressLevel}</Text></View>
            </View>

            <View style={s.statsRow}>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>🧘</Text><Text style={s.statValue}>{stressLevel}</Text><Text style={s.statLabel}>Level</Text></View>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>📊</Text><Text style={s.statValue}>{hrv}</Text><Text style={s.statLabel}>Avg HRV</Text></View>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>⚡</Text><Text style={s.statValue}>{hrv > 50 ? 'Good' : 'Fair'}</Text><Text style={s.statLabel}>Recovery</Text></View>
            </View>

            {/* HRV explanation */}
            <View style={s.card}>
                <Text style={s.cardTitle}>What is HRV?</Text>
                <Text style={s.insightText}>Heart Rate Variability (HRV) measures the variation between heartbeats. Higher HRV generally indicates better stress management and recovery capacity.</Text>
                <View style={{ marginTop: 12 }}>
                    {[
                        { range: '50+ ms', label: 'Excellent — low stress, good recovery', color: '#22c55e' },
                        { range: '30-50 ms', label: 'Normal — moderate stress levels', color: '#eab308' },
                        { range: '<30 ms', label: 'Low — high stress, needs recovery', color: '#ef4444' },
                    ].map((z, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: z.color }} />
                            <Text style={{ fontSize: 12, color: '#6b7280' }}><Text style={{ fontWeight: '600', color: '#111' }}>{z.range}:</Text> {z.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={s.card}>
                <Text style={s.cardTitle}>💡 Reduce Stress</Text>
                <Text style={s.insightText}>• Practice deep breathing for 5 minutes daily.</Text>
                <Text style={s.insightText}>• Get 7-9 hours of quality sleep each night.</Text>
                <Text style={s.insightText}>• Regular exercise improves HRV over time.</Text>
                <Text style={s.insightText}>• Limit caffeine and alcohol intake for better recovery.</Text>
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
    insightText: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 6 },
});
