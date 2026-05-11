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
            user_id, 
            terra_user_id, 
            access_token, 
            refresh_token, 
            provider, 
            scopes 
        } = await req.json();

        if (!user_id || !terra_user_id || !access_token || !provider) {
            return Response.json({ 
                error: 'Missing required fields: user_id, terra_user_id, access_token, provider' 
            }, { status: 400, headers: corsHeaders });
        }

        const base44 = createClientFromRequest(req);

        // Store Terra connection securely using service role
        const connection = await base44.asServiceRole.entities.TerraConnection.create({
            user_id: user_id,
            terra_user_id: terra_user_id,
            access_token: access_token,
            refresh_token: refresh_token || null,
            provider: provider,
            scopes: scopes || [],
            connected_at: new Date().toISOString(),
            last_sync: null,
            is_active: true
        });

        // Update User entity with terra_user_id for easy access
        await base44.asServiceRole.entities.User.update(user_id, {
            terra_user_id: terra_user_id
        });

        // Immediately trigger initial data fetch
        try {
            await base44.asServiceRole.functions.invoke('terraInitialSync', {
                connection_id: connection.id,
                user_id: user_id
            });
        } catch (syncError) {
            console.error('Failed to trigger initial sync:', syncError);
        }

        return Response.json({
            success: true,
            message: "Terra connection established successfully!",
            connection_id: connection.id,
            provider: provider,
            terra_user_id: terra_user_id
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Terra connection error:', error);
        return Response.json({ 
            error: 'Failed to establish Terra connection',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});