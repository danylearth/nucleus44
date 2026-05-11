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
        const { 
            clinic_id, 
            patient_email, 
            patient_name,
            patient_phone,
            send_invitation = true 
        } = await req.json();
        
        if (!clinic_id || !patient_email || !patient_name) {
            return Response.json({ 
                error: 'clinic_id, patient_email, and patient_name are required' 
            }, { status: 400, headers: corsHeaders });
        }

        const base44 = createClientFromRequest(req);
        
        // Verify requesting user is admin or clinic staff
        const requestingUser = await base44.auth.me();
        if (!requestingUser || requestingUser.role !== 'admin') {
            return Response.json({ 
                error: 'Unauthorized. Admin access required.' 
            }, { status: 401, headers: corsHeaders });
        }

        // Verify clinic exists
        const clinic = await base44.asServiceRole.entities.Clinic.get(clinic_id);
        if (!clinic) {
            return Response.json({ 
                error: 'Clinic not found' 
            }, { status: 404, headers: corsHeaders });
        }

        // Check if user already exists
        const existingUsers = await base44.asServiceRole.entities.User.filter({ 
            email: patient_email 
        });
        
        if (existingUsers.length > 0) {
            // User exists, just assign to clinic
            const existingUser = existingUsers[0];
            await base44.asServiceRole.entities.User.update(existingUser.id, {
                clinic_id: clinic_id,
                assigned_date: new Date().toISOString()
            });

            return Response.json({
                success: true,
                message: 'Existing user assigned to clinic',
                patient: {
                    id: existingUser.id,
                    email: existingUser.email,
                    full_name: existingUser.full_name,
                    muhdo_kit_id: existingUser.muhdo_kit_id
                },
                clinic: {
                    id: clinic.id,
                    clinic_name: clinic.clinic_name
                },
                is_new_user: false
            }, { headers: corsHeaders });
        }

        // --- REMOVED AUTOMATIC KIT ID GENERATION ---
        console.log(`🆕 Creating new patient: ${patient_email} without a pre-generated kit ID.`);

        // Create new user with clinic assignment
        const newUser = await base44.asServiceRole.entities.User.create({
            email: patient_email,
            full_name: patient_name,
            phone_number: patient_phone || '',
            role: 'user',
            clinic_id: clinic_id,
            assigned_date: new Date().toISOString(),
            // muhdo_kit_id is now set by the user during onboarding
            health_score: 750,
            onboarding_complete: false,
            last_login: new Date().toISOString()
        });

        // Update clinic patient count
        const currentPatients = await base44.asServiceRole.entities.User.filter({ clinic_id });
        await base44.asServiceRole.entities.Clinic.update(clinic_id, {
            patient_count: currentPatients.length
        });

        // Send invitation email if requested
        if (send_invitation) {
            const inviteLink = `${Deno.env.get('BASE44_APP_URL')}/onboarding`; // Simplified link
            
            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    from_name: clinic.clinic_name,
                    to: patient_email,
                    subject: `Welcome to ${clinic.clinic_name} - Complete Your Health Profile`,
                    body: `
                        <h2>Welcome ${patient_name}!</h2>
                        <p>You have been registered as a patient at <strong>${clinic.clinic_name}</strong>.</p>
                        <p>Please complete your health profile by clicking the link below. You will be asked to enter the Kit ID from your physical test kit.</p>
                        <a href="${inviteLink}" style="display: inline-block; background: #4ECDC4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Complete Your Profile</a>
                        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:<br>${inviteLink}</p>
                    `
                });
                console.log(`📧 Invitation email sent to ${patient_email}`);
            } catch (emailError) {
                console.error('⚠️ Failed to send invitation email:', emailError);
                // Don't fail the whole operation if email fails
            }
        }

        console.log(`✅ Patient ${patient_name} registered to clinic ${clinic.clinic_name}`);

        return Response.json({
            success: true,
            message: `Patient registered successfully to ${clinic.clinic_name}`,
            patient: {
                id: newUser.id,
                email: newUser.email,
                full_name: newUser.full_name,
                muhdo_kit_id: null,
                phone_number: newUser.phone_number
            },
            clinic: {
                id: clinic.id,
                clinic_name: clinic.clinic_name
            },
            invitation_link: send_invitation ? `${Deno.env.get('BASE44_APP_URL')}/onboarding` : null,
            is_new_user: true
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('❌ Error registering patient:', error);
        return Response.json({ 
            error: 'Failed to register patient',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});