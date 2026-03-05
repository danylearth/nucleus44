import { Router } from 'express';
import { supabaseAdmin, requireAdmin } from '../server.js';

export const router = Router();

router.post('/', requireAdmin, async (req, res) => {
    try {
        const { result_id, user_id } = req.body;

        if (!result_id || !user_id) {
            return res.status(400).json({ error: 'result_id and user_id are required' });
        }

        // Update the lab result to assign it to the user
        const { data, error } = await supabaseAdmin
            .from('lab_results')
            .update({
                user_id,
                matched: true,
                approval_status: 'approved',
            })
            .eq('id', result_id)
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ Matched blood result ${result_id} to user ${user_id}`);
        res.json({ success: true, result: data });
    } catch (error) {
        console.error('❌ Match error:', error);
        res.status(500).json({ error: 'Failed to match blood result', details: error.message });
    }
});
