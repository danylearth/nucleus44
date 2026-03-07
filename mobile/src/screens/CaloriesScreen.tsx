import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function CaloriesScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [cals, setCals] = useState({ burned: 0, active: 0, bmr: 0, consumed: 0 });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const { data } = await supabase.from('health_data').select('*')
            .in('data_type', ['daily', 'activity', 'nutrition'])
            .order('synced_at', { ascending: false }).limit(10);
        if (data?.length) {
            const daily = data.find(d => d.data_type === 'daily');
            const nutrition = data.find(d => d.data_type === 'nutrition');
            const burned = daily?.data?.calories_data?.total_burned_calories || 0;
            const active = daily?.data?.calories_data?.net_activity_calories || 0;
            const bmrVal = burned - active;
            setCals({ burned: Math.round(burned), active: Math.round(active), bmr: Math.round(bmrVal > 0 ? bmrVal : 1800), consumed: Math.round(nutrition?.data?.summary?.calories || 0) });
        }
    };

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={[s.header, { backgroundColor: '#f97316' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backBtn}>← Back</Text></TouchableOpacity>
                <Text style={s.headerTitle}>Calories</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={[s.hero, { backgroundColor: '#f97316' }]}>
                <Text style={s.heroValue}>{cals.burned > 0 ? cals.burned.toLocaleString() : '—'}</Text>
                <Text style={s.heroUnit}>calories burned</Text>
            </View>

            <View style={s.statsRow}>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>🔥</Text><Text style={s.statValue}>{cals.active || '—'}</Text><Text style={s.statLabel}>Active</Text></View>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>💤</Text><Text style={s.statValue}>{cals.bmr}</Text><Text style={s.statLabel}>BMR</Text></View>
                <View style={s.statBox}><Text style={{ fontSize: 20 }}>🍔</Text><Text style={s.statValue}>{cals.consumed || '—'}</Text><Text style={s.statLabel}>Consumed</Text></View>
            </View>

            {/* Breakdown */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Calorie Balance</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={s.balanceLabel}>Burned</Text>
                    <Text style={[s.balanceValue, { color: '#f97316' }]}>{cals.burned} kcal</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={s.balanceLabel}>Consumed</Text>
                    <Text style={[s.balanceValue, { color: '#22c55e' }]}>{cals.consumed || '—'} kcal</Text>
                </View>
                <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[s.balanceLabel, { fontWeight: '700' }]}>Net</Text>
                    <Text style={[s.balanceValue, { fontWeight: '700' }]}>{cals.consumed > 0 ? cals.consumed - cals.burned : '—'} kcal</Text>
                </View>
            </View>

            <View style={s.card}>
                <Text style={s.cardTitle}>💡 Insights</Text>
                <Text style={s.insightText}>• Your basal metabolic rate accounts for 60-70% of total calories burned.</Text>
                <Text style={s.insightText}>• Active calories increase with exercise intensity and duration.</Text>
                <Text style={s.insightText}>• Track your nutrition to see your complete calorie balance.</Text>
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
    statsRow: { flexDirection: 'row', gap: 10, padding: 16 },
    statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    statValue: { fontSize: 22, fontWeight: '700', color: '#111', marginTop: 4 },
    statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12 },
    balanceLabel: { fontSize: 14, color: '#6b7280' },
    balanceValue: { fontSize: 14, fontWeight: '600', color: '#111' },
    insightText: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 6 },
});
