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
        const { user_id } = await req.json();

        if (!user_id) {
            return Response.json({ 
                error: 'user_id is required' 
            }, { status: 400, headers: corsHeaders });
        }

        const base44 = createClientFromRequest(req);

        // Get this user's active Terra connection
        const connections = await base44.asServiceRole.entities.TerraConnection.filter({ 
            user_id: user_id,
            is_active: true 
        });

        if (connections.length === 0) {
            return Response.json({
                message: "No active Terra connection found for this user",
                user_id: user_id
            }, { headers: corsHeaders });
        }

        const connection = connections[0];
        let syncedCount = 0;

        // Calculate date range for recent data (last 2 days)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const dataTypes = ['daily', 'sleep', 'activity', 'body'];

        // Fetch fresh data from Terra for each data type
        for (const dataType of dataTypes) {
            try {
                const terraResponse = await fetch(`${TERRA_BASE_URL}/${dataType}`, {
                    method: 'GET',
                    headers: {
                        'dev-id': TERRA_DEV_ID,
                        'x-api-key': TERRA_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: connection.terra_user_id,
                        start_date: startDate,
                        end_date: endDate
                    })
                });

                if (!terraResponse.ok) {
                    console.error(`Failed to fetch ${dataType} for user ${user_id}:`, terraResponse.status);
                    continue;
                }

                const terraData = await terraResponse.json();

                if (terraData.data && Array.isArray(terraData.data)) {
                    for (const dataPoint of terraData.data) {
                        try {
                            // Check if this data point already exists to avoid duplicates
                            const existingData = await base44.asServiceRole.entities.HealthData.filter({
                                user_id: user_id,
                                data_type: dataType,
                                timestamp: dataPoint.metadata?.start_time || dataPoint.metadata?.end_time
                            });

                            if (existingData.length === 0) {
                                await base44.asServiceRole.entities.HealthData.create({
                                    user_id: user_id,
                                    source: 'terra',
                                    data_type: dataType,
                                    data: dataPoint,
                                    timestamp: dataPoint.metadata?.start_time || dataPoint.metadata?.end_time || new Date().toISOString(),
                                    synced_at: new Date().toISOString(),
                                    processed: false,
                                    quality_score: 1.0
                                });
                                syncedCount++;
                            }
                        } catch (createError) {
                            console.error('Failed to create health data:', createError);
                        }
                    }
                }
            } catch (fetchError) {
                console.error(`Error fetching ${dataType} for user ${user_id}:`, fetchError);
            }
        }

        // Update last sync time
        await base44.asServiceRole.entities.TerraConnection.update(connection.id, {
            last_sync: new Date().toISOString()
        });

        return Response.json({
            success: true,
            message: `Sync completed for user ${user_id}`,
            synced_count: syncedCount,
            user_id: user_id,
            provider: connection.provider
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('User sync error:', error);
        return Response.json({ 
            error: 'User sync failed',
            details: error.message
        }, { status: 500, headers: corsHeaders });
    }
});