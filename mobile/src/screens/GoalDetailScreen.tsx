import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { callFunction } from '../lib/supabase';

// ─── SVG Icons ──────────────────────────────────────────────────────
function CheckIcon({ color = '#fff' }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function HospitalIcon({ color = '#FF3B30' }) {
    return (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
            <Path d="M19 3H5C3.89543 3 3 3.89543 3 5V21H21V5C21 3.89543 20.1046 3 19 3Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 9V15M9 12H15" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M8 21V18C8 17.4477 8.44772 17 9 17H15C15.5523 17 16 17.4477 16 18V21" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}

function TargetIcon({ color = '#1C1C1E' }) {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
            <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
            <Path d="M12 3V1M12 23V21M3 12H1M23 12H21" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
}

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
        } catch (e) {
            console.log('Goal load error:', e);
        }

        try {
            const result = await callFunction(`goals/${goalId}/history`, {}, 'GET');
            if (result?.history) setHistory(result.history);
        } catch (e) {
            console.log('History load error:', e);
        }
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
        Alert.alert('Delete Goal', 'Are you sure you want to delete this goal?', [
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

    if (!goal) return <View style={[s.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: '#8E8E93' }}>Loading...</Text></View>;

    const today = new Date();
    const endDate = new Date(goal.end_date);
    const startDate = new Date(goal.start_date);
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const daysPassed = Math.max(0, totalDays - daysLeft);
    const progress = goal.target_value && goal.current_value
        ? Math.min(100, Math.max(0, Math.round((goal.current_value / goal.target_value) * 100)))
        : 0;
    const isCompleted = goal.status === 'completed' || progress >= 100;

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Detail</Text>
                <TouchableOpacity onPress={deleteGoal} style={s.deleteBtn}>
                    <Text style={s.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>

            {/* Hero Card */}
            <View style={s.heroCard}>
                <View style={s.heroHeaderRow}>
                    <View style={s.heroIconCircle}><TargetIcon color="#fff" /></View>
                    <View style={s.statusBadgeRow}>
                        {isCompleted ? (
                            <View style={[s.statusBadge, { backgroundColor: '#34C75915' }]}>
                                <Text style={[s.statusBadgeText, { color: '#34C759' }]}>Completed</Text>
                            </View>
                        ) : (
                            <View style={[s.statusBadge, { backgroundColor: '#0A84FF15' }]}>
                                <Text style={[s.statusBadgeText, { color: '#0A84FF' }]}>Active Goal</Text>
                            </View>
                        )}
                    </View>
                </View>

                <Text style={s.heroTitle}>{goal.title}</Text>

                <View style={s.heroProgressRow}>
                    <Text style={[s.heroPercent, isCompleted && { color: '#34C759' }]}>{progress}%</Text>
                    {!isCompleted && <Text style={s.heroDays}>{daysLeft} days remaining</Text>}
                </View>

                <View style={s.heroBarBg}>
                    <View style={[s.heroBarFill, { width: `${progress}%`, backgroundColor: isCompleted ? '#34C759' : '#fff' }]} />
                </View>

                {goal.target_value && (
                    <View style={s.heroTargetRow}>
                        <Text style={s.heroTargetCurrent}>{goal.current_value || 0}</Text>
                        <Text style={s.heroTargetSlash}> / </Text>
                        <Text style={s.heroTargetValue}>{goal.target_value} {goal.unit || ''}</Text>
                    </View>
                )}
            </View>

            {/* Timeline */}
            {!isCompleted && (
                <View style={s.card}>
                    <Text style={s.cardTitle}>Time Remaining</Text>
                    <View style={s.timeline}>
                        <View style={s.timelineLineBg} />
                        <View style={[s.timelineLineFill, { width: `${Math.min(100, (daysPassed / totalDays) * 100)}%` }]} />

                        <View style={[s.timelineDot, { left: 0, backgroundColor: '#34C759' }]} />
                        <View style={[s.timelineDotCurrent, { left: `${Math.min(98, (daysPassed / totalDays) * 100)}%` }]} />
                        <View style={[s.timelineDot, { right: 0, backgroundColor: '#1C1C1E' }]} />

                        <Text style={[s.dotLabel, { left: -10 }]}>Start</Text>
                        <Text style={[s.dotLabel, { right: -10 }]}>End</Text>
                    </View>
                    <Text style={s.dateRangeText}>{goal.start_date}  →  {goal.end_date}</Text>
                </View>
            )}

            {/* Log Check-in Form */}
            {!isCompleted && (
                <View style={s.card}>
                    <Text style={s.cardTitle}>Log Progress</Text>
                    {showCheckIn ? (
                        <View style={s.checkInRow}>
                            <TextInput
                                style={s.input}
                                value={checkInValue}
                                onChangeText={setCheckInValue}
                                placeholder={`Value (${goal.unit || 'number'})`}
                                placeholderTextColor="#C7C7CC"
                                keyboardType="numeric"
                                autoFocus
                            />
                            <TouchableOpacity style={s.submitBtn} onPress={submitCheckIn}>
                                <Text style={s.submitBtnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={s.checkInBtn} onPress={() => setShowCheckIn(true)}>
                            <Text style={s.checkInBtnText}>+ Add Entry</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Check-in History */}
            <View style={s.card}>
                <Text style={s.cardTitle}>History</Text>
                {history.length === 0 ? (
                    <View style={s.emptyHistory}>
                        <Text style={s.emptyHistoryText}>No data logged yet.</Text>
                    </View>
                ) : (
                    history.map((h, i) => (
                        <View key={i} style={s.historyRow}>
                            <View style={s.historyDotLine}>
                                <View style={s.historyDot} />
                                {i !== history.length - 1 && <View style={s.historyVerticalLine} />}
                            </View>
                            <View style={s.historyContent}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                        <Text style={s.historyValue}>{h.value}</Text>
                                        <Text style={s.historyUnit}> {goal.unit || ''}</Text>
                                    </View>
                                    {goal.target_value && (
                                        <Text style={s.historyPct}>{Math.round((h.value / goal.target_value) * 100)}%</Text>
                                    )}
                                </View>
                                <Text style={s.historyDate}>{h.checked_at?.split('T')[0]}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* Clinic Visit CTA (Triggered when nearing end date) */}
            {daysLeft <= 14 && !isCompleted && (
                <View style={s.ctaCard}>
                    <View style={s.ctaIconWrapper}>
                        <HospitalIcon />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.ctaTitle}>Time for a lab test?</Text>
                        <Text style={s.ctaSubtitle}>Your goal cycle finishes soon. Book a visit to map your progress accurately.</Text>
                        <TouchableOpacity style={s.ctaBtn}>
                            <Text style={s.ctaBtnText}>Schedule Visit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    backText: { fontSize: 32, fontWeight: '300', color: '#1C1C1E', marginTop: -4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.3 },
    deleteBtn: { height: 44, justifyContent: 'center', paddingHorizontal: 8 },
    deleteBtnText: { fontSize: 16, color: '#FF3B30', fontWeight: '500' },

    // Hero
    heroCard: { backgroundColor: '#1C1C1E', borderRadius: 24, padding: 24, marginHorizontal: 16, marginBottom: 20, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    heroHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    heroIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333336', alignItems: 'center', justifyContent: 'center' },
    statusBadgeRow: { flexDirection: 'row' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusBadgeText: { fontSize: 13, fontWeight: '600' },
    heroTitle: { fontSize: 24, fontWeight: '700', color: '#fff', letterSpacing: -0.5, marginBottom: 24 },
    heroProgressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
    heroPercent: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -1 },
    heroDays: { fontSize: 14, color: '#A1A1AA', fontWeight: '500' },
    heroBarBg: { height: 8, backgroundColor: '#333336', borderRadius: 4, overflow: 'hidden' },
    heroBarFill: { height: '100%', borderRadius: 4 },
    heroTargetRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
    heroTargetCurrent: { fontSize: 15, fontWeight: '600', color: '#fff' },
    heroTargetSlash: { fontSize: 15, color: '#666', marginHorizontal: 4 },
    heroTargetValue: { fontSize: 14, color: '#A1A1AA', fontWeight: '500' },

    // Cards General
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginHorizontal: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.4, marginBottom: 20 },

    // Timeline
    timeline: { height: 16, position: 'relative', marginVertical: 8, justifyContent: 'center' },
    timelineLineBg: { position: 'absolute', left: 0, right: 0, height: 4, backgroundColor: '#F2F2F7', borderRadius: 2 },
    timelineLineFill: { position: 'absolute', left: 0, height: 4, backgroundColor: '#0A84FF', borderRadius: 2 },
    timelineDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
    timelineDotCurrent: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#0A84FF', borderWidth: 3, borderColor: '#fff', top: 0 },
    dotLabel: { position: 'absolute', top: 20, fontSize: 12, color: '#8E8E93', fontWeight: '500' },
    dateRangeText: { fontSize: 13, color: '#8E8E93', textAlign: 'center', marginTop: 28, fontWeight: '500' },

    // Check-in
    checkInRow: { flexDirection: 'row', gap: 12 },
    input: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 16, paddingHorizontal: 16, height: 52, fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
    submitBtn: { backgroundColor: '#1C1C1E', borderRadius: 16, paddingHorizontal: 24, height: 52, justifyContent: 'center' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    checkInBtn: { backgroundColor: '#F2F2F7', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    checkInBtnText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },

    // History
    emptyHistory: { alignItems: 'center', paddingVertical: 16 },
    emptyHistoryText: { fontSize: 15, color: '#8E8E93' },
    historyRow: { flexDirection: 'row', gap: 16, minHeight: 60 },
    historyDotLine: { width: 12, alignItems: 'center' },
    historyDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#34C759', marginTop: 4 },
    historyVerticalLine: { width: 2, flex: 1, backgroundColor: '#F2F2F7', marginVertical: 4 },
    historyContent: { flex: 1, paddingBottom: 24 },
    historyValue: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
    historyUnit: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
    historyDate: { fontSize: 13, color: '#8E8E93', marginTop: 4 },
    historyPct: { fontSize: 15, fontWeight: '600', color: '#0A84FF' },

    // CTA
    ctaCard: { backgroundColor: '#FFF5F5', borderRadius: 24, padding: 24, marginHorizontal: 16, marginBottom: 20, flexDirection: 'row', gap: 16 },
    ctaIconWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FF3B3015', alignItems: 'center', justifyContent: 'center' },
    ctaTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 4, letterSpacing: -0.3 },
    ctaSubtitle: { fontSize: 14, color: '#FF3B30', lineHeight: 20, marginBottom: 16 },
    ctaBtn: { backgroundColor: '#FF3B30', borderRadius: 16, paddingVertical: 14, alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 20 },
    ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
