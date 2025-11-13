import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const TERRA_SIGNING_SECRET = Deno.env.get("TERRA_SIGNING_SECRET");

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'content-type, terra-signature',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        });
    }

    try {
        const provider = req.headers.get('baggage')?.includes('PROVIDER=') 
            ? req.headers.get('baggage').match(/PROVIDER=([^,]+)/)?.[1] 
            : 'unknown';

        const clonedRequest = req.clone();
        const rawBody = await clonedRequest.text();
        
        if (!rawBody.trim()) {
            console.log('⚠️ Empty webhook body received.');
            return new Response('ok');
        }

        const payload = JSON.parse(rawBody);
        console.log(`📡 Full Terra Payload from ${provider}:`, JSON.stringify(payload, null, 2));


        // Handle Terra healthcheck webhooks
        if (payload.type === 'healthcheck') {
            console.log('✅ Healthcheck webhook - responding OK.');
            return new Response('ok');
        }

        // Handle Terra error/status messages
        if (payload.status && payload.message && !payload.user) {
            console.log(`ℹ️ Terra status message: ${payload.status} - ${payload.message}`);
            return new Response('ok');
        }

        // Handle actual data webhooks
        if (!payload.user || !payload.user.reference_id) {
            console.error('❌ Invalid payload: Missing user or user.reference_id.', payload.user);
            return new Response('Invalid payload - missing user.reference_id', { status: 400 });
        }

        if (!payload.data || !Array.isArray(payload.data) || payload.data.length === 0) {
            console.log(`ℹ️ Informational: No new '${payload.type}' data in this webhook.`);
            return new Response('ok');
        }

        const base44 = createClientFromRequest(req);
        const userId = payload.user.reference_id;
        const healthDataArray = payload.data;

        console.log(`💾 Processing ${healthDataArray.length} '${payload.type}' records for user: ${userId}`);

        const healthEntries = healthDataArray.map(item => ({
            user_id: userId,
            source: 'terra',
            data_type: payload.type,
            data: item,
            timestamp: item.metadata?.start_time || item.metadata?.end_time || new Date().toISOString(),
            synced_at: new Date().toISOString(),
            processed: false,
            quality_score: 1.0
        }));

        await base44.asServiceRole.entities.HealthData.bulkCreate(healthEntries);
        console.log(`✅ Saved ${healthEntries.length} Terra records for ${userId} from ${provider}.`);

        return new Response('ok');

    } catch (error) {
        if (error instanceof SyntaxError) {
             console.error('💥 JSON Parsing Error in Terra webhook:', error.message);
        } else {
             console.error('💥 Unhandled Terra webhook error:', error.message, error.stack);
        }
        // Always return a 200 to Terra to prevent it from retrying a broken webhook
        return new Response('Server error acknowledged', { status: 200 });
    }
});