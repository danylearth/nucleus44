import { Router } from 'express';
import { supabaseAdmin, requireAdmin } from '../server.js';

export const router = Router();

// Re-use the HL7 parser from scheduledBloodResultsSync
function parseHL7(hl7Content) {
    const lines = hl7Content.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0);
    const result = {
        patient_name: null, patient_email: null, patient_id: null,
        date_of_birth: null, lab_order_id: null, test_date: null,
        clinic_name: null, parameters: []
    };

    for (const line of lines) {
        const segments = line.trim().split('|');
        const segmentType = segments[0];

        if (segmentType === 'MSH') {
            if (segments[5]?.length > 3) result.clinic_name = segments[5].trim();
            else if (segments[6]?.length > 3) result.clinic_name = segments[6].trim();
        }
        if (segmentType === 'PID') {
            result.patient_id = segments[2] || segments[3];
            if (segments[5]) {
                const nameParts = segments[5].split('^');
                result.patient_name = nameParts.length >= 2
                    ? `${nameParts[1]} ${nameParts[0]}`.trim()
                    : segments[5];
            }
            if (segments[7]?.length >= 8) {
                const dob = segments[7].substring(0, 8);
                if (dob !== '00000000') result.date_of_birth = `${dob.substring(0, 4)}-${dob.substring(4, 6)}-${dob.substring(6, 8)}`;
            }
            if (segments[13]?.includes('@')) result.patient_email = segments[13].toLowerCase();
        }
        if (segmentType === 'OBR' && segments[7]?.length >= 8) {
            const d = segments[7].substring(0, 8);
            result.test_date = `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;
        }
        if (segmentType === 'OBX') {
            try {
                const paramName = segments[3]?.split('^')[1] || segments[3] || 'Unknown';
                const paramValue = segments[5];
                const flag = segments[8];
                let status = 'normal';
                if (flag === 'H' || flag === 'HH') status = 'high';
                if (flag === 'L' || flag === 'LL') status = 'low';
                if (flag === 'A' || flag === 'AA') status = 'abnormal';
                if (paramName && paramValue) {
                    result.parameters.push({ name: paramName.trim(), value: paramValue, unit: segments[6] || '', reference_range: segments[7] || '', status });
                }
            } catch (e) { /* skip bad OBX */ }
        }
    }
    return result;
}

router.post('/', requireAdmin, async (req, res) => {
    try {
        const { hl7Content, filename } = req.body;
        if (!hl7Content) return res.status(400).json({ error: 'hl7Content is required' });

        const parsedData = parseHL7(hl7Content);
        const hasAbnormal = parsedData.parameters.some(p => p.status !== 'normal');

        const { data: newResult, error: createErr } = await supabaseAdmin
            .from('lab_results')
            .insert({
                user_id: 'UNMATCHED',
                user_name: parsedData.patient_name || 'Unknown Patient',
                test_name: 'Complete Blood Count',
                test_type: 'blood_work',
                test_date: parsedData.test_date || new Date().toISOString().split('T')[0],
                status: hasAbnormal ? 'abnormal' : 'normal',
                approval_status: 'pending',
                icon_color: hasAbnormal ? 'red' : 'green',
                blood_result_filename: filename || `upload_${Date.now()}.hl7`,
                laboratory: parsedData.clinic_name || 'Unknown Lab',
                ordered_by: 'Manual Upload',
                results_summary: `${parsedData.parameters.length} parameters. ${parsedData.patient_name || 'Unknown patient'}`
            })
            .select().single();

        if (createErr) throw createErr;

        if (parsedData.parameters.length > 0) {
            await supabaseAdmin.from('lab_result_parameters')
                .insert(parsedData.parameters.map(p => ({ ...p, lab_result_id: newResult.id })));
        }

        res.json({
            success: true,
            result: { id: newResult.id, patient: parsedData.patient_name, matched: false, parameters_count: parsedData.parameters.length }
        });
    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});
