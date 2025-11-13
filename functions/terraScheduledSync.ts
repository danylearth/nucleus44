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
        const base44 = createClientFromRequest(req);
        const activeConnections = await base44.asServiceRole.entities.TerraConnection.filter({ is_active: true });

        if (activeConnections.length === 0) {
            return Response.json({ message: "No active Terra connections to sync" }, { headers: corsHeaders });
        }

        let totalSynced = 0;
        const syncResults = [];
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        for (const connection of activeConnections) {
            let userSyncCount = 0;
            const dataTypes = ['daily', 'sleep', 'activity', 'body'];

            for (const dataType of dataTypes) {
                try {
                    const terraResponse = await fetch(`${TERRA_BASE_URL}/${dataType}?user_id=${connection.terra_user_id}&start_date=${startDate}&end_date=${endDate}&to_webhook=false`, {
                        method: 'GET',
                        headers: { 'dev-id': TERRA_DEV_ID, 'x-api-key': TERRA_API_KEY }
                    });

                    if (!terraResponse.ok) {
                        console.error(`Failed to fetch ${dataType} for user ${connection.user_id}:`, await terraResponse.text());
                        continue;
                    }

                    const terraData = await terraResponse.json();

                    if (terraData.data && Array.isArray(terraData.data) && terraData.data.length > 0) {
                        const healthEntries = terraData.data.map(dataPoint => ({
                            user_id: connection.user_id,
                            source: 'terra',
                            data_type: dataType,
                            data: dataPoint,
                            timestamp: dataPoint.metadata?.start_time || dataPoint.metadata?.end_time || new Date().toISOString(),
                            synced_at: new Date().toISOString(),
                            processed: false,
                            quality_score: 1.0
                        }));
                        await base44.asServiceRole.entities.HealthData.bulkCreate(healthEntries);
                        userSyncCount += healthEntries.length;
                        totalSynced += healthEntries.length;
                    }
                } catch (fetchError) {
                    console.error(`Error fetching ${dataType} for user ${connection.user_id}:`, fetchError.message, fetchError.stack);
                }
            }

            await base44.asServiceRole.entities.TerraConnection.update(connection.id, { last_sync: new Date().toISOString() });
            syncResults.push({ user_id: connection.user_id, synced_count: userSyncCount, status: 'success' });
        }

        return Response.json({
            message: "Scheduled sync completed",
            total_data_points: totalSynced,
            results: syncResults
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Scheduled sync error:', error.message, error.stack);
        return Response.json({ error: 'Scheduled sync failed', details: error.message }, { status: 500, headers: corsHeaders });
    }
});