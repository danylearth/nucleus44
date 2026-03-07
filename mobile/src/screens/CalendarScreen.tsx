import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CALENDARS = [
    {
        id: 'icloud',
        name: 'iCloud Calendar',
        icon: '📅',
        iconBg: '#fff',
        description: 'Sync health appointments and reminders',
        connected: true,
    },
    {
        id: 'google',
        name: 'Google Calendar',
        icon: '📆',
        iconBg: '#fff',
        description: 'Not Connected',
        connected: false,
    },
    {
        id: 'outlook',
        name: 'Outlook Calendar',
        icon: '📋',
        iconBg: '#fff',
        description: 'Not Connected',
        connected: false,
    },
];

export default function CalendarScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [calendars, setCalendars] = useState(CALENDARS);

    const toggleConnect = (id: string) => {
        setCalendars(prev => prev.map(c =>
            c.id === id ? { ...c, connected: !c.connected, description: c.connected ? 'Not Connected' : 'Connected' } : c
        ));
    };

    return (
        <View style={[s.container, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Text style={s.backText}>‹</Text>
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Calendar Integration</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={s.bellBtn}>
                        <Text style={{ fontSize: 18 }}>🔔</Text>
                    </TouchableOpacity>
                </View>

                <Text style={s.subtitle}>Connect your calendar to sync health appointments, medication reminders, and wellness events.</Text>

                {/* Calendar cards */}
                {calendars.map(cal => (
                    <View key={cal.id} style={s.card}>
                        <View style={s.cardIcon}>
                            <Text style={{ fontSize: 28 }}>{cal.icon}</Text>
                        </View>
                        <View style={s.cardInfo}>
                            <Text style={s.cardName}>{cal.name}</Text>
                            <Text style={[s.cardStatus, cal.connected && s.cardStatusConnected]}>{cal.description}</Text>
                        </View>
                        <TouchableOpacity
                            style={[s.connectBtn, cal.connected && s.connectBtnConnected]}
                            onPress={() => toggleConnect(cal.id)}
                        >
                            <Text style={[s.connectBtnText, cal.connected && s.connectBtnTextConnected]}>
                                {cal.connected ? 'Connected' : 'Connect'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 28, fontWeight: '300', color: '#111' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111', letterSpacing: -0.3 },
    bellBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    subtitle: { fontSize: 14, color: '#8E8E93', lineHeight: 20, paddingHorizontal: 20, marginBottom: 16, marginTop: 4 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
    cardIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', letterSpacing: -0.2 },
    cardStatus: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
    cardStatusConnected: { color: '#34C759' },
    connectBtn: { backgroundColor: '#1C1C1E', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
    connectBtnConnected: { backgroundColor: '#F2F2F7' },
    connectBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
    connectBtnTextConnected: { color: '#1C1C1E' },
});
