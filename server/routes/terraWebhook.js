import { Router } from 'express';
import { supabaseAdmin } from '../server.js';

export const router = Router();

// Terra webhook — receives health data from Terra API
// This endpoint does NOT require auth because it's called by Terra's servers
router.post('/', async (req, res) => {
    try {
        const payload = req.body;

        // Handle Terra healthcheck
        if (payload.type === 'healthcheck') {
            console.log('✅ Terra healthcheck — responding OK.');
            return res.send('ok');
        }

        // Handle status messages
        if (payload.status && payload.message && !payload.user) {
            console.log(`ℹ️ Terra status: ${payload.status} - ${payload.message}`);
            return res.send('ok');
        }

        // Validate payload
        if (!payload.user || !payload.user.reference_id) {
            console.error('❌ Invalid Terra payload: Missing user.reference_id');
            return res.status(400).send('Invalid payload');
        }

        if (!payload.data || !Array.isArray(payload.data) || payload.data.length === 0) {
            console.log(`ℹ️ No new '${payload.type}' data in this webhook.`);
            return res.send('ok');
        }

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

        const { error } = await supabaseAdmin
            .from('health_data')
            .insert(healthEntries);

        if (error) throw error;

        console.log(`✅ Saved ${healthEntries.length} Terra records for ${userId}.`);
        res.send('ok');

    } catch (error) {
        console.error('💥 Terra webhook error:', error.message);
        // Always return 200 to prevent Terra from retrying
        res.status(200).send('Server error acknowledged');
    }
});
