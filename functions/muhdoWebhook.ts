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
        const payload = await req.json();
        const base44 = createClientFromRequest(req);

        console.log('🔔 Muhdo webhook received:', payload);

        // Handle different webhook types
        if (payload.test_type) {
            // This is a DNA/Epigenetic results webhook
            await handleResultsWebhook(base44, payload);
        } else if (payload.kit_status_id) {
            // This is a sample status update webhook
            await handleStatusWebhook(base44, payload);
        }

        return Response.json({ 
            success: true,
            message: 'Webhook processed'
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('💥 Webhook processing error:', error);
        return Response.json({ 
            error: 'Webhook processing failed',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});

async function handleResultsWebhook(base44, payload) {
    console.log('📊 Processing results webhook...');
    
    // Step 1: Fetch the full profile from Muhdo using the profile_id
    let profileResponse;
    try {
        if (payload.test_type === 'Epigenetic') {
            const { data } = await base44.asServiceRole.functions.invoke('getEpigeneticProfile', { profile_id: payload.profile_id });
            profileResponse = data;
        } else { // Default to DNA if not explicitly Epigenetic
            const { data } = await base44.asServiceRole.functions.invoke('getDnaProfile', { profile_id: payload.profile_id });
            profileResponse = data;
        }

        if (!profileResponse.success) {
            throw new Error(`Failed to fetch profile details from Muhdo: ${profileResponse.message || 'Unknown error'}`);
        }
    } catch (fetchError) {
        console.error('❌ Could not fetch profile from Muhdo to find kit_id:', fetchError.message);
        return;
    }

    const fullProfile = profileResponse.profile;
    const kitId = fullProfile.kit_id;

    if (!kitId) {
        console.error('❌ Profile from Muhdo did not contain a kit_id. Cannot match user.');
        return;
    }

    // Step 2: Find user in our database using the kit_id
    const users = await base44.asServiceRole.entities.User.filter({
        muhdo_kit_id: kitId
    });

    if (users.length === 0) {
        console.error('❌ No user found for kit_id:', kitId);
        return;
    }

    const user = users[0];

    // Step 3: Determine test_type properly
    let testType = 'other';
    let iconColor = 'purple';
    
    if (payload.test_type.toLowerCase() === 'dna') {
        testType = 'genetics';
        iconColor = 'purple';
    } else if (payload.test_type.toLowerCase() === 'epigenetic') {
        testType = 'epigenetic';
        iconColor = 'teal';
    }

    // Step 4: Create the lab result entry
    await base44.asServiceRole.entities.LabResult.create({
        user_id: user.id,
        user_name: user.full_name,
        test_name: payload.algorithm_set_name,
        test_type: testType, // Now properly set to 'genetics' or 'epigenetic'
        test_date: new Date(payload.date_time).toISOString().split('T')[0],
        status: 'normal',
        icon_color: iconColor,
        results_summary: `${payload.algorithm_set_name} results are ready`,
        created_by: user.email,
        profile_id: payload.profile_id,
        algorithm_set_reference_code: payload.algorithm_set_reference_code
    });

    console.log(`✅ Lab result "${payload.algorithm_set_name}" (${testType}) created for user:`, user.email, `(Kit ID: ${kitId})`);
}

async function handleStatusWebhook(base44, payload) {
    console.log('📦 Processing status webhook...', payload.kit_status);
    
    // Find user by kit_id
    const users = await base44.asServiceRole.entities.User.filter({
        muhdo_kit_id: payload.kit_id
    });

    if (users.length === 0) {
        console.error('❌ No user found for kit_id:', payload.kit_id);
        return;
    }

    console.log('✅ Status update processed for kit:', payload.kit_id);
}