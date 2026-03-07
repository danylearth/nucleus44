import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    RefreshControl, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../lib/AuthContext';
import { supabase, callFunction } from '../lib/supabase';

const DEVICES = [
    { key: 'APPLE_WATCH', name: 'Apple Watch', subtitle: 'Heart rate, activity, sleep data', icon: '⌚', iconBg: '#1C1C1E' },
    { key: 'APPLE_HEALTH', name: 'iPhone Health', subtitle: 'Steps, health record, vitals', icon: '❤️', iconBg: '#FF2D55' },
    { key: 'FITBIT', name: 'Fitbit', subtitle: 'Activity, sleep, heart rate', icon: '⌚', iconBg: '#00B0B9' },
    { key: 'GARMIN', name: 'Garmin', subtitle: 'GPS, heart rate, training', icon: '⌚', iconBg: '#1a1a1a' },
    { key: 'OURA', name: 'Oura Ring', subtitle: 'Sleep, readiness, activity', icon: '💍', iconBg: '#6366F1' },
    { key: 'WHOOP', name: 'Whoop', subtitle: 'Strain, recovery, sleep', icon: '⌚', iconBg: '#22C55E' },
];

export default function DevicesScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => { loadConnections(); }, []);

    const loadConnections = async () => {
        try {
            const { data } = await supabase
                .from('terra_connections')
                .select('*')
                .order('created_at', { ascending: false });
            if (data) setConnections(data);
        } catch (error) {
            console.log('Error loading connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => { setRefreshing(true); await loadConnections(); setRefreshing(false); };

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const result = await callFunction('terraConnect', {
                providers: 'GARMIN,FITBIT,OURA,WHOOP,GOOGLE',
            });
            const widgetUrl = result?.url || result?.data?.url;
            if (widgetUrl) {
                await Linking.openURL(widgetUrl);
            } else {
                throw new Error('No widget URL returned');
            }
        } catch (error: any) {
            Alert.alert('Connection Error', error.message || 'Failed to start device connection.');
        } finally {
            setConnecting(false);
        }
    };

    const handleSync = async () => {
        try {
            await callFunction('forceSync', { user_id: user?.id });
            Alert.alert('Sync Started', 'Your health data is being synced.');
            setTimeout(loadConnections, 3000);
        } catch (error: any) {
            Alert.alert('Sync Failed', error.message || 'Could not sync data.');
        }
    };

    const connectedProviders = connections.map(c => c.provider);

    if (loading) {
        return <View style={[s.loadingContainer, { paddingTop: insets.top }]}><ActivityIndicator size="large" color="#1C1C1E" /></View>;
    }

    return (
        <View style={[s.container, { paddingTop: insets.top }]}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                        <Text style={s.backText}>‹</Text>
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Connected Devices</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={s.bellBtn}>
                        <Text style={{ fontSize: 18 }}>🔔</Text>
                    </TouchableOpacity>
                </View>

                <Text style={s.subtitle}>Manage your connected health devices and sync settings.</Text>

                {/* Connected devices */}
                {DEVICES.filter(d => connectedProviders.includes(d.key)).map(device => {
                    const conn = connections.find(c => c.provider === device.key);
                    return (
                        <TouchableOpacity key={device.key} style={s.deviceCard} onPress={handleSync} activeOpacity={0.7}>
                            <View style={[s.deviceIcon, { backgroundColor: device.iconBg + '15' }]}>
                                <Text style={{ fontSize: 24 }}>{device.icon}</Text>
                            </View>
                            <View style={s.deviceInfo}>
                                <Text style={s.deviceName}>{device.name}</Text>
                                <Text style={s.deviceSub}>{device.subtitle}</Text>
                            </View>
                            <Text style={s.chevron}>›</Text>
                        </TouchableOpacity>
                    );
                })}

                {/* No connections yet — show sample devices */}
                {connections.length === 0 && DEVICES.slice(0, 3).map(device => (
                    <View key={device.key} style={s.deviceCard}>
                        <View style={[s.deviceIcon, { backgroundColor: device.iconBg + '15' }]}>
                            <Text style={{ fontSize: 24 }}>{device.icon}</Text>
                        </View>
                        <View style={s.deviceInfo}>
                            <Text style={s.deviceName}>{device.name}</Text>
                            <Text style={s.deviceSub}>{device.subtitle}</Text>
                        </View>
                        <Text style={s.chevron}>›</Text>
                    </View>
                ))}

                {/* Add New Device */}
                <TouchableOpacity style={s.addCard} onPress={handleConnect} disabled={connecting} activeOpacity={0.7}>
                    {connecting ? (
                        <ActivityIndicator color="#1C1C1E" />
                    ) : (
                        <>
                            <View style={s.addIcon}>
                                <Text style={{ fontSize: 20 }}>📲</Text>
                            </View>
                            <Text style={s.addText}>Add New Device</Text>
                            <Text style={s.chevron}>›</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 28, fontWeight: '300', color: '#111' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.3 },
    bellBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
    subtitle: { fontSize: 14, color: '#8E8E93', lineHeight: 20, paddingHorizontal: 20, marginBottom: 16, marginTop: 4 },
    deviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
    deviceIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    deviceInfo: { flex: 1 },
    deviceName: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', letterSpacing: -0.2 },
    deviceSub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
    chevron: { fontSize: 22, color: '#C7C7CC', fontWeight: '300' },
    addCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#D1D1D6' },
    addIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    addText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
});
