import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

interface TestParameter {
    name: string;
    description: string;
    value: number;
    unit: string;
    refRange: string;
    status: 'normal' | 'high' | 'low' | 'critical';
}

const STATUS_COLORS = {
    normal: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
    high: { bg: '#FEF9C3', text: '#854D0E', dot: '#EAB308' },
    low: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
    critical: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
};

const MOCK_PARAMETERS: TestParameter[] = [
    { name: 'White Blood Cell Count', description: 'Measures the number of white blood cells, which fight infection and are part of your immune system.', value: 7.2, unit: 'K/μL', refRange: '4.5 - 11.0', status: 'normal' },
    { name: 'Red Blood Cell Count', description: 'Measures oxygen-carrying red blood cells that transport oxygen throughout your body.', value: 4.8, unit: 'M/μL', refRange: '4.5 - 5.5', status: 'normal' },
    { name: 'Hemoglobin', description: 'Protein in red blood cells that carries oxygen from your lungs to the rest of your body.', value: 15.2, unit: 'g/dL', refRange: '13.5 - 17.5', status: 'normal' },
    { name: 'Eosinophils', description: 'White blood cells that fight parasites and are involved in allergic reactions.', value: 0.3, unit: 'K/μL', refRange: '0.0 - 0.5', status: 'normal' },
    { name: 'Basophils', description: 'White blood cells involved in allergic reactions.', value: 0.3, unit: 'K/μL', refRange: '0.0 - 0.1', status: 'high' },
];

