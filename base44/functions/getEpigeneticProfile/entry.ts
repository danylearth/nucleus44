import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const MUHDO_API_KEY = Deno.env.get("MUHDO_API_KEY");
const MUHDO_BASE_URL = "https://www.dna-api.com";

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
        const { profile_id } = await req.json();

        if (!profile_id) {
            return Response.json({ 
                error: 'profile_id is required' 
            }, { status: 400, headers: corsHeaders });
        }

        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        console.log('🧬 Fetching Epigenetic profile:', profile_id);

        // Changed to GET request with profile_id in URL
        const muhdoResponse = await fetch(`${MUHDO_BASE_URL}/epigenetic-profile/${profile_id}`, {
            method: 'GET',
            headers: {
                'apikey': MUHDO_API_KEY
            }
        });

        if (!muhdoResponse.ok) {
            const errorText = await muhdoResponse.text();
            console.error('❌ Muhdo API error:', muhdoResponse.status, errorText);
            return Response.json({ 
                error: 'Failed to fetch Epigenetic profile',
                details: errorText
            }, { status: muhdoResponse.status, headers: corsHeaders });
        }

        const profileData = await muhdoResponse.json();
        console.log('✅ Epigenetic profile fetched successfully');

        return Response.json({
            success: true,
            profile: profileData
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('💥 Error fetching Epigenetic profile:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});