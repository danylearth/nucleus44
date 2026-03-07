import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function LabResultsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const { data } = await supabase.from('blood_results').select('*').order('created_at', { ascending: false }).limit(20);
            if (data?.length) setResults(data);
        } catch {
            try {
                const { data } = await supabase.from('lab_results').select('*').order('test_date', { ascending: false }).limit(20);
                if (data?.length) setResults(data);
            } catch { }
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'normal' || status === 'Normal Range') return '#22c55e';
        if (status === 'high' || status === 'low') return '#ef4444';
        return '#eab308';
    };

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 16, fontWeight: '600' }}>← Back</Text></TouchableOpacity>
                <Text style={s.headerTitle}>Lab Results</Text>
                <TouchableOpacity><Text style={{ fontSize: 14, fontWeight: '600', color: '#06b6d4' }}>Upload</Text></TouchableOpacity>
            </View>

            {results.length === 0 ? (
                <View style={s.emptyCard}>
                    <Text style={{ fontSize: 48 }}>🧪</Text>
                    <Text style={s.emptyTitle}>No Lab Results Yet</Text>
                    <Text style={s.emptySubtitle}>Upload blood work or order tests to see your results here.</Text>
                    <TouchableOpacity style={s.orderBtn}><Text style={s.orderBtnText}>Order Tests</Text></TouchableOpacity>
                </View>
            ) : (
                results.map((r, i) => (
                    <TouchableOpacity key={i} style={s.resultCard}>
                        <View style={s.resultIcon}><Text style={{ fontSize: 22 }}>🩸</Text></View>
                        <View style={{ flex: 1 }}>
                            <Text style={s.resultName}>{r.test_name || r.test_type || 'Lab Test'}</Text>
                            <Text style={s.resultDate}>{r.test_date || r.created_at?.split('T')[0]}</Text>
                            <View style={[s.statusBadge, { backgroundColor: getStatusColor(r.status || '') + '20' }]}>
                                <Text style={[s.statusText, { color: getStatusColor(r.status || '') }]}>{r.status || 'Pending'}</Text>
                            </View>
                        </View>
                        <Text style={{ color: '#ccc', fontSize: 20 }}>›</Text>
                    </TouchableOpacity>
                ))
            )}

            <TouchableOpacity style={s.orderBtnFull}><Text style={s.orderBtnFullText}>Order New Tests</Text></TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
    emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 32, margin: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 12 },
    emptySubtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 4, lineHeight: 20 },
    orderBtn: { backgroundColor: '#06b6d4', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 16 },
    orderBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    resultCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    resultIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
    resultName: { fontSize: 15, fontWeight: '600', color: '#111' },
    resultDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    statusBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
    statusText: { fontSize: 11, fontWeight: '600' },
    orderBtnFull: { backgroundColor: '#111', borderRadius: 16, paddingVertical: 16, marginHorizontal: 16, marginTop: 8, alignItems: 'center' },
    orderBtnFullText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
