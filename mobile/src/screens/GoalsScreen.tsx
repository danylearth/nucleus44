import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { callFunction } from '../lib/supabase';

// ─── SVG Icons ──────────────────────────────────────────────────────
function BiomarkerIcon({ color = '#EF4444' }) {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 21.5C16.1421 21.5 19.5 18.1421 19.5 14C19.5 9 12 2.5 12 2.5C12 2.5 4.5 9 4.5 14C4.5 18.1421 7.85786 21.5 12 21.5Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function ActivityIcon({ color = '#06B6D4' }) {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M13 22V16L9 12L11 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={14} cy={5} r={2} stroke={color} strokeWidth={2} fill="none" />
            <Path d="M18 14H15L12 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function SleepIcon({ color = '#8B5CF6' }) {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function HeartIcon({ color = '#F43F5E' }) {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M12 21C12 21 4 15 4 9C4 6 6 4 9 4C10.5 4 11.5 5 12 6C12.5 5 13.5 4 15 4C18 4 20 6 20 9C20 15 12 21 12 21Z" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
        </Svg>
    );
}
function BodyIcon({ color = '#F59E0B' }) {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Rect x={4} y={5} width={16} height={14} rx={2} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 5V8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9 8H15" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
    );
}
function CustomIcon({ color = '#8B5CF6' }) {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
            <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
            <Path d="M12 3V1M12 23V21M3 12H1M23 12H21" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
}

