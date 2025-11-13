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
        const { user_id } = await req.json();

        if (!user_id) {
            return Response.json({ 
                error: 'user_id is required' 
            }, { status: 400, headers: corsHeaders });
        }

        const base44 = createClientFromRequest(req);

        // Get recent health data using service role
        const recentData = await base44.asServiceRole.entities.HealthData.filter(
            { user_id: user_id }, 
            '-synced_at', 
            10
        );

        // Get connected devices using service role
        const devices = await base44.asServiceRole.entities.WearableDevice.filter({ 
            user_id: user_id 
        });

        // Calculate sync statistics
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentSyncs = recentData.filter(item => 
            new Date(item.synced_at) > last24Hours
        );

        const syncStatus = {
            last_sync: recentData.length > 0 ? recentData[0].synced_at : null,
            connected_devices: devices.length,
            sync_count_24h: recentSyncs.length,
            data_types_synced: [...new Set(recentSyncs.map(item => item.data_type))],
            sync_health: recentSyncs.length > 0 ? 'healthy' : 'warning',
            total_data_points: recentData.length
        };

        return Response.json({
            success: true,
            sync_status: syncStatus,
            devices: devices.map(device => ({
                name: device.device_name,
                type: device.device_type,
                brand: device.brand,
                status: device.connection_status || 'unknown'
            }))
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Sync status error:', error);
        return Response.json({ 
            error: 'Internal server error',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});