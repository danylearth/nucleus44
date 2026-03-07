import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function EditProfileScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { profile, refreshProfile } = useAuth();
    const [name, setName] = useState(profile?.full_name || '');
    const [dob, setDob] = useState(profile?.date_of_birth || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [gender, setGender] = useState(profile?.gender || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await supabase.from('profiles').update({
                full_name: name,
                date_of_birth: dob || null,
                phone: phone || null,
                gender: gender || null,
            }).eq('id', profile?.id);
            await refreshProfile();
            Alert.alert('Saved', 'Your profile has been updated.');
            navigation.goBack();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={[s.container, { paddingTop: insets.top }]} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ fontSize: 16, fontWeight: '600' }}>← Back</Text></TouchableOpacity>
                <Text style={s.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: saving ? '#ccc' : '#06b6d4' }}>{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            {/* Avatar */}
            <View style={s.avatarSection}>
                <View style={s.avatar}>
                    <Text style={s.avatarText}>{name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
                <Text style={s.email}>{profile?.email}</Text>
            </View>

            {/* Fields */}
            <View style={s.card}>
                <Text style={s.label}>Full Name</Text>
                <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor="#9ca3af" />

                <Text style={s.label}>Date of Birth</Text>
                <TextInput style={s.input} value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af" />

                <Text style={s.label}>Phone</Text>
                <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="+44 7XXX XXX XXX" placeholderTextColor="#9ca3af" keyboardType="phone-pad" />

                <Text style={s.label}>Gender</Text>
                <View style={s.genderRow}>
                    {['Male', 'Female', 'Other'].map(g => (
                        <TouchableOpacity
                            key={g}
                            style={[s.genderOption, gender === g && s.genderSelected]}
                            onPress={() => setGender(g)}
                        >
                            <Text style={[s.genderText, gender === g && s.genderTextSelected]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={s.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F8' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
    avatarSection: { alignItems: 'center', paddingVertical: 20 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    avatarText: { fontSize: 32, fontWeight: '700', color: '#6366f1' },
    email: { fontSize: 14, color: '#9ca3af' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    label: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, fontSize: 16, color: '#111' },
    genderRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    genderOption: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    genderSelected: { borderColor: '#111', backgroundColor: '#111' },
    genderText: { fontSize: 14, fontWeight: '500', color: '#111' },
    genderTextSelected: { color: '#fff' },
    saveBtn: { backgroundColor: '#111', borderRadius: 14, paddingVertical: 16, marginHorizontal: 16, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