const CATEGORIES = [
    { key: 'biomarker', label: 'Biomarker', icon: BiomarkerIcon, color: '#EF4444' },
    { key: 'activity', label: 'Activity', icon: ActivityIcon, color: '#06B6D4' },
    { key: 'sleep', label: 'Sleep', icon: SleepIcon, color: '#8B5CF6' },
    { key: 'heart', label: 'Heart', icon: HeartIcon, color: '#F43F5E' },
    { key: 'body', label: 'Body', icon: BodyIcon, color: '#F59E0B' },
    { key: 'custom', label: 'Custom', icon: CustomIcon, color: '#8B5CF6' },
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
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>‹</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Goals</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={s.bellBtn}>
                    <Text style={{ fontSize: 24, fontWeight: '300', color: '#1C1C1E', marginTop: -2 }}>+</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                {/* Summary Card */}
                <View style={s.summaryCard}>
                    <View style={{ paddingBottom: 16 }}>
                        <Text style={s.summaryTitle}>90-Day Goals</Text>
                        <Text style={s.summarySubtitle}>Set targets, track progress, and map your improvements.</Text>
                    </View>
                    <View style={s.summaryStats}>
                        <View style={s.statBox}>
                            <Text style={s.statValue}>{activeGoals.length}</Text>
                            <Text style={s.statLabel}>Active</Text>
                        </View>
                        <View style={s.statDivider} />
                        <View style={s.statBox}>
                            <Text style={s.statValue}>{completedGoals.length}</Text>
                            <Text style={s.statLabel}>Completed</Text>
                        </View>
                    </View>
                </View>

                {/* Active goals */}
                {activeGoals.length === 0 ? (
                    <View style={s.emptyCard}>
                        <View style={s.emptyIconCircle}>
                            <CustomIcon color="#8E8E93" />
                        </View>
                        <Text style={s.emptyTitle}>No Active Goals</Text>
                        <Text style={s.emptySubtitle}>Tap + to start setting targets.</Text>
                    </View>
                ) : (
                    <View style={s.goalsList}>
                        {activeGoals.map(g => {
                            const endDate = new Date(g.end_date);
                            const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                            const progress = g.target_value && g.current_value
                                ? Math.min(100, Math.round((g.current_value / g.target_value) * 100))
                                : 0;
                            const cat = CATEGORIES.find(c => c.key === g.category) || CATEGORIES[5];
                            const IconCmp = cat.icon;

                            return (
                                <TouchableOpacity key={g.id} style={s.goalCard} onPress={() => navigation.navigate('GoalDetail', { goalId: g.id })} activeOpacity={0.7}>
                                    <View style={s.goalHeaderRow}>
                                        <View style={[s.iconCircle, { backgroundColor: cat.color + '15' }]}>
                                            <IconCmp color={cat.color} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.goalTitle}>{g.title}</Text>
                                            <Text style={s.goalMeta}>{daysLeft} days left • {cat.label}</Text>
                                        </View>
                                        <Text style={s.goalProgressText}>{progress}%</Text>
                                    </View>
                                    <View style={s.progressBarBg}>
                                        <View style={[s.progressBarFill, { width: `${progress}%`, backgroundColor: cat.color }]} />
                                    </View>
                                    {g.target_value && (
                                        <View style={s.goalTargetRow}>
                                            <Text style={s.goalTargetCurrent}>{g.current_value || 0}</Text>
                                            <Text style={s.goalTargetSlash}> / </Text>
                                            <Text style={s.goalTargetValue}>{g.target_value} {g.unit || ''}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Completed */}
                {completedGoals.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                        <Text style={s.sectionHeader}>Completed</Text>
                        <View style={s.goalsListContainer}>
                            {completedGoals.map(g => (
                                <TouchableOpacity key={g.id} style={s.completedCard} onPress={() => navigation.navigate('GoalDetail', { goalId: g.id })}>
                                    <View style={s.completedIconCircle}>
                                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                            <Path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>
                                    </View>
                                    <Text style={s.completedTitle}>{g.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Add Goal Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <View style={s.modalDragHandle} />
                        <Text style={s.modalTitle}>Set New Goal</Text>

                        <Text style={s.fieldLabel}>Goal Name</Text>
                        <TextInput style={s.input} value={newGoal.title} onChangeText={t => setNewGoal(p => ({ ...p, title: t }))} placeholder="e.g., Run 5k, Increase Vitamin D..." placeholderTextColor="#C7C7CC" />

                        <Text style={s.fieldLabel}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', paddingHorizontal: 4, gap: 10 }}>
                                {CATEGORIES.map(cat => {
                                    const IconCmp = cat.icon;
                                    const isSelected = newGoal.category === cat.key;
                                    return (
                                        <TouchableOpacity
                                            key={cat.key}
                                            style={[s.catChip, isSelected && { borderColor: cat.color, backgroundColor: cat.color + '0C' }]}
                                            onPress={() => setNewGoal(p => ({ ...p, category: cat.key }))}
                                        >
                                            <IconCmp color={isSelected ? cat.color : '#8E8E93'} />
                                            <Text style={[s.catChipText, isSelected && { color: cat.color, fontWeight: '600' }]}>{cat.label}</Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </ScrollView>

                        <Text style={s.fieldLabel}>Target (Optional)</Text>
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
                            <TextInput style={[s.input, { flex: 2, marginBottom: 0 }]} value={newGoal.target_value} onChangeText={t => setNewGoal(p => ({ ...p, target_value: t }))} placeholder="Value (e.g., 50)" placeholderTextColor="#C7C7CC" keyboardType="numeric" />
                            <TextInput style={[s.input, { flex: 1.5, marginBottom: 0 }]} value={newGoal.unit} onChangeText={t => setNewGoal(p => ({ ...p, unit: t }))} placeholder="Unit" placeholderTextColor="#C7C7CC" />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity style={s.modalBtnCancel} onPress={() => setShowAddModal(false)}>
                                <Text style={s.modalBtnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.modalBtnCreate} onPress={createGoal}>
                                <Text style={s.modalBtnCreateText}>Create Target</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 28, fontWeight: '300', color: '#1C1C1E' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.3 },
    bellBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },

    // Summary Card
    summaryCard: { backgroundColor: '#1C1C1E', borderRadius: 24, padding: 24, marginHorizontal: 16, marginBottom: 20, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    summaryTitle: { fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
    summarySubtitle: { fontSize: 14, color: '#A1A1AA', lineHeight: 20 },
    summaryStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 16 },
    statBox: { flex: 1 },
    statValue: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -1 },
    statLabel: { fontSize: 13, color: '#A1A1AA', marginTop: 2, fontWeight: '500' },
    statDivider: { width: 1, backgroundColor: '#333', marginHorizontal: 20 },

    // Empty State
    emptyCard: { backgroundColor: '#fff', borderRadius: 24, padding: 32, marginHorizontal: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    emptyIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1C1C1E', marginBottom: 4 },
    emptySubtitle: { fontSize: 14, color: '#8E8E93' },

    // List
    goalsList: { paddingHorizontal: 16, gap: 12 },
    goalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    goalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
    iconCircle: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    goalTitle: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', letterSpacing: -0.2, marginBottom: 2 },
    goalMeta: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
    goalProgressText: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
    progressBarBg: { height: 8, backgroundColor: '#F2F2F7', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    goalTargetRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 10 },
    goalTargetCurrent: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
    goalTargetSlash: { fontSize: 14, color: '#D1D5DB', marginHorizontal: 2 },
    goalTargetValue: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },

    // Completed
    sectionHeader: { fontSize: 15, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 24, marginBottom: 12 },
    goalsListContainer: { paddingHorizontal: 16, gap: 8 },
    completedCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    completedIconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
    completedTitle: { fontSize: 15, color: '#1C1C1E', textDecorationLine: 'line-through', opacity: 0.5 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },
    modalDragHandle: { width: 40, height: 5, backgroundColor: '#E5E5EA', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 24, letterSpacing: -0.5 },
    fieldLabel: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginBottom: 8, marginLeft: 4 },
    input: { backgroundColor: '#F2F2F7', borderRadius: 16, padding: 16, fontSize: 16, color: '#1C1C1E', marginBottom: 20, fontWeight: '500' },
    catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
    catChipText: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
    modalBtnCancel: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    modalBtnCancelText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
    modalBtnCreate: { flex: 1.5, backgroundColor: '#1C1C1E', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    modalBtnCreateText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
