import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        console.log('Starting test function...');
        
        const base44 = createClientFromRequest(req);
        console.log('Base44 client created');
        
        // Test 1: Check if we can access the auth
        try {
            const currentUser = await base44.auth.me();
            console.log('Auth check - Current user:', currentUser?.email || 'No user');
        } catch (authError) {
            console.log('Auth check failed (expected):', authError.message);
        }

        // Test 2: Try to list entities without specifying which one
        try {
            console.log('Available entities:', Object.keys(base44.entities || {}));
            console.log('Service role entities:', Object.keys(base44.asServiceRole?.entities || {}));
        } catch (entitiesError) {
            console.log('Entities access error:', entitiesError.message);
        }

        // Test 3: Try a different approach - maybe without asServiceRole
        try {
            const users = await base44.entities.User.list();
            console.log('Direct User entity access worked, found users:', users.length);
        } catch (directError) {
            console.log('Direct entity access error:', directError.message);
        }

        return Response.json({
            success: true,
            message: 'Test completed - check logs for details',
            timestamp: new Date().toISOString()
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Test function error:', error);
        return Response.json({ 
            error: 'Test function failed',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});