import { Router } from 'express';
import { supabaseAdmin, requireAdmin } from '../server.js';

export const router = Router();

router.post('/', requireAdmin, async (req, res) => {
    try {
        const { patient_id, clinic_id } = req.body;

        if (!patient_id || !clinic_id) {
            return res.status(400).json({ error: 'patient_id and clinic_id are required' });
        }

        // Get the patient
        const { data: patient, error: pErr } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', patient_id)
            .single();
        if (pErr || !patient) return res.status(404).json({ error: 'Patient not found' });

        // Get the clinic
        const { data: clinic, error: cErr } = await supabaseAdmin
            .from('clinics')
            .select('*')
            .eq('id', clinic_id)
            .single();
        if (cErr || !clinic) return res.status(404).json({ error: 'Clinic not found' });

        // Update patient record
        await supabaseAdmin
            .from('profiles')
            .update({ clinic_id, assigned_date: new Date().toISOString() })
            .eq('id', patient_id);

        console.log(`✅ Assigned patient ${patient.full_name} to clinic ${clinic.name}`);

        res.json({
            success: true,
            message: `Patient ${patient.full_name} assigned to ${clinic.name}`,
            patient: { id: patient.id, full_name: patient.full_name, email: patient.email },
            clinic: { id: clinic.id, name: clinic.name },
        });
    } catch (error) {
        console.error('❌ Error assigning patient:', error);
        res.status(500).json({ error: 'Failed to assign patient', details: error.message });
    }
});
