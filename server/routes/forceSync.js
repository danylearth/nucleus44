import { Router } from 'express';
import { requireAuth } from '../server.js';

export const router = Router();

router.post('/', requireAuth, async (req, res) => {
    try {
        // Force sync triggers a Terra data refresh for the user
        const TERRA_API_KEY = process.env.TERRA_API_KEY;
        const TERRA_DEV_ID = process.env.TERRA_DEV_ID;

        if (!TERRA_API_KEY || !TERRA_DEV_ID) {
            return res.status(500).json({ error: 'Terra API not configured' });
        }

        const terraUserId = req.user.terra_user_id;
        if (!terraUserId) {
            return res.status(400).json({ error: 'No Terra connection found for this user' });
        }

        // Call Terra API to request data sync
        const terraRes = await fetch(`https://api.tryterra.co/v2/body?user_id=${terraUserId}&start_date=${new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]}&to_webhook=false`, {
            headers: {
                'x-api-key': TERRA_API_KEY,
                'dev-id': TERRA_DEV_ID,
            },
        });

        if (!terraRes.ok) {
            throw new Error(`Terra sync failed: ${terraRes.status}`);
        }

        const terraData = await terraRes.json();
        console.log(`🔄 Force sync triggered for user ${req.user.email}`);

        res.json({ success: true, message: 'Sync triggered', data: terraData });
    } catch (error) {
        console.error('❌ Force sync error:', error);
        res.status(500).json({ error: 'Failed to force sync', details: error.message });
    }
});
