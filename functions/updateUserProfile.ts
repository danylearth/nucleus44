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
        const base44 = createClientFromRequest(req);
        
        // 1. Get the authenticated user
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        // 2. Get the update data from the request body
        const updates = await req.json();
        
        // 3. Log the action
        console.log(`🚀 Updating profile for user ${user.email} with data:`, updates);

        // 4. Use the service role to perform the update on the User entity
        // This is necessary to modify core fields like full_name and email
        const updatedUser = await base44.asServiceRole.entities.User.update(user.id, updates);

        return Response.json({
            success: true,
            user: updatedUser
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('❌ Error updating user profile:', error);
        return Response.json({ 
            error: 'Failed to update profile',
            details: error.message 
        }, { status: 500, headers: corsHeaders });
    }
});