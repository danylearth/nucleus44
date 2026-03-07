import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const steps = [
    { title: "What's your name?", field: 'full_name', placeholder: 'Full name', type: 'text' },
    { title: "When were you born?", field: 'date_of_birth', placeholder: 'YYYY-MM-DD', type: 'text' },
    { title: "What's your sex?", field: 'sex', options: ['Male', 'Female', 'Other'] },
    { title: "What are your health goals?", field: 'goals', options: ['Lose weight', 'Build muscle', 'Improve sleep', 'Reduce stress', 'Optimize health', 'Longevity'] },
];

export default function OnboardingScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { session, refreshProfile } = useAuth();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const current = steps[step];

    const handleNext = async () => {
        if (step < steps.length - 1) {
            setStep(s => s + 1);
        } else {
            // Save to profile
            setSaving(true);
            try {
                await supabase.from('profiles').update({
                    full_name: answers.full_name,
                    date_of_birth: answers.date_of_birth,
                    sex: answers.sex,
                    health_goals: answers.goals,
                    onboarding_completed: true,
                }).eq('id', session?.user?.id);
                await refreshProfile();
                navigation.replace('Main');
            } catch (e) {
                console.log('Onboarding save error:', e);
            } finally {
                setSaving(false);
            }
        }
    };

    const setValue = (val: string) => {
        setAnswers(prev => ({ ...prev, [current.field]: val }));
    };

    const canProceed = !!answers[current.field];

    return (
        <KeyboardAvoidingView style={[s.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            {/* Progress */}
            <View style={s.progressRow}>
                {steps.map((_, i) => (
                    <View key={i} style={[s.progressDot, i <= step && s.progressDotActive]} />
                ))}
            </View>

            <ScrollView contentContainerStyle={s.content}>
                <Text style={s.stepNum}>Step {step + 1} of {steps.length}</Text>
                <Text style={s.title}>{current.title}</Text>

                {current.type === 'text' ? (
                    <TextInput
                        style={s.input}
                        placeholder={current.placeholder}
                        placeholderTextColor="#9ca3af"
                        value={answers[current.field] || ''}
                        onChangeText={setValue}
                        autoFocus
                    />
                ) : current.options ? (
                    <View style={s.optionsGrid}>
                        {current.options.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[s.option, answers[current.field] === opt && s.optionSelected]}
                                onPress={() => setValue(opt)}
                            >
                                <Text style={[s.optionText, answers[current.field] === opt && s.optionTextSelected]}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null}
            </ScrollView>

            <View style={s.footer}>
                {step > 0 && (
                    <TouchableOpacity onPress={() => setStep(s => s - 1)} style={s.backBtn}>
                        <Text style={s.backBtnText}>Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={handleNext}
                    style={[s.nextBtn, !canProceed && s.nextBtnDisabled]}
                    disabled={!canProceed || saving}
                >
                    <Text style={s.nextBtnText}>{step === steps.length - 1 ? (saving ? 'Saving...' : 'Finish') : 'Continue'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    progressRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingTop: 16 },
    progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb' },
    progressDotActive: { backgroundColor: '#111' },
    content: { padding: 24, flex: 1 },
    stepNum: { fontSize: 13, color: '#9ca3af', marginBottom: 8 },
    title: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 24 },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, fontSize: 16, color: '#111' },
    optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    option: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12 },
    optionSelected: { borderColor: '#111', backgroundColor: '#111' },
    optionText: { fontSize: 15, color: '#111', fontWeight: '500' },
    optionTextSelected: { color: '#fff' },
    footer: { flexDirection: 'row', gap: 12, padding: 24, paddingBottom: 40 },
    backBtn: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    backBtnText: { fontSize: 16, fontWeight: '600', color: '#111' },
    nextBtn: { flex: 2, backgroundColor: '#111', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    nextBtnDisabled: { opacity: 0.3 },
    nextBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
