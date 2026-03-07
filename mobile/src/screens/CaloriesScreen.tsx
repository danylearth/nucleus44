import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { supabase } from '../lib/supabase';

// ─── SVG Icons ──────────────────────────────────────────────────────
function BoltIcon({ size = 20 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke="#2DD4BF" strokeWidth={2} strokeLinejoin="round" fill="none" />
        </Svg>
    );
}
function FlameIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M12 22C16 22 19 18.5 19 15C19 10 14 7 14 4C14 4 10 8 9 11C8 14 5 13 5 15C5 18.5 8 22 12 22Z" stroke="#F97316" strokeWidth={2} fill="none" />
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
function FoodIcon() {
    return (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke="#22C55E" strokeWidth={2} fill="none" />
            <Path d="M8 12H16M12 8V16" stroke="#22C55E" strokeWidth={2} strokeLinecap="round" />
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

    const displayBurned = cals.burned > 0 ? cals.burned : 933;

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Calories</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* Hero Card */}
            <View style={s.heroCard}>
                <View style={s.heroTop}>
                    <BoltIcon size={22} />
                    <Text style={s.heroLabel}>Total Burned</Text>
                </View>
                <Text style={s.heroValue}>{displayBurned.toLocaleString()}</Text>
                <Text style={s.heroUnit}>Kcal</Text>
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
                <StatCard icon={<FlameIcon />} value={cals.active > 0 ? cals.active.toString() : '320'} label="Active" />
                <StatCard icon={<RestIcon />} value={cals.bmr.toString()} label="BMR" />
                <StatCard icon={<FoodIcon />} value={cals.consumed > 0 ? cals.consumed.toString() : '—'} label="Consumed" />
            </View>

            {/* Calorie Balance */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Calorie Balance</Text>
                <View style={s.balanceRow}>
                    <Text style={s.balanceLabel}>Burned</Text>
                    <Text style={[s.balanceValue, { color: '#F97316' }]}>{displayBurned} kcal</Text>
                </View>
                <View style={s.balanceRow}>
                    <Text style={s.balanceLabel}>Consumed</Text>
                    <Text style={[s.balanceValue, { color: '#22C55E' }]}>{cals.consumed || '—'} kcal</Text>
                </View>
                <View style={[s.balanceRow, { borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 10 }]}>
                    <Text style={[s.balanceLabel, { fontWeight: '700', color: '#1C1C1E' }]}>Net</Text>
                    <Text style={[s.balanceValue, { fontWeight: '700', color: '#1C1C1E' }]}>
                        {cals.consumed > 0 ? `${cals.consumed - displayBurned} kcal` : '—'}
                    </Text>
                </View>
            </View>

            {/* Insights */}
            <View style={s.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <LightbulbIcon />
                    <Text style={s.cardTitle}>Insights</Text>
                </View>
                <Text style={s.insightText}>• Your basal metabolic rate accounts for 60-70% of total calories burned.</Text>
                <Text style={s.insightText}>• Active calories increase with exercise intensity and duration.</Text>
                <Text style={s.insightText}>• Track your nutrition to see your complete calorie balance.</Text>
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

    statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
    statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    statValue: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginTop: 8, letterSpacing: -0.5 },
    statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4, fontWeight: '500' },

    card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.2 },

    balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    balanceLabel: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
    balanceValue: { fontSize: 14, fontWeight: '600' },

    insightText: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 6 },
});
