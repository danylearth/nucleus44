import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WaterScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [glasses, setGlasses] = useState(0);
    const goal = 8;

    const addGlass = () => { if (glasses < 20) setGlasses(g => g + 1); };
    const removeGlass = () => { if (glasses > 0) setGlasses(g => g - 1); };

    const progress = Math.min((glasses / goal) * 100, 100);
    const ml = glasses * 250;

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={[s.header, { backgroundColor: '#3b82f6' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backBtn}>← Back</Text></TouchableOpacity>
                <Text style={s.headerTitle}>Water</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={[s.hero, { backgroundColor: '#3b82f6' }]}>
                <Text style={s.heroValue}>{ml}</Text>
                <Text style={s.heroUnit}>ml today</Text>
                <View style={s.badge}><Text style={s.badgeText}>{glasses}/{goal} glasses</Text></View>
            </View>

            {/* Quick add */}
            <View style={s.card}>
                <Text style={s.cardTitle}>Track Water</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                    <TouchableOpacity onPress={removeGlass} style={s.addBtn}><Text style={s.addBtnText}>−</Text></TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 48, fontWeight: '800', color: '#111' }}>{glasses}</Text>
                        <Text style={{ fontSize: 13, color: '#9ca3af' }}>glasses</Text>
                    </View>
                    <TouchableOpacity onPress={addGlass} style={[s.addBtn, { backgroundColor: '#3b82f6' }]}><Text style={[s.addBtnText, { color: '#fff' }]}>+</Text></TouchableOpacity>
                </View>
            </View>

            {/* Progress */}
            <View style={s.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={s.cardTitle}>Daily Progress</Text>
                    <Text style={{ color: '#3b82f6', fontWeight: '600', fontSize: 14 }}>{Math.round(progress)}%</Text>
                </View>
                <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${progress}%` }]} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={s.progressText}>{ml} ml</Text>
                    <Text style={s.progressText}>{Math.max(0, goal * 250 - ml)} ml to go</Text>
                </View>
            </View>

            <View style={s.card}>
                <Text style={s.cardTitle}>💡 Tips</Text>
                <Text style={s.insightText}>• Drink a glass of water first thing in the morning.</Text>
                <Text style={s.insightText}>• Set reminders every 2 hours to stay hydrated.</Text>
                <Text style={s.insightText}>• Increase intake during exercise and hot weather.</Text>
            </View>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 12 },
    backBtn: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
    hero: { alignItems: 'center', paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    heroValue: { fontSize: 56, fontWeight: '800', color: '#fff' },
    heroUnit: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
    badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5, marginTop: 10 },
    badgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 12, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12 },
    addBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    addBtnText: { fontSize: 28, fontWeight: '700', color: '#111' },
    progressBg: { height: 10, backgroundColor: '#e5e7eb', borderRadius: 5 },
    progressFill: { height: 10, borderRadius: 5, backgroundColor: '#3b82f6' },
    progressText: { fontSize: 12, color: '#6b7280' },
    insightText: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 6 },
});
