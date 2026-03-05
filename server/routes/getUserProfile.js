import { Router } from 'express';
import { supabaseAdmin, requireAuth } from '../server.js';

export const router = Router();

router.post('/', requireAuth, async (req, res) => {
    try {
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;

        res.json({ success: true, profile });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile', details: error.message });
    }
});
