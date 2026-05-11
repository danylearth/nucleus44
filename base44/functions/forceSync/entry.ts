
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
            return Response.json({ error: 'user_id is required' }, { status: 400, headers: corsHeaders });
        }

        const base44 = createClientFromRequest(req);
        const connections = await base44.asServiceRole.entities.TerraConnection.filter({ 
            user_id: user_id,
            is_active: true 
        });

        if (connections.length === 0) {
            return Response.json({ message: "No active Terra connection found for this user" }, { headers: corsHeaders });
        }

        const connection = connections[0];
        console.log(`🔍 Syncing for user: ${user_id}, provider: ${connection.provider}, terra_user_id: ${connection.terra_user_id}`);

        let syncedCount = 0;
        const dataTypes = ['daily', 'sleep', 'activity', 'body'];
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Extended to 7 days
        const syncResults = [];

        for (const dataType of dataTypes) {
            try {
                const terraApiUrl = `${TERRA_BASE_URL}/${dataType}?user_id=${connection.terra_user_id}&start_date=${startDate}&end_date=${endDate}&to_webhook=false`;
                console.log(`📡 Fetching ${dataType} data from: ${terraApiUrl}`);
                
                const terraResponse = await fetch(terraApiUrl, {
                    method: 'GET',
                    headers: { 'dev-id': TERRA_DEV_ID, 'x-api-key': TERRA_API_KEY }
                });

                if (!terraResponse.ok) {
                    const errorText = await terraResponse.text();
                    console.error(`❌ Failed to fetch ${dataType}:`, terraResponse.status, errorText);
                    syncResults.push({ dataType, status: 'failed', error: errorText });
                    continue;
                }

                const terraData = await terraResponse.json();
                console.log(`📊 ${dataType} response:`, {
                    hasData: !!terraData.data,
                    dataLength: terraData.data ? terraData.data.length : 0,
                    sampleData: terraData.data?.[0] ? JSON.stringify(terraData.data[0]).substring(0, 200) + '...' : 'no data'
                });

                if (terraData.data && Array.isArray(terraData.data) && terraData.data.length > 0) {
                    const healthEntries = terraData.data.map(item => ({
                        user_id: user_id,
                        source: 'terra',
                        data_type: dataType,
                        data: item,
                        timestamp: item.metadata?.start_time || item.metadata?.end_time || new Date().toISOString(),
                        synced_at: new Date().toISOString(),
                        processed: false,
                        quality_score: 1.0,
                    }));
                    
                    await base44.asServiceRole.entities.HealthData.bulkCreate(healthEntries);
                    syncedCount += healthEntries.length;
                    syncResults.push({ dataType, status: 'success', count: healthEntries.length });
                    console.log(`✅ Saved ${healthEntries.length} ${dataType} records`);
                } else {
                    syncResults.push({ dataType, status: 'no_data', message: 'No data available for this period' });
                    console.log(`ℹ️  No ${dataType} data available for date range ${startDate} to ${endDate}`);
                }
            } catch (error) {
                console.error(`💥 Error processing ${dataType}:`, error.message, error.stack);
                syncResults.push({ dataType, status: 'error', error: error.message });
            }
        }

        await base44.asServiceRole.entities.TerraConnection.update(connection.id, {
            last_sync: new Date().toISOString()
        });

        console.log(`🎯 Sync completed: ${syncedCount} total data points synced`);

        return Response.json({
            success: true,
            message: `Manual sync completed. Fetched ${syncedCount} new data points.`,
            details: syncResults,
            connection_info: {
                provider: connection.provider,
                terra_user_id: connection.terra_user_id,
                date_range: `${startDate} to ${endDate}`
            }
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('💥 Manual sync error:', error);
        return Response.json({ 
            error: 'Manual sync failed', 
            details: error.message 
        }, { status: 500, headers: corsHeaders });
    }
});
