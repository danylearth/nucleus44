import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { callFunction } from '../lib/supabase';

export default function HealthScoreScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [score, setScore] = useState(0);
    const [breakdown, setBreakdown] = useState<any>(null);

    useEffect(() => { loadScore(); }, []);

    const loadScore = async () => {
        try {
            const result = await callFunction('healthScore', {});
            if (result?.score != null) setScore(result.score);
            if (result?.breakdown) setBreakdown(result.breakdown);
        } catch (e) {
            console.log('Score load error:', e);
        }
    };

    const maxScore = 1000;
    const pct = Math.min(score / maxScore, 1);
    const label = pct >= 0.8 ? 'Excellent' : pct >= 0.65 ? 'Good' : pct >= 0.4 ? 'Fair' : 'Needs Work';

    // Arc
    const svgW = 260; const svgH = 150;
    const cx = svgW / 2; const cy = svgH - 16; const rx = 110; const ry = 95; const sw = 28;
    const circ = (Math.PI * (rx + ry)) / 2;
    const prog = pct * circ;

    const categories = [
        { name: 'Activity & Steps', max: 200, icon: '👟', color: '#06b6d4' },
        { name: 'Heart & Recovery', max: 200, icon: '❤️', color: '#ef4444' },
        { name: 'Sleep Quality', max: 200, icon: '😴', color: '#8b5cf6' },
        { name: 'Blood Work', max: 200, icon: '🩸', color: '#f97316' },
        { name: 'Consistency', max: 200, icon: '🔥', color: '#22c55e' },
    ];

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 16, fontWeight: '600' }}>← Back</Text></TouchableOpacity>
                <Text style={s.headerTitle}>Health Bar</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Arc */}
            <View style={s.arcCard}>
                <View style={{ width: svgW, height: svgH, alignSelf: 'center' }}>
                    <Svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                        <Defs>
                            <LinearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0" stopColor="#ff8c69" />
                                <Stop offset="0.4" stopColor="#ffd93d" />
                                <Stop offset="1" stopColor="#84e1a9" />
                            </LinearGradient>
                        </Defs>
                        <Path d={`M ${cx - rx},${cy} A ${rx},${ry} 0 0 1 ${cx + rx},${cy}`} stroke="#f0f0f0" strokeWidth={sw} fill="none" strokeLinecap="round" />
                        {score > 0 && <Path d={`M ${cx - rx},${cy} A ${rx},${ry} 0 0 1 ${cx + rx},${cy}`} stroke="url(#scoreGrad)" strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={`${prog} ${circ}`} />}
                    </Svg>
                    <View style={s.arcOverlay}>
                        <Text style={s.arcScore}>{score || '—'}</Text>
                        <Text style={s.arcLabel}>{label}</Text>
                    </View>
                </View>
            </View>

            {/* Breakdown */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Score Breakdown</Text>
                {categories.map((cat, i) => {
                    const val = breakdown?.[cat.name] || 0;
                    const catPct = cat.max > 0 ? (val / cat.max) * 100 : 0;
                    return (
                        <View key={i} style={s.catRow}>
                            <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
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

            <View style={s.card}>
                <Text style={s.cardTitle}>How to Improve</Text>
                <Text style={s.insightText}>• Connect a wearable to track daily activity and sleep.</Text>
                <Text style={s.insightText}>• Upload recent blood work to boost your score.</Text>
                <Text style={s.insightText}>• Maintain consistent daily habits for streak points.</Text>
                <Text style={s.insightText}>• Aim for 7+ hours of sleep each night.</Text>
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
    arcCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    arcOverlay: { position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' },
    arcScore: { fontSize: 48, fontWeight: '800', color: '#111' },
    arcLabel: { fontSize: 14, color: '#9ca3af' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12 },
    catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    catName: { fontSize: 13, fontWeight: '500', color: '#111' },
    catScore: { fontSize: 12, color: '#6b7280' },
    catBarBg: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3 },
    catBarFill: { height: 6, borderRadius: 3 },
    insightText: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 6 },
});
