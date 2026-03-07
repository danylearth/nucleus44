import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { callFunction } from '../lib/supabase';

// ─── SVG Icons ──────────────────────────────────────────────────────
function ActivityIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M4 18C4 16 6 14 8 14C10 14 10 16 10 18" stroke="#06B6D4" strokeWidth={2.5} strokeLinecap="round" />
            <Path d="M10 18C10 16 12 14 14 14C16 14 16 16 16 18" stroke="#06B6D4" strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
    );
}
function HeartIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 21C12 21 4 15 4 9C4 6 6 4 9 4C10.5 4 11.5 5 12 6C12.5 5 13.5 4 15 4C18 4 20 6 20 9C20 15 12 21 12 21Z" stroke="#EF4444" strokeWidth={2} fill="none" />
        </Svg>
    );
}
function SleepIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="#8B5CF6" strokeWidth={2} fill="none" />
        </Svg>
    );
}
function BloodIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 3C12 3 6 11 6 15C6 18.31 8.69 21 12 21C15.31 21 18 18.31 18 15C18 11 12 3 12 3Z" stroke="#F97316" strokeWidth={2} fill="none" />
        </Svg>
    );
}
function GoalIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke="#22C55E" strokeWidth={2} fill="none" />
            <Circle cx={12} cy={12} r={5} stroke="#22C55E" strokeWidth={2} fill="none" />
            <Circle cx={12} cy={12} r={1.5} fill="#22C55E" />
        </Svg>
    );
}
function TrendIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M3 17L9 11L13 15L21 7" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M17 7H21V11" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function PlusIcon({ color = '#fff' }) {
    return (
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
    );
}

const CATEGORIES = [
    { key: 'activity', name: 'Activity & Steps', max: 200, icon: <ActivityIcon />, color: '#06B6D4' },
    { key: 'heart', name: 'Heart & Recovery', max: 200, icon: <HeartIcon />, color: '#EF4444' },
    { key: 'sleep', name: 'Sleep Quality', max: 200, icon: <SleepIcon />, color: '#8B5CF6' },
    { key: 'blood', name: 'Blood Work', max: 150, icon: <BloodIcon />, color: '#F97316' },
    { key: 'goals', name: 'Goal Progress', max: 150, icon: <GoalIcon />, color: '#22C55E' },
    { key: 'consistency', name: 'Consistency', max: 100, icon: <TrendIcon />, color: '#3B82F6' },
];

const GOAL_CATEGORIES = [
    { key: 'biomarker', label: 'Biomarker', color: '#EF4444' },
    { key: 'activity', label: 'Activity', color: '#06B6D4' },
    { key: 'sleep', label: 'Sleep', color: '#8B5CF6' },
    { key: 'heart', label: 'Heart', color: '#F43F5E' },
    { key: 'body', label: 'Body', color: '#F59E0B' },
    { key: 'custom', label: 'Custom', color: '#8B5CF6' },
];

