import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const TERRA_API_KEY = 'wvVwJcKTsMa9LPG8liuDgt-Q9qhj0-Da';
const TERRA_DEV_ID = 'nucleus-testing-3biMfQeV5d';
const TERRA_BASE_URL = 'https://api.tryterra.co/v2';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { connection_id, user_id } = await req.json();
        if (!connection_id || !user_id) {
            return Response.json({ error: 'connection_id and user_id are required' }, { status: 400, headers: corsHeaders });
        }

        const base44 = createClientFromRequest(req);
        const connections = await base44.asServiceRole.entities.TerraConnection.filter({ id: connection_id, user_id: user_id });

        if (!connections || connections.length === 0) {
            return Response.json({ error: 'Terra connection not found' }, { status: 404, headers: corsHeaders });
        }
        const terraConnection = connections[0];

        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        let syncedCount = 0;
        const dataTypes = ['daily', 'sleep', 'activity', 'body'];

        for (const dataType of dataTypes) {
            try {
                const terraResponse = await fetch(`${TERRA_BASE_URL}/${dataType}?user_id=${terraConnection.terra_user_id}&start_date=${startDate}&end_date=${endDate}&to_webhook=false`, {
                    method: 'GET',
                    headers: { 'dev-id': TERRA_DEV_ID, 'x-api-key': TERRA_API_KEY }
                });

                if (!terraResponse.ok) {
                    console.error(`Failed to fetch ${dataType} from Terra:`, await terraResponse.text());
                    continue;
                }

                const terraData = await terraResponse.json();
                
                if (terraData.data && Array.isArray(terraData.data) && terraData.data.length > 0) {
                    const healthEntries = terraData.data.map(dataPoint => ({
                        user_id: user_id,
                        source: 'terra',
                        data_type: dataType,
                        data: dataPoint,
                        timestamp: dataPoint.metadata?.start_time || dataPoint.metadata?.end_time || new Date().toISOString(),
                        synced_at: new Date().toISOString(),
                        processed: false,
                        quality_score: 1.0
                    }));
                    await base44.asServiceRole.entities.HealthData.bulkCreate(healthEntries);
                    syncedCount += healthEntries.length;
                }
            } catch (fetchError) {
                console.error(`Error fetching ${dataType} from Terra:`, fetchError.message, fetchError.stack);
            }
        }

        await base44.asServiceRole.entities.TerraConnection.update(terraConnection.id, { last_sync: new Date().toISOString() });

        return Response.json({
            success: true,
            message: `Initial sync completed. Synced ${syncedCount} data points.`,
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Initial sync error:', error.message, error.stack);
        return Response.json({ error: 'Initial sync failed', details: error.message }, { status: 500, headers: corsHeaders });
    }
});