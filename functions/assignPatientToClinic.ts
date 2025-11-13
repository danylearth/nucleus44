import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { patient_id, clinic_id } = await req.json();
        
        if (!patient_id || !clinic_id) {
            return Response.json({ 
                error: 'patient_id and clinic_id are required' 
            }, { status: 400, headers: corsHeaders });
        }

        const base44 = createClientFromRequest(req);
        
        // Verify requesting user is admin
        const requestingUser = await base44.auth.me();
        if (!requestingUser || requestingUser.role !== 'admin') {
            return Response.json({ 
                error: 'Unauthorized. Admin access required.' 
            }, { status: 401, headers: corsHeaders });
        }

        // Get the patient
        const patient = await base44.asServiceRole.entities.User.get(patient_id);
        if (!patient) {
            return Response.json({ 
                error: 'Patient not found' 
            }, { status: 404, headers: corsHeaders });
        }

        // Get the clinic
        const clinic = await base44.asServiceRole.entities.Clinic.get(clinic_id);
        if (!clinic) {
            return Response.json({ 
                error: 'Clinic not found' 
            }, { status: 404, headers: corsHeaders });
        }

        // Update patient record
        await base44.asServiceRole.entities.User.update(patient_id, {
            clinic_id: clinic_id,
            assigned_date: new Date().toISOString()
        });

        // Update clinic patient count
        const currentPatients = await base44.asServiceRole.entities.User.filter({ clinic_id });
        await base44.asServiceRole.entities.Clinic.update(clinic_id, {
            patient_count: currentPatients.length
        });

        console.log(`✅ Assigned patient ${patient.full_name} to clinic ${clinic.clinic_name}`);

        return Response.json({
            success: true,
            message: `Patient ${patient.full_name} assigned to ${clinic.clinic_name}`,
            patient: {
                id: patient.id,
                full_name: patient.full_name,
                email: patient.email
            },
            clinic: {
                id: clinic.id,
                clinic_name: clinic.clinic_name
            }
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('❌ Error assigning patient:', error);
        return Response.json({ 
            error: 'Failed to assign patient to clinic',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});