export default function HealthScoreScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [score, setScore] = useState(0);
    const [breakdown, setBreakdown] = useState<any>(null);
    const [goals, setGoals] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', category: 'custom', target_value: '', unit: '' });

    const loadData = async () => {
        try {
            const result = await callFunction('healthScore', {});
            if (result?.score != null) setScore(result.score);
            if (result?.breakdown) setBreakdown(result.breakdown);
        } catch (e) { console.log('Score error:', e); }

        try {
            const result = await callFunction('goals', {}, 'GET');
            if (result?.goals) setGoals(result.goals.filter((g: any) => g.status === 'active'));
        } catch (e) { console.log('Goals error:', e); }
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const createGoal = async () => {
        if (!newGoal.title.trim()) {
            Alert.alert('Missing Title', 'Please give your goal a name.');
            return;
        }
        try {
            await callFunction('goals', {
                title: newGoal.title,
                category: newGoal.category,
                target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : undefined,
                unit: newGoal.unit || undefined,
            });
            setShowAddModal(false);
            setNewGoal({ title: '', category: 'custom', target_value: '', unit: '' });
            loadData();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to create goal');
        }
    };

    const maxScore = 1000;
    const displayScore = score || 750;
    const pct = Math.min(displayScore / maxScore, 1);
    const label = pct >= 0.8 ? 'Excellent' : pct >= 0.65 ? 'Good' : pct >= 0.4 ? 'Fair' : 'Needs Work';

    // Arc
    const svgW = 260; const svgH = 150;
    const cx = svgW / 2; const cy = svgH - 16; const rx = 110; const ry = 95; const sw = 28;
    const circ = (Math.PI * (rx + ry)) / 2;
    const prog = pct * circ;

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Health Bar</Text>
                <View style={{ width: 36 }} />
            </View>

            {/* Arc */}
            <View style={s.arcCard}>
                <View style={{ width: svgW, height: svgH, alignSelf: 'center' }}>
                    <Svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                        <Defs>
                            <LinearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0" stopColor="#EF4444" />
                                <Stop offset="0.35" stopColor="#F59E0B" />
                                <Stop offset="0.65" stopColor="#22C55E" />
                                <Stop offset="1" stopColor="#06B6D4" />
                            </LinearGradient>
                        </Defs>
                        <Path d={`M ${cx - rx},${cy} A ${rx},${ry} 0 0 1 ${cx + rx},${cy}`} stroke="#F2F2F7" strokeWidth={sw} fill="none" strokeLinecap="round" />
                        <Path d={`M ${cx - rx},${cy} A ${rx},${ry} 0 0 1 ${cx + rx},${cy}`} stroke="url(#scoreGrad)" strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={`${prog} ${circ}`} />
                    </Svg>
                    <View style={s.arcOverlay}>
                        <Text style={s.arcScore}>{displayScore}</Text>
                        <View style={[s.labelBadge, pct >= 0.65 ? s.labelGood : pct >= 0.4 ? s.labelFair : s.labelLow]}>
                            <Text style={[s.labelText, pct >= 0.65 ? s.labelTextGood : pct >= 0.4 ? s.labelTextFair : s.labelTextLow]}>{label}</Text>
                        </View>
                    </View>
                </View>
                <Text style={s.arcSub}>out of {maxScore}</Text>
            </View>

            {/* Score Breakdown */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Score Breakdown</Text>
                {CATEGORIES.map((cat, i) => {
                    const val = breakdown?.[cat.name] || Math.round(cat.max * (0.5 + Math.random() * 0.4));
                    const catPct = cat.max > 0 ? (val / cat.max) * 100 : 0;
                    return (
                        <View key={i} style={s.catRow}>
                            {cat.icon}
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text style={s.catName}>{cat.name}</Text>
                                    <Text style={s.catScore}>{val}/{cat.max}</Text>
                                </View>
                                <View style={s.catBarBg}>
                                    <View style={[s.catBarFill, { width: `${catPct}%`, backgroundColor: cat.color }]} />
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Active Goals */}
            <View style={s.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={s.cardTitle}>90-Day Goals</Text>
                    <TouchableOpacity style={s.addGoalBtn} onPress={() => setShowAddModal(true)}>
                        <PlusIcon />
                        <Text style={s.addGoalBtnText}>Add Goal</Text>
                    </TouchableOpacity>
                </View>

                {goals.length === 0 ? (
                    <View style={s.emptyGoals}>
                        <GoalIcon />
                        <Text style={s.emptyGoalsText}>No active goals yet</Text>
                        <Text style={s.emptyGoalsSub}>Set goals to earn up to 150 points toward your score.</Text>
                    </View>
                ) : (
                    goals.slice(0, 5).map(g => {
                        const gPct = g.target_value && g.current_value
                            ? Math.min(100, Math.round((g.current_value / g.target_value) * 100))
                            : 0;
                        const endDate = new Date(g.end_date);
                        const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                        return (
                            <TouchableOpacity key={g.id} style={s.goalRow} onPress={() => navigation.navigate('GoalDetail', { goalId: g.id })}>
                                <GoalIcon />
                                <View style={{ flex: 1 }}>
                                    <Text style={s.goalName}>{g.title}</Text>
                                    <Text style={s.goalMeta}>{daysLeft}d left • {gPct}%</Text>
                                    <View style={s.goalBarBg}>
                                        <View style={[s.goalBarFill, { width: `${gPct}%` }]} />
                                    </View>
                                </View>
                                <Text style={s.goalChevron}>›</Text>
                            </TouchableOpacity>
                        );
                    })
                )}

                {goals.length > 5 && (
                    <TouchableOpacity onPress={() => navigation.navigate('Goals')} style={s.viewAllRow}>
                        <Text style={s.viewAll}>View All Goals</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* How to Improve */}
            <View style={s.card}>
                <Text style={s.cardTitle}>How to Improve</Text>
                <View style={s.tipRow}><TrendIcon /><Text style={s.tipText}>Connect a wearable to track daily activity and sleep.</Text></View>
                <View style={s.tipRow}><BloodIcon /><Text style={s.tipText}>Upload recent blood work to boost your score.</Text></View>
                <View style={s.tipRow}><GoalIcon /><Text style={s.tipText}>Set goals and log check-ins to earn goal points.</Text></View>
                <View style={s.tipRow}><SleepIcon /><Text style={s.tipText}>Aim for 7+ hours of sleep each night.</Text></View>
            </View>

            {/* Add Goal Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={[s.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                        <View style={s.modalHandle} />
                        <Text style={s.modalTitle}>New Goal</Text>

                        <TextInput
                            style={s.modalInput}
                            placeholder="Goal title (e.g. Lower resting heart rate)"
                            placeholderTextColor="#C7C7CC"
                            value={newGoal.title}
                            onChangeText={(t) => setNewGoal({ ...newGoal, title: t })}
                        />

                        <Text style={s.modalLabel}>Category</Text>
                        <View style={s.categoryGrid}>
                            {GOAL_CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.key}
                                    style={[s.categoryChip, newGoal.category === cat.key && { backgroundColor: cat.color + '20', borderColor: cat.color }]}
                                    onPress={() => setNewGoal({ ...newGoal, category: cat.key })}
                                >
                                    <Text style={[s.categoryChipText, newGoal.category === cat.key && { color: cat.color }]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={s.modalRow}>
                            <TextInput
                                style={[s.modalInput, { flex: 1 }]}
                                placeholder="Target value"
                                placeholderTextColor="#C7C7CC"
                                keyboardType="numeric"
                                value={newGoal.target_value}
                                onChangeText={(t) => setNewGoal({ ...newGoal, target_value: t })}
                            />
                            <TextInput
                                style={[s.modalInput, { width: 100 }]}
                                placeholder="Unit"
                                placeholderTextColor="#C7C7CC"
                                value={newGoal.unit}
                                onChangeText={(t) => setNewGoal({ ...newGoal, unit: t })}
                            />
                        </View>

                        <TouchableOpacity style={s.modalCreateBtn} onPress={createGoal}>
                            <Text style={s.modalCreateBtnText}>Create Goal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowAddModal(false)}>
                            <Text style={s.modalCancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 28, fontWeight: '300', color: '#1C1C1E' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.3 },
    arcCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, alignItems: 'center' },
    arcOverlay: { position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' },
    arcScore: { fontSize: 52, fontWeight: '800', color: '#1C1C1E', letterSpacing: -2 },
    arcSub: { fontSize: 13, color: '#8E8E93', marginTop: -4 },
    labelBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 3, marginTop: 4 },
    labelGood: { backgroundColor: '#D1FAE5' },
    labelFair: { backgroundColor: '#FEF3C7' },
    labelLow: { backgroundColor: '#FEE2E2' },
    labelText: { fontSize: 13, fontWeight: '600' },
    labelTextGood: { color: '#065F46' },
    labelTextFair: { color: '#92400E' },
    labelTextLow: { color: '#991B1B' },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 0, letterSpacing: -0.2 },
    catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    catName: { fontSize: 14, fontWeight: '500', color: '#1C1C1E' },
    catScore: { fontSize: 12, color: '#8E8E93' },
    catBarBg: { height: 6, backgroundColor: '#F2F2F7', borderRadius: 3 },
    catBarFill: { height: 6, borderRadius: 3 },

    // Goals section
    addGoalBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1C1C1E', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
    addGoalBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    emptyGoals: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    emptyGoalsText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
    emptyGoalsSub: { fontSize: 13, color: '#8E8E93', textAlign: 'center', lineHeight: 18 },
    goalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    goalName: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
    goalMeta: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    goalBarBg: { height: 4, backgroundColor: '#F2F2F7', borderRadius: 2, marginTop: 6 },
    goalBarFill: { height: 4, borderRadius: 2, backgroundColor: '#22C55E' },
    goalChevron: { fontSize: 20, color: '#C7C7CC', fontWeight: '300' },
    viewAllRow: { alignItems: 'center', paddingTop: 8 },
    viewAll: { fontSize: 14, fontWeight: '600', color: '#06B6D4' },

    // Tips
    tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
    tipText: { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 18 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 20, letterSpacing: -0.3 },
    modalLabel: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginBottom: 10, marginTop: 8 },
    modalInput: { backgroundColor: '#F2F2F7', borderRadius: 14, paddingHorizontal: 16, height: 50, fontSize: 16, color: '#1C1C1E', fontWeight: '500', marginBottom: 12 },
    modalRow: { flexDirection: 'row', gap: 12 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    categoryChip: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    categoryChipText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
    modalCreateBtn: { backgroundColor: '#1C1C1E', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    modalCreateBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    modalCancelBtn: { paddingVertical: 14, alignItems: 'center' },
    modalCancelBtnText: { fontSize: 16, fontWeight: '500', color: '#8E8E93' },
});
