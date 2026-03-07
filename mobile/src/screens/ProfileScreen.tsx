import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

// ─── SVG Icons ──────────────────────────────────────────────────────
function PersonIcon() {
    return (
        <View style={s.iconCircle}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={8} r={4} stroke="#2DD4BF" strokeWidth={2} fill="none" />
                <Path d="M4 20C4 17 7 14 12 14C17 14 20 17 20 20" stroke="#2DD4BF" strokeWidth={2} strokeLinecap="round" fill="none" />
            </Svg>
        </View>
    );
}

function DeviceIcon() {
    return (
        <View style={s.iconCircle}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={9} stroke="#2DD4BF" strokeWidth={2} fill="none" />
                <Path d="M12 6V12L15 15" stroke="#2DD4BF" strokeWidth={2} strokeLinecap="round" fill="none" />
            </Svg>
        </View>
    );
}

function CalendarIcon() {
    return (
        <View style={s.iconCircle}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Rect x={3} y={4} width={18} height={18} rx={3} stroke="#2DD4BF" strokeWidth={2} fill="none" />
                <Path d="M3 9H21" stroke="#2DD4BF" strokeWidth={2} />
                <Path d="M8 2V5" stroke="#2DD4BF" strokeWidth={2} strokeLinecap="round" />
                <Path d="M16 2V5" stroke="#2DD4BF" strokeWidth={2} strokeLinecap="round" />
            </Svg>
        </View>
    );
}

function GearIcon() {
    return (
        <View style={[s.iconCircle, { backgroundColor: '#E0F2FE' }]}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={3} stroke="#2DD4BF" strokeWidth={2} fill="none" />
                <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#2DD4BF" strokeWidth={2} strokeLinecap="round" />
            </Svg>
        </View>
    );
}

// ─── Profile Screen ─────────────────────────────────────────────────
export default function ProfileScreen() {
    const nav = useNavigation<any>();
    const { user, profile } = useAuth();
    const insets = useSafeAreaInsets();

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
        ]);
    };

    const initial = (profile?.full_name || user?.email || 'U')[0].toUpperCase();

    const cards = [
        {
            icon: <PersonIcon />,
            title: 'Personal Information',
            subtitle: 'Manage your profile details',
            onPress: () => nav.navigate('EditProfile'),
        },
        {
            icon: <DeviceIcon />,
            title: 'Connected Devices',
            subtitle: 'Manage your health devices',
            onPress: () => nav.navigate('Main', { screen: 'Devices' }),
        },
        {
            icon: <CalendarIcon />,
            title: 'Calendar Integration',
            subtitle: 'Connect Apple, Google & Microsoft',
            onPress: () => nav.navigate('Calendar'),
        },
        {
            icon: <GearIcon />,
            title: 'App Settings',
            subtitle: 'Notifications, security & more',
            onPress: () => nav.navigate('Notifications'),
        },
    ];

    return (
        <View style={[s.container, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn}>
                        <Text style={s.backText}>‹</Text>
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Profile</Text>
                    <TouchableOpacity onPress={() => nav.navigate('Notifications')} style={s.bellBtn}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#1C1C1E" strokeWidth={2} fill="none" />
                            <Path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="#1C1C1E" strokeWidth={2} strokeLinecap="round" />
                        </Svg>
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={s.profileCard}>
                    <View style={s.avatar}>
                        <Text style={s.avatarText}>{initial}</Text>
                    </View>
                    <Text style={s.profileName}>{profile?.full_name || 'User'}</Text>
                    <Text style={s.profileEmail}>{user?.email || ''}</Text>
                </View>

                {/* 2x2 Grid */}
                <View style={s.grid}>
                    {cards.map((card, i) => (
                        <TouchableOpacity key={i} style={s.card} onPress={card.onPress} activeOpacity={0.7}>
                            {card.icon}
                            <Text style={s.cardTitle}>{card.title}</Text>
                            <Text style={s.cardSub}>{card.subtitle}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sign out */}
                <TouchableOpacity style={s.signOutBtn} onPress={handleLogout}>
                    <Text style={s.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 28, fontWeight: '300', color: '#1C1C1E' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', letterSpacing: -0.3 },
    bellBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },

    profileCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginHorizontal: 16, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
    avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    avatarText: { fontSize: 36, fontWeight: '700', color: '#0EA5E9' },
    profileName: { fontSize: 24, fontWeight: '800', color: '#1C1C1E', letterSpacing: -0.5 },
    profileEmail: { fontSize: 14, color: '#8E8E93', marginTop: 4 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
    card: { width: '47%', backgroundColor: '#fff', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1, minHeight: 140 },
    iconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', letterSpacing: -0.2, marginBottom: 4 },
    cardSub: { fontSize: 12, color: '#8E8E93', lineHeight: 16 },

    signOutBtn: { marginHorizontal: 16, marginTop: 20, paddingVertical: 16, alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#E5E5EA' },
    signOutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});