export default function BloodResultDetailScreen({ route, navigation }: any) {
    const insets = useSafeAreaInsets();
    const resultId = route?.params?.resultId;
    const [result, setResult] = useState<any>(null);
    const [parameters, setParameters] = useState<TestParameter[]>(MOCK_PARAMETERS);

    useEffect(() => {
        if (resultId) loadResult();
    }, [resultId]);

    const loadResult = async () => {
        try {
            const { data } = await supabase.from('lab_results').select('*').eq('id', resultId).single();
            if (data) { setResult(data); if (data.results?.parameters) setParameters(data.results.parameters); }
        } catch (e) { /* use mock */ }
    };

    const testName = result?.test_name || 'Complete Blood Count (CBC)';
    const testDate = result?.test_date || 'January 15, 2024';
    const doctor = result?.doctor || 'Dr. Sarah Johnson';
    const lab = result?.laboratory || 'LabCorp';
    const normalCount = parameters.filter(p => p.status === 'normal').length;
    const allNormal = normalCount === parameters.length;

    const handleShare = async () => {
        try { await Share.share({ message: `${testName} results from ${testDate}` }); } catch (e) { }
    };

    return (
        <View style={[s.container, { paddingTop: insets.top }]}>
            {/* Red header */}
            <View style={s.redHeader}>
                <View style={s.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Text style={s.backText}>‹</Text>
                    </TouchableOpacity>
                    <Text style={s.headerLabel}>Heart Rate</Text>
                    <View style={s.headerActions}>
                        <TouchableOpacity style={s.headerIcon} onPress={handleShare}><Text style={{ fontSize: 14, color: '#fff' }}>📤</Text></TouchableOpacity>
                        <TouchableOpacity style={s.headerIcon}><Text style={{ fontSize: 14, color: '#fff' }}>📥</Text></TouchableOpacity>
                    </View>
                </View>
                <Text style={s.testTitle}>{testName}</Text>
                <Text style={s.testDate}>{testDate}</Text>
            </View>

            <ScrollView style={s.body} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Status banner */}
                <View style={[s.statusBanner, allNormal ? s.statusNormal : s.statusWarning]}>
                    <Text style={s.statusIcon}>{allNormal ? '✅' : '⚠️'}</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={s.statusTitle}>{allNormal ? 'All Results Normal' : 'Some Results Need Attention'}</Text>
                        <Text style={s.statusSub}>{normalCount}/{parameters.length} biomarkers are within the normal, healthy reference range.</Text>
                    </View>
                </View>

                {/* Info cards */}
                <View style={s.infoRow}>
                    <View style={s.infoCard}>
                        <Text style={s.infoLabel}>Ordered by</Text>
                        <Text style={s.infoValue}>{doctor}</Text>
                    </View>
                    <View style={s.infoCard}>
                        <Text style={s.infoLabel}>Laboratory</Text>
                        <Text style={s.infoValue}>{lab}</Text>
                    </View>
                </View>
                <View style={s.infoCard2}>
                    <Text style={s.infoLabel}>Test Date</Text>
                    <Text style={s.infoValue}>{testDate}</Text>
                </View>

                {/* Parameters header */}
                <View style={s.paramHeader}>
                    <Text style={s.paramTitle}>Test Parameters ({parameters.length})</Text>
                    <View style={s.trafficBadge}>
                        <View style={[s.trafficDot, { backgroundColor: '#22C55E' }]} />
                        <View style={[s.trafficDot, { backgroundColor: '#EAB308' }]} />
                        <View style={[s.trafficDot, { backgroundColor: '#EF4444' }]} />
                        <Text style={s.trafficText}>Traffic Light System</Text>
                    </View>
                </View>

                {/* Parameters list */}
                {parameters.map((param, i) => {
                    const statusColor = STATUS_COLORS[param.status];
                    return (
                        <View key={i} style={s.paramCard}>
                            <View style={s.paramRow}>
                                <View style={[s.paramDot, { backgroundColor: statusColor.dot }]} />
                                <Text style={s.paramName}>{param.name}</Text>
                                <View style={[s.paramBadge, { backgroundColor: statusColor.bg }]}>
                                    <Text style={[s.paramBadgeText, { color: statusColor.text }]}>
                                        {param.status.charAt(0).toUpperCase() + param.status.slice(1)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={s.paramDesc}>{param.description}</Text>
                            <Text style={s.paramValue}>{param.value} <Text style={s.paramUnit}>{param.unit}</Text></Text>
                            <Text style={s.paramRef}>Reference Range    {param.refRange}</Text>
                        </View>
                    );
                })}

                {/* Bottom actions */}
                <View style={s.bottomActions}>
                    <TouchableOpacity style={s.actionBtn}>
                        <Text style={s.actionIcon}>📥</Text>
                        <Text style={s.actionText}>Download PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.actionBtn} onPress={handleShare}>
                        <Text style={s.actionIcon}>📤</Text>
                        <Text style={s.actionText}>Share Results</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={s.chatBtn} onPress={() => navigation.navigate('AI')}>
                    <Text style={{ fontSize: 16 }}>💬</Text>
                    <Text style={s.chatBtnText}>Chat with AI about these results</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    redHeader: { backgroundColor: '#EF4444', paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 28, fontWeight: '300', color: '#fff' },
    headerLabel: { fontSize: 14, fontWeight: '600', color: '#fff', opacity: 0.8 },
    headerActions: { flexDirection: 'row', gap: 8 },
    headerIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    testTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginTop: 12 },
    testDate: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4 },
    body: { flex: 1 },
    statusBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 16, gap: 12 },
    statusNormal: { backgroundColor: '#DCFCE7' },
    statusWarning: { backgroundColor: '#FEF3C7' },
    statusIcon: { fontSize: 24 },
    statusTitle: { fontSize: 14, fontWeight: '600', color: '#166534' },
    statusSub: { fontSize: 12, color: '#15803D', marginTop: 2, lineHeight: 16 },
    infoRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 12 },
    infoCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
    infoCard2: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginHorizontal: 16, marginTop: 10, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
    infoLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '500' },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginTop: 4 },
    paramHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 20, marginBottom: 10 },
    paramTitle: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
    trafficBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, gap: 4 },
    trafficDot: { width: 8, height: 8, borderRadius: 4 },
    trafficText: { fontSize: 11, color: '#8E8E93', marginLeft: 2 },
    paramCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
    paramRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    paramDot: { width: 10, height: 10, borderRadius: 5 },
    paramName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
    paramBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
    paramBadgeText: { fontSize: 11, fontWeight: '600' },
    paramDesc: { fontSize: 12, color: '#8E8E93', lineHeight: 16, marginBottom: 10 },
    paramValue: { fontSize: 28, fontWeight: '800', color: '#1C1C1E', marginBottom: 4 },
    paramUnit: { fontSize: 16, fontWeight: '400', color: '#8E8E93' },
    paramRef: { fontSize: 12, color: '#8E8E93' },
    bottomActions: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 8 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, gap: 6, borderWidth: 1, borderColor: '#E5E5EA' },
    actionIcon: { fontSize: 14 },
    actionText: { fontSize: 13, fontWeight: '600', color: '#1C1C1E' },
    chatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C1E', borderRadius: 14, paddingVertical: 14, marginHorizontal: 16, marginTop: 10, gap: 8 },
    chatBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
