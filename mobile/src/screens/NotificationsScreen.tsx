import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mockNotifications = [
    { id: 1, title: 'Health Score Updated', body: 'Your health score has been recalculated.', time: '2 min ago', icon: '📊', read: false },
    { id: 2, title: 'New Lab Results', body: 'Your Complete Blood Count results are ready.', time: '1 hour ago', icon: '🩸', read: false },
    { id: 3, title: 'Supplement Reminder', body: "Don't forget to take your evening supplements.", time: '3 hours ago', icon: '💊', read: true },
    { id: 4, title: 'Weekly Report', body: 'Your weekly health summary is available.', time: '1 day ago', icon: '📋', read: true },
    { id: 5, title: 'Device Connected', body: 'Garmin Venu is now syncing data.', time: '2 days ago', icon: '⌚', read: true },
];

export default function NotificationsScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 16, fontWeight: '600' }}>← Back</Text></TouchableOpacity>
                <Text style={s.headerTitle}>Notifications</Text>
                <TouchableOpacity><Text style={{ fontSize: 13, fontWeight: '600', color: '#06b6d4' }}>Mark all read</Text></TouchableOpacity>
            </View>

            {mockNotifications.map((n) => (
                <TouchableOpacity key={n.id} style={[s.notifCard, !n.read && s.notifUnread]}>
                    <View style={s.notifIcon}><Text style={{ fontSize: 22 }}>{n.icon}</Text></View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.notifTitle}>{n.title}</Text>
                        <Text style={s.notifBody}>{n.body}</Text>
                        <Text style={s.notifTime}>{n.time}</Text>
                    </View>
                    {!n.read && <View style={s.unreadDot} />}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
    notifCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
    notifUnread: { backgroundColor: '#f0faff' },
    notifIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    notifTitle: { fontSize: 14, fontWeight: '600', color: '#111' },
    notifBody: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    notifTime: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#06b6d4' },
});
