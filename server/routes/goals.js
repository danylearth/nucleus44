import { Router } from 'express';
import { supabaseAdmin, requireAuth } from '../server.js';

export const router = Router();

// ─── List goals ─────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabaseAdmin
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Auto-expire goals past their end_date
        const today = new Date().toISOString().split('T')[0];
        const goals = (data || []).map(g => {
            if (g.status === 'active' && g.end_date && g.end_date < today) {
                return { ...g, status: 'expired' };
            }
            return g;
        });

        res.json({ goals });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals', details: error.message });
    }
});

// ─── Create a goal ──────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, category, target_metric, target_value, unit, current_value } = req.body;

        if (!title) return res.status(400).json({ error: 'Title is required' });

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 90); // 90-day cycles

        const { data, error } = await supabaseAdmin
            .from('goals')
            .insert({
                user_id: userId,
                title,
                category: category || 'custom',
                target_metric: target_metric || null,
                target_value: target_value || null,
                current_value: current_value || null,
                unit: unit || null,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                status: 'active',
            })
            .select()
            .single();

        if (error) throw error;
        res.json({ goal: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create goal', details: error.message });
    }
});

// ─── Update a goal ──────────────────────────────────────────────────
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updates = req.body;

        // Only allow updating own goals
        const { data, error } = await supabaseAdmin
            .from('goals')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        res.json({ goal: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update goal', details: error.message });
    }
});

// ─── Delete a goal ──────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Soft delete — mark as deleted
        const { error } = await supabaseAdmin
            .from('goals')
            .update({ status: 'deleted' })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete goal', details: error.message });
    }
});

// ─── Log a check-in ─────────────────────────────────────────────────
router.post('/:id/check-in', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const goalId = req.params.id;
        const { value, source, notes } = req.body;

        if (value == null) return res.status(400).json({ error: 'Value is required' });

        // Insert check-in
        const { data: checkIn, error: checkInError } = await supabaseAdmin
            .from('goal_check_ins')
            .insert({
                goal_id: goalId,
                user_id: userId,
                value,
                source: source || 'manual',
                notes: notes || null,
            })
            .select()
            .single();

        if (checkInError) throw checkInError;

        // Update current_value on the goal
        await supabaseAdmin
            .from('goals')
            .update({ current_value: value })
            .eq('id', goalId)
            .eq('user_id', userId);

        // Check if goal is now complete
        const { data: goal } = await supabaseAdmin
            .from('goals')
            .select('target_value, target_metric')
            .eq('id', goalId)
            .single();

        let completed = false;
        if (goal?.target_value != null) {
            // For metrics where lower is better (resting HR, weight loss)
            const lowerIsBetter = ['resting_hr', 'weight'].includes(goal.target_metric);
            if (lowerIsBetter) {
                completed = value <= goal.target_value;
            } else {
                completed = value >= goal.target_value;
            }

            if (completed) {
                await supabaseAdmin
                    .from('goals')
                    .update({ status: 'completed' })
                    .eq('id', goalId)
                    .eq('user_id', userId);
            }
        }

        res.json({ checkIn, completed });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log check-in', details: error.message });
    }
});

// ─── Get check-in history for a goal ────────────────────────────────
router.get('/:id/history', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const goalId = req.params.id;

        const { data, error } = await supabaseAdmin
            .from('goal_check_ins')
            .select('*')
            .eq('goal_id', goalId)
            .eq('user_id', userId)
            .order('checked_at', { ascending: true });

        if (error) throw error;
        res.json({ history: data || [] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history', details: error.message });
    }
});
