import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { callFunction } from '../lib/supabase';

const CATEGORIES = [
    { key: 'biomarker', label: 'Biomarker', icon: '🩸', example: 'Get Vitamin D above 50 ng/mL' },
    { key: 'activity', label: 'Activity', icon: '🏃', example: 'Average 10k steps/day' },
    { key: 'sleep', label: 'Sleep', icon: '😴', example: '7+ hours sleep per night' },
    { key: 'heart', label: 'Heart', icon: '❤️', example: 'Reduce resting HR to 60bpm' },
    { key: 'body', label: 'Body', icon: '⚖️', example: 'Reach 75kg' },
    { key: 'custom', label: 'Custom', icon: '🎯', example: 'Any free-text goal' },
];

export default function GoalsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [goals, setGoals] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', category: 'custom', target_value: '', unit: '', target_metric: '' });

    const loadGoals = async () => {
        try {
            const result = await callFunction('goals', {}, 'GET');
            if (result?.goals) setGoals(result.goals.filter((g: any) => g.status !== 'deleted'));
        } catch (e) {
            console.log('Goals load error:', e);
        }
    };

    useFocusEffect(useCallback(() => { loadGoals(); }, []));

    const onRefresh = async () => { setRefreshing(true); await loadGoals(); setRefreshing(false); };

    const createGoal = async () => {
        if (!newGoal.title.trim()) { Alert.alert('Error', 'Please enter a goal title'); return; }
        try {
            await callFunction('goals', {
                title: newGoal.title,
                category: newGoal.category,
                target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : null,
                unit: newGoal.unit || null,
                target_metric: newGoal.target_metric || null,
            });
            setShowAddModal(false);
            setNewGoal({ title: '', category: 'custom', target_value: '', unit: '', target_metric: '' });
            loadGoals();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to create goal');
        }
    };

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const today = new Date();

    return (
        <View style={[s.container, { paddingTop: insets.top }]}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 16, fontWeight: '600' }}>← Back</Text></TouchableOpacity>
                    <Text style={s.headerTitle}>Goals</Text>
                    <TouchableOpacity onPress={() => setShowAddModal(true)}>
                        <View style={s.addBtn}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 20 }}>+</Text></View>
                    </TouchableOpacity>
                </View>

                {/* Summary */}
                <View style={s.summaryCard}>
                    <Text style={s.summaryTitle}>90-Day Goals</Text>
                    <Text style={s.summarySubtitle}>Set targets, track progress, and book a clinic check-in to measure results.</Text>
                    <View style={s.summaryStats}>
                        <View style={s.stat}>
                            <Text style={s.statValue}>{activeGoals.length}</Text>
                            <Text style={s.statLabel}>Active</Text>
                        </View>
                        <View style={s.stat}>
                            <Text style={s.statValue}>{completedGoals.length}</Text>
                            <Text style={s.statLabel}>Completed</Text>
                        </View>
                    </View>
                </View>

                {/* Active goals */}
                {activeGoals.length === 0 ? (
                    <View style={s.emptyCard}>
                        <Text style={{ fontSize: 48 }}>🎯</Text>
                        <Text style={s.emptyTitle}>No Active Goals</Text>
                        <Text style={s.emptySubtitle}>Tap + to set your first 90-day goal.</Text>
                    </View>
                ) : (
                    activeGoals.map(g => {
                        const endDate = new Date(g.end_date);
                        const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                        const progress = g.target_value && g.current_value
                            ? Math.min(100, Math.round((g.current_value / g.target_value) * 100))
                            : 0;
                        const cat = CATEGORIES.find(c => c.key === g.category) || CATEGORIES[5];

                        return (
                            <TouchableOpacity key={g.id} style={s.goalCard} onPress={() => navigation.navigate('GoalDetail', { goalId: g.id })}>
                                <View style={s.goalHeader}>
                                    <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.goalTitle}>{g.title}</Text>
                                        <Text style={s.goalMeta}>{daysLeft} days left • {cat.label}</Text>
                                    </View>
                                    <Text style={s.goalProgress}>{progress}%</Text>
                                </View>
                                <View style={s.progressBarBg}>
                                    <View style={[s.progressBarFill, { width: `${progress}%` }]} />
                                </View>
                                {g.target_value && (
                                    <Text style={s.goalTarget}>{g.current_value || 0} / {g.target_value} {g.unit || ''}</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })
                )}

                {/* Completed */}
                {completedGoals.length > 0 && (
                    <>
                        <Text style={s.sectionLabel}>Completed</Text>
                        {completedGoals.map(g => (
                            <TouchableOpacity key={g.id} style={[s.goalCard, { opacity: 0.6 }]} onPress={() => navigation.navigate('GoalDetail', { goalId: g.id })}>
                                <View style={s.goalHeader}>
                                    <Text style={{ fontSize: 20 }}>✅</Text>
                                    <Text style={[s.goalTitle, { flex: 1 }]}>{g.title}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </ScrollView>

            {/* Add Goal Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <Text style={s.modalTitle}>New Goal</Text>

                        <Text style={s.fieldLabel}>What's your goal?</Text>
                        <TextInput style={s.input} value={newGoal.title} onChangeText={t => setNewGoal(p => ({ ...p, title: t }))} placeholder="e.g. Get Vitamin D above 50" placeholderTextColor="#9ca3af" />

                        <Text style={s.fieldLabel}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.key}
                                    style={[s.catChip, newGoal.category === cat.key && s.catChipSelected]}
                                    onPress={() => setNewGoal(p => ({ ...p, category: cat.key }))}
                                >
                                    <Text>{cat.icon} {cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={s.fieldLabel}>Target value (optional)</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TextInput style={[s.input, { flex: 2 }]} value={newGoal.target_value} onChangeText={t => setNewGoal(p => ({ ...p, target_value: t }))} placeholder="e.g. 50" placeholderTextColor="#9ca3af" keyboardType="numeric" />
                            <TextInput style={[s.input, { flex: 1 }]} value={newGoal.unit} onChangeText={t => setNewGoal(p => ({ ...p, unit: t }))} placeholder="unit" placeholderTextColor="#9ca3af" />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                            <TouchableOpacity style={s.cancelBtn} onPress={() => setShowAddModal(false)}>
                                <Text style={s.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.createBtn} onPress={createGoal}>
                                <Text style={s.createBtnText}>Create Goal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
    addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
    summaryCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginHorizontal: 16, marginBottom: 16 },
    summaryTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
    summarySubtitle: { fontSize: 13, color: '#9ca3af', marginTop: 4, lineHeight: 18 },
    summaryStats: { flexDirection: 'row', gap: 24, marginTop: 16 },
    stat: { alignItems: 'center' },
    statValue: { fontSize: 28, fontWeight: '800', color: '#fff' },
    statLabel: { fontSize: 12, color: '#9ca3af' },
    emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 40, margin: 16, alignItems: 'center' },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 12 },
    emptySubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
    goalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    goalTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
    goalMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    goalProgress: { fontSize: 18, fontWeight: '800', color: '#22c55e' },
    progressBarBg: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3 },
    progressBarFill: { height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
    goalTarget: { fontSize: 12, color: '#6b7280', marginTop: 6 },
    sectionLabel: { fontSize: 14, fontWeight: '600', color: '#9ca3af', marginLeft: 20, marginTop: 16, marginBottom: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 16 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 6 },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, fontSize: 16, color: '#111', marginBottom: 12 },
    catChip: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
    catChipSelected: { borderColor: '#111', backgroundColor: '#f9fafb' },
    cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#111' },
    createBtn: { flex: 2, backgroundColor: '#111', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    createBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
