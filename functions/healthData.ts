import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

Deno.serve(async (req) => {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const base44 = createClientFromRequest(req);

        if (req.method === 'GET') {
            // Get health data for a user
            const url = new URL(req.url);
            const userId = url.searchParams.get('user_id');
            const dataType = url.searchParams.get('type');
            const limit = parseInt(url.searchParams.get('limit') || '50');

            if (!userId) {
                return Response.json({
                    error: 'user_id parameter is required'
                }, { status: 400, headers: corsHeaders });
            }

            let filter = { user_id: userId };
            if (dataType) {
                filter.data_type = dataType;
            }
const wholeData = await base44.asServiceRole.entities.HealthData({});
console.log('wholeData',wholeData) 
            const healthData = await base44.asServiceRole.entities.HealthData.filter(filter);
console.log(healthData,userId)
            return Response.json({
                data: healthData,
                count: healthData.length
            }, { headers: corsHeaders });

        } else if (req.method === 'POST') {
            // Create new health data entry (for manual entry or Terra sync)
            const { user_id, source, data_type, data, timestamp } = await req.json();

            if (!user_id || !source || !data_type || !data) {
                return Response.json({
                    error: 'Missing required fields: user_id, source, data_type, data'
                }, { status: 400, headers: corsHeaders });
            }

            const newHealthData = await base44.asServiceRole.entities.HealthData.create({
                user_id: user_id,
                source: source,
                data_type: data_type,
                data: data,
                timestamp: timestamp || new Date().toISOString(),
                synced_at: new Date().toISOString(),
                processed: false,
                quality_score: 1.0
            });

            return Response.json({
                success: true,
                data: newHealthData
            }, { status: 201, headers: corsHeaders });

        } else {
            return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
        }

    } catch (error) {
        console.error('Health data error:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});