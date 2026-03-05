import { Router } from 'express';
import { supabaseAdmin, requireAuth } from '../server.js';

export const router = Router();

router.post('/', requireAuth, async (req, res) => {
    try {
        const updates = req.body;

        // Remove any fields that shouldn't be updated directly
        delete updates.id;
        delete updates.role;

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, profile: data });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile', details: error.message });
    }
});
