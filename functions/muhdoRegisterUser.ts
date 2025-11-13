import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const MUHDO_API_KEY = Deno.env.get("MUHDO_API_KEY");
const MUHDO_BASE_URL = "https://www.dna-api.com/v1";

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
        const { user_id } = await req.json(); // Removed kit_ids from direct input

        if (!user_id) {
            return Response.json({ 
                error: 'user_id is required' 
            }, { status: 400, headers: corsHeaders });
        }

        console.log('🔑 Using API Key:', MUHDO_API_KEY ? 'Set ✓' : 'NOT SET ✗');

        const base44 = createClientFromRequest(req);

        // Get user data from Base44
        const user = await base44.asServiceRole.entities.User.get(user_id);
        
        if (!user) {
            return Response.json({ 
                error: 'User not found' 
            }, { status: 404, headers: corsHeaders });
        }

        // Parse date of birth
        const dob = user.date_of_birth ? new Date(user.date_of_birth) : null;
        
        if (!dob) {
            return Response.json({ 
                error: 'User must have a date of birth' 
            }, { status: 400, headers: corsHeaders });
        }

        // --- MODIFIED NAME HANDLING LOGIC ---
        // Step 1: Register user with Muhdo (including email from Base44 user)
        const nameParts = user.full_name?.trim().split(' ').filter(n => n) || [];
        const firstName = nameParts[0] || 'User';
        // If there's no last name, use the first name as the last name.
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

        // --- NEW KIT ID LOGIC ---
        // Use the kit ID from the user's profile if it exists, otherwise use a default.
        const kitIdsToRegister = user.muhdo_kit_id ? [user.muhdo_kit_id] : ["MUHDOHUB2"];

        const muhdoPayload = {
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            language_code: "en-gb",
            gender: user.gender === 'male' ? 0 : 1,
            dob: {
                day: dob.getDate(),
                month: dob.getMonth() + 1,
                year: dob.getFullYear()
            },
            kit_ids: kitIdsToRegister
        };

        console.log('📤 Registering user with Muhdo:', JSON.stringify(muhdoPayload, null, 2));

        const muhdoResponse = await fetch(`${MUHDO_BASE_URL}/register-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': MUHDO_API_KEY
            },
            body: JSON.stringify(muhdoPayload)
        });

        if (!muhdoResponse.ok) {
            const errorText = await muhdoResponse.text();
            console.error('❌ Muhdo API error:', muhdoResponse.status, errorText);
            return Response.json({ 
                error: 'Failed to register user with Muhdo',
                details: errorText,
                status: muhdoResponse.status
            }, { status: muhdoResponse.status, headers: corsHeaders });
        }

        const muhdoData = await muhdoResponse.json();
        console.log('✅ Muhdo registration successful:', muhdoData, `${MUHDO_BASE_URL}/register-user`, muhdoPayload);
        
        // Response: { success: true, email: "user@email.com", kit_id: "MUHDOHUB2" }

        // Step 2: Register the sample kit (links kit to organization for webhooks)
        console.log('📤 Registering sample kit with Muhdo...');
        const kitResponse = await fetch(`${MUHDO_BASE_URL}/register-sample-kit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': MUHDO_API_KEY
            },
            body: JSON.stringify({
                email: muhdoData.email,
                kit_id: muhdoData.kit_id || "MUHDOHUB2"
            })
        });

        if (!kitResponse.ok) {
            const errorText = await kitResponse.text();
            console.error('⚠️ Sample kit registration failed:', kitResponse.status, errorText);
            // Don't fail the whole request - user is registered
        } else {
            const kitData = await kitResponse.json();
            console.log('✅ Sample kit registered successfully:', kitData);
        }

        // Step 3: Update user in Base44 with Muhdo kit_id
        await base44.asServiceRole.entities.User.update(user_id, {
            muhdo_kit_id: muhdoData.kit_id || kitIdsToRegister[0],
            muhdo_email: muhdoData.email
        });

        console.log('💾 Saved Muhdo kit_id to user profile');

        return Response.json({
            success: true,
            message: 'User registered with Muhdo successfully',
            muhdo_email: muhdoData.email,
            muhdo_kit_id: muhdoData.kit_id || kitIdsToRegister[0]
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('💥 Muhdo registration error:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});