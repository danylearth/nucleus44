import { Router } from 'express';
import { supabaseAdmin, requireAdmin } from '../server.js';

export const router = Router();

router.post('/', requireAdmin, async (req, res) => {
    try {
        const { clinic_id, patient_email, patient_name, patient_phone, send_invitation = true } = req.body;

        if (!clinic_id || !patient_email || !patient_name) {
            return res.status(400).json({ error: 'clinic_id, patient_email, and patient_name are required' });
        }

        // Verify clinic exists
        const { data: clinic, error: cErr } = await supabaseAdmin
            .from('clinics')
            .select('*')
            .eq('id', clinic_id)
            .single();
        if (cErr || !clinic) return res.status(404).json({ error: 'Clinic not found' });

        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', patient_email);

        if (existingUsers?.length > 0) {
            const existingUser = existingUsers[0];
            await supabaseAdmin
                .from('profiles')
                .update({ clinic_id, assigned_date: new Date().toISOString() })
                .eq('id', existingUser.id);

            return res.json({
                success: true,
                message: 'Existing user assigned to clinic',
                patient: { id: existingUser.id, email: existingUser.email, full_name: existingUser.full_name },
                clinic: { id: clinic.id, name: clinic.name },
                is_new_user: false,
            });
        }

        // Create new user via Supabase Auth
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
            email: patient_email,
            email_confirm: true,
            user_metadata: { full_name: patient_name },
        });

        if (authErr) throw authErr;

        // Update profile with clinic assignment
        await supabaseAdmin
            .from('profiles')
            .update({
                full_name: patient_name,
                phone: patient_phone || '',
                role: 'user',
                clinic_id,
                health_score: 750,
                onboarding_complete: false,
            })
            .eq('id', authData.user.id);

        console.log(`✅ Patient ${patient_name} registered to clinic ${clinic.name}`);

        res.json({
            success: true,
            message: `Patient registered successfully to ${clinic.name}`,
            patient: { id: authData.user.id, email: patient_email, full_name: patient_name },
            clinic: { id: clinic.id, name: clinic.name },
            is_new_user: true,
        });
    } catch (error) {
        console.error('❌ Error registering patient:', error);
        res.status(500).json({ error: 'Failed to register patient', details: error.message });
    }
});
