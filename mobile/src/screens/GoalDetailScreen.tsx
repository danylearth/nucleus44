import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { callFunction } from '../lib/supabase';

export default function GoalDetailScreen({ route, navigation }: any) {
    const insets = useSafeAreaInsets();
    const { goalId } = route.params;
    const [goal, setGoal] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [checkInValue, setCheckInValue] = useState('');
    const [showCheckIn, setShowCheckIn] = useState(false);

    const loadGoal = async () => {
        try {
            const result = await callFunction('goals', {}, 'GET');
            const found = result?.goals?.find((g: any) => g.id === goalId);
            if (found) setGoal(found);
        } catch (e) { console.log('Goal load error:', e); }

        try {
            const result = await callFunction(`goals/${goalId}/history`, {}, 'GET');
            if (result?.history) setHistory(result.history);
        } catch (e) { console.log('History load error:', e); }
    };

    useFocusEffect(useCallback(() => { loadGoal(); }, [goalId]));

    const submitCheckIn = async () => {
        if (!checkInValue.trim()) return;
        try {
            const result = await callFunction(`goals/${goalId}/check-in`, {
                value: parseFloat(checkInValue),
                source: 'manual',
            });
            setCheckInValue('');
            setShowCheckIn(false);
            if (result?.completed) {
                Alert.alert('🎉 Goal Completed!', 'Congratulations! You hit your target!');
            }
            loadGoal();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to log check-in');
        }
    };

    const deleteGoal = () => {
        Alert.alert('Delete Goal', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await callFunction(`goals/${goalId}`, {}, 'DELETE');
                        navigation.goBack();
                    } catch (e) { console.log('Delete error:', e); }
                }
            },
        ]);
    };

    if (!goal) return <View style={[s.container, { paddingTop: insets.top }]}><Text style={{ padding: 20 }}>Loading...</Text></View>;

    const today = new Date();
    const endDate = new Date(goal.end_date);
    const startDate = new Date(goal.start_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const daysPassed = totalDays - daysLeft;
    const progress = goal.target_value && goal.current_value
        ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
        : 0;

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 16, fontWeight: '600' }}>← Back</Text></TouchableOpacity>
                <Text style={s.headerTitle}>Goal Detail</Text>
                <TouchableOpacity onPress={deleteGoal}><Text style={{ fontSize: 14, color: '#ef4444' }}>Delete</Text></TouchableOpacity>
            </View>

            {/* Hero card */}
            <View style={s.heroCard}>
                <Text style={s.heroTitle}>{goal.title}</Text>
                <View style={s.heroProgressRow}>
                    <Text style={s.heroPercent}>{progress}%</Text>
                    <Text style={s.heroDays}>{daysLeft} days left</Text>
                </View>
                <View style={s.heroBarBg}>
                    <View style={[s.heroBarFill, { width: `${progress}%` }]} />
                </View>
                {goal.target_value && (
                    <Text style={s.heroTarget}>
                        {goal.current_value || 0} → {goal.target_value} {goal.unit || ''}
                    </Text>
                )}
                <View style={s.statusRow}>
                    <View style={[s.statusBadge, goal.status === 'completed' ? { backgroundColor: '#dcfce7' } : { backgroundColor: '#dbeafe' }]}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: goal.status === 'completed' ? '#16a34a' : '#2563eb' }}>
                            {goal.status === 'completed' ? '✅ Completed' : '🔵 Active'}
                        </Text>
                    </View>
                    <Text style={s.dateRange}>{goal.start_date} → {goal.end_date}</Text>
                </View>
            </View>

            {/* Timeline dots */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Progress Timeline</Text>
                <View style={s.timeline}>
                    <View style={s.timelineLine} />
                    <View style={[s.timelineDot, { backgroundColor: '#22c55e' }]}>
                        <Text style={s.dotLabel}>Start</Text>
                    </View>
                    <View style={[s.timelineDot, { left: `${Math.min(95, (daysPassed / totalDays) * 100)}%`, backgroundColor: '#3b82f6' }]}>
                        <Text style={s.dotLabel}>Today</Text>
                    </View>
                    <View style={[s.timelineDot, { left: '95%', backgroundColor: '#111' }]}>
                        <Text style={s.dotLabel}>End</Text>
                    </View>
                </View>
            </View>

            {/* Check-in button / form */}
            {goal.status === 'active' && (
                <View style={s.card}>
                    <Text style={s.cardTitle}>Log Check-in</Text>
                    {showCheckIn ? (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TextInput
                                style={[s.input, { flex: 1 }]}
                                value={checkInValue}
                                onChangeText={setCheckInValue}
                                placeholder={`Current value (${goal.unit || 'number'})`}
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                autoFocus
                            />
                            <TouchableOpacity style={s.submitBtn} onPress={submitCheckIn}>
                                <Text style={s.submitBtnText}>Log</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={s.checkInBtn} onPress={() => setShowCheckIn(true)}>
                            <Text style={s.checkInBtnText}>+ Log Progress</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* History */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Check-in History</Text>
                {history.length === 0 ? (
                    <Text style={s.emptyText}>No check-ins yet. Log your first one above!</Text>
                ) : (
                    history.map((h, i) => (
                        <View key={i} style={s.historyRow}>
                            <View style={s.historyDot} />
                            <View style={{ flex: 1 }}>
                                <Text style={s.historyValue}>{h.value} {goal.unit || ''}</Text>
                                <Text style={s.historyDate}>{h.checked_at?.split('T')[0]} • {h.source}</Text>
                            </View>
                            {goal.target_value && (
                                <Text style={s.historyPct}>{Math.round((h.value / goal.target_value) * 100)}%</Text>
                            )}
                        </View>
                    ))
                )}
            </View>

            {/* CTA for clinic check-in */}
            {daysLeft <= 14 && goal.status === 'active' && (
                <View style={s.ctaCard}>
                    <Text style={{ fontSize: 24 }}>🏥</Text>
                    <Text style={s.ctaTitle}>Time for a Check-in!</Text>
                    <Text style={s.ctaSubtitle}>Your goal ends in {daysLeft} days. Book a clinic visit to measure your results.</Text>
                    <TouchableOpacity style={s.ctaBtn}><Text style={s.ctaBtnText}>Book Clinic Visit</Text></TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
    heroCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginHorizontal: 16, marginBottom: 12 },
    heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 12 },
    heroProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    heroPercent: { fontSize: 28, fontWeight: '800', color: '#22c55e' },
    heroDays: { fontSize: 14, color: '#9ca3af', alignSelf: 'flex-end' },
    heroBarBg: { height: 8, backgroundColor: '#374151', borderRadius: 4, marginBottom: 10 },
    heroBarFill: { height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
    heroTarget: { fontSize: 14, color: '#d1d5db' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
    statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    dateRange: { fontSize: 11, color: '#9ca3af' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12 },
    timeline: { height: 40, position: 'relative', marginTop: 8, marginBottom: 20 },
    timelineLine: { position: 'absolute', top: 6, left: 0, right: 0, height: 3, backgroundColor: '#e5e7eb', borderRadius: 2 },
    timelineDot: { position: 'absolute', top: 0, width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
    dotLabel: { position: 'absolute', top: 20, fontSize: 10, color: '#9ca3af', width: 40, textAlign: 'center', left: -12 },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, fontSize: 16, color: '#111' },
    submitBtn: { backgroundColor: '#22c55e', borderRadius: 12, paddingHorizontal: 24, justifyContent: 'center' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    checkInBtn: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    checkInBtnText: { fontSize: 15, fontWeight: '600', color: '#111' },
    emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingVertical: 12 },
    historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    historyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
    historyValue: { fontSize: 15, fontWeight: '600', color: '#111' },
    historyDate: { fontSize: 12, color: '#9ca3af' },
    historyPct: { fontSize: 14, fontWeight: '600', color: '#22c55e' },
    ctaCard: { backgroundColor: '#fffbeb', borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#fde68a' },
    ctaTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginTop: 8 },
    ctaSubtitle: { fontSize: 13, color: '#92400e', textAlign: 'center', marginTop: 4, lineHeight: 18 },
    ctaBtn: { backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 12 },
    ctaBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
