import { Router } from 'express';
import { requireAuth } from '../server.js';

export const router = Router();

// Generate a Terra widget session for connecting a wearable device
router.post('/', requireAuth, async (req, res) => {
    try {
        const TERRA_API_KEY = process.env.TERRA_API_KEY;
        const TERRA_DEV_ID = process.env.TERRA_DEV_ID;

        if (!TERRA_API_KEY || !TERRA_DEV_ID) {
            return res.status(500).json({ error: 'Terra API not configured' });
        }

        const userId = req.user.id;
        const { providers } = req.body; // Optional: specific providers to show

        // Generate a widget session
        const terraRes = await fetch('https://api.tryterra.co/v2/auth/generateWidgetSession', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': TERRA_API_KEY,
                'dev-id': TERRA_DEV_ID,
            },
            body: JSON.stringify({
                reference_id: userId,
                providers: providers || 'APPLE,GARMIN,FITBIT,OURA,WHOOP,GOOGLE',
                language: 'en',
            }),
        });

        if (!terraRes.ok) {
            const errText = await terraRes.text();
            throw new Error(`Terra widget error: ${terraRes.status} - ${errText}`);
        }

        const data = await terraRes.json();
        console.log(`🔗 Terra widget session created for user ${req.user.email}`);

        res.json({
            success: true,
            url: data.url,
            session_id: data.session_id,
        });

    } catch (error) {
        console.error('❌ Terra connect error:', error);
        res.status(500).json({ error: 'Failed to create Terra connection', details: error.message });
    }
});
