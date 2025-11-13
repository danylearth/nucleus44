import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS' // Allow POST
};

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Allow both POST (from frontend) and GET (for curl testing)
    if (req.method !== 'POST' && req.method !== 'GET') {
        return Response.json({ error: 'Method Not Allowed' }, { status: 405, headers: corsHeaders });
    }

    try {
        const base44 = createClientFromRequest(req);
        
        // Optional: Check if the requesting user is authenticated
        try {
            const requestingUser = await base44.auth.me();
            console.log(`📋 User ${requestingUser.email} requesting all users list`);
        } catch (authError) {
            return Response.json({ 
                error: 'Unauthorized. Please provide a valid authentication token.' 
            }, { status: 401, headers: corsHeaders });
        }

        // Use service role to get all users (admin access)
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date');
        
        // Clean up the response - remove sensitive data if needed
        const cleanUsers = allUsers.map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            created_date: user.created_date,
            last_login: user.last_login,
            health_score: user.health_score || 750,
            is_verified: user.is_verified
        }));

        return Response.json({
            success: true,
            total_users: cleanUsers.length,
            users: cleanUsers
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Get all users error:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});