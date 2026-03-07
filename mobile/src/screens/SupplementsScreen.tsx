import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function SupplementsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { profile } = useAuth();
    const [supplements, setSupplements] = useState<any[]>([]);
    const [taken, setTaken] = useState<Set<string>>(new Set());

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const { data } = await supabase.from('supplements').select('*').eq('active', true);
            if (data?.length) {
                setSupplements(data);
            } else {
                // Fallback defaults
                setSupplements([
                    { id: '1', name: 'Vitamin D', dosage: '5000 IU', frequency: 'Daily', active: true },
                    { id: '2', name: 'Omega-3 Fatty Acids', dosage: '1000mg', frequency: 'Daily', active: true },
                    { id: '3', name: 'Magnesium', dosage: '400mg', frequency: 'Daily', active: true },
                    { id: '4', name: 'Probiotics', dosage: '10B CFU', frequency: 'Daily', active: true },
                    { id: '5', name: 'Zinc', dosage: '30mg', frequency: 'Daily', active: true },
                    { id: '6', name: 'Curcumin', dosage: '500mg', frequency: 'Daily', active: true },
                    { id: '7', name: 'Coenzyme Q10', dosage: '100mg', frequency: 'Daily', active: true },
                ]);
            }

            // Load today's taken supplements
            const today = new Date().toISOString().split('T')[0];
            try {
                const { data: logs } = await supabase
                    .from('supplement_logs')
                    .select('supplement_id')
                    .eq('user_id', profile?.id)
                    .gte('taken_at', today);
                if (logs?.length) {
                    setTaken(new Set(logs.map(l => l.supplement_id)));
                }
            } catch (e) {
                // supplement_logs table might not exist yet
            }
        } catch {
            setSupplements([
                { id: '1', name: 'Vitamin D', dosage: '5000 IU', frequency: 'Daily', active: true },
                { id: '2', name: 'Omega-3', dosage: '1000mg', frequency: 'Daily', active: true },
                { id: '3', name: 'Magnesium', dosage: '400mg', frequency: 'Daily', active: true },
            ]);
        }
    };

    const toggleTaken = async (id: string) => {
        const wasTaken = taken.has(id);
        setTaken(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

        // Persist to Supabase
        try {
            if (!wasTaken) {
                await supabase.from('supplement_logs').insert({
                    user_id: profile?.id,
                    supplement_id: id,
                    taken_at: new Date().toISOString(),
                });
            } else {
                const today = new Date().toISOString().split('T')[0];
                await supabase.from('supplement_logs')
                    .delete()
                    .eq('user_id', profile?.id)
                    .eq('supplement_id', id)
                    .gte('taken_at', today);
            }
        } catch (e) {
            console.log('Supplement log error (table may not exist):', e);
        }
    };

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backBtn}>← Back</Text></TouchableOpacity>
                <Text style={s.headerTitle}>Supplements</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Summary */}
            <View style={s.summaryCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={s.summaryTitle}>{taken.size}/{supplements.length} taken today</Text>
                        <Text style={s.summarySubtitle}>Keep your streak going!</Text>
                    </View>
                    <View style={s.streakBadge}><Text style={s.streakText}>7 day streak 🔥</Text></View>
                </View>
                <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${supplements.length > 0 ? (taken.size / supplements.length) * 100 : 0}%` }]} />
                </View>
            </View>

            {/* Supplement list */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Today's Supplements</Text>
                {supplements.map((supp, i) => (
                    <TouchableOpacity key={supp.id || i} style={s.suppRow} onPress={() => toggleTaken(supp.id || String(i))}>
                        <View style={[s.checkbox, taken.has(supp.id || String(i)) && s.checkboxChecked]}>
                            {taken.has(supp.id || String(i)) && <Text style={s.checkmark}>✓</Text>}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[s.suppName, taken.has(supp.id || String(i)) && s.suppNameDone]}>{supp.name}</Text>
                            <Text style={s.suppDose}>{supp.dosage} • {supp.frequency || 'Daily'}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={s.card}>
                <Text style={s.cardTitle}>💡 Tips</Text>
                <Text style={s.insightText}>• Take fat-soluble vitamins (D, K, E) with meals for better absorption.</Text>
                <Text style={s.insightText}>• Separate calcium and iron supplements by at least 2 hours.</Text>
                <Text style={s.insightText}>• Consistency matters more than timing — just take them daily.</Text>
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 12, backgroundColor: '#111' },
    backBtn: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
    summaryCard: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    summaryTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
    summarySubtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
    streakBadge: { borderWidth: 1, borderColor: '#06b6d4', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    streakText: { fontSize: 12, fontWeight: '600', color: '#06b6d4' },
    progressBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginTop: 12 },
    progressFill: { height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12 },
    suppRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
    checkboxChecked: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
    checkmark: { color: '#fff', fontSize: 16, fontWeight: '700' },
    suppName: { fontSize: 15, fontWeight: '600', color: '#111' },
    suppNameDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
    suppDose: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    insightText: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 6 },
});
