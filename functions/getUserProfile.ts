import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Set up CORS headers to allow requests from any origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' // Allow both GET and POST
};

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Allow both GET (for client-side) and POST (for server/testing)
    if (req.method !== 'GET' && req.method !== 'POST') {
        return Response.json({ error: 'Method Not Allowed' }, { status: 405, headers: corsHeaders });
    }

    try {
        // The Base44 SDK is smart. It can authenticate from:
        // 1. An 'Authorization: Bearer <token>' header (for GET requests)
        // 2. An 'api_key' header (for POST requests)
        const base44 = createClientFromRequest(req);
        
        // base44.auth.me() will work if a valid Bearer token is provided.
        // For API key calls, we might need a different approach if auth.me() fails.
        // Let's assume for now the goal is to get the profile of the user associated with the token/key.
        const user = await base44.auth.me();
        
        return Response.json({
            success: true,
            user: user
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Get user profile error:', error.message);
        
        if (error.message.includes('Unauthorized') || error.status === 401) {
            return Response.json({ 
                error: 'Unauthorized. Please check your token or API key.'
            }, { status: 401, headers: corsHeaders });
        }
        
        return Response.json({ 
            error: 'An internal server error occurred.',
        }, { status: 500, headers: corsHeaders });
    }
});