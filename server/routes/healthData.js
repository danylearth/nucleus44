import { Router } from 'express';
import { supabaseAdmin, requireAuth } from '../server.js';

export const router = Router();

router.post('/', requireAuth, async (req, res) => {
    try {
        const { user_id } = req.body;
        const targetUserId = user_id || req.user.id;

        const { data, error } = await supabaseAdmin
            .from('health_data')
            .select('*')
            .eq('user_id', targetUserId)
            .order('synced_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        res.json({ success: true, data: data || [] });
    } catch (error) {
        console.error('Health data error:', error);
        res.status(500).json({ error: 'Failed to fetch health data', details: error.message });
    }
});
