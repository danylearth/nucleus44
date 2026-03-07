import { Router } from 'express';
import { supabaseAdmin, requireAuth } from '../server.js';

export const router = Router();

// GET /api/functions/goals
// Fetch user's goals
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: goals, error } = await supabaseAdmin
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .neq('status', 'deleted')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ goals: goals || [] });
    } catch (err) {
        console.error('Error fetching goals:', err);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// POST /api/functions/goals
// Create a new goal
router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, category, target_metric, target_value, unit } = req.body;

        if (!title) return res.status(400).json({ error: 'Title is required' });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 90);

        const { data: goal, error } = await supabaseAdmin
            .from('goals')
            .insert({
                user_id: userId,
                title,
                category: category || 'custom',
                target_metric,
                target_value,
                unit,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                status: 'active'
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ goal });
    } catch (err) {
        console.error('Error creating goal:', err);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// DELETE /api/functions/goals/:id
// Soft delete a goal
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const goalId = req.params.id;

        const { error } = await supabaseAdmin
            .from('goals')
            .update({ status: 'deleted' })
            .eq('id', goalId)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ success: true, message: 'Goal deleted' });
    } catch (err) {
        console.error('Error deleting goal:', err);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

// GET /api/functions/goals/:id/history
// Get check-in history for a goal
router.get('/:id/history', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const goalId = req.params.id;

        const { data: history, error } = await supabaseAdmin
            .from('goal_check_ins')
            .select('*')
            .eq('goal_id', goalId)
            .eq('user_id', userId)
            .order('checked_at', { ascending: false });

        if (error) throw error;
        res.json({ history: history || [] });
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// POST /api/functions/goals/:id/check-in
// Log a check-in
router.post('/:id/check-in', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const goalId = req.params.id;
        const { value, source = 'manual', notes } = req.body;

        if (value === undefined) return res.status(400).json({ error: 'Value is required' });

        // 1. Log the check-in
        const { data: checkIn, error: logError } = await supabaseAdmin
            .from('goal_check_ins')
            .insert({
                goal_id: goalId,
                user_id: userId,
                value,
                source,
                notes,
            })
            .select()
            .single();

        if (logError) throw logError;

        // 2. See if goal is complete
        const { data: goal } = await supabaseAdmin
            .from('goals')
            .select('target_value')
            .eq('id', goalId)
            .single();

        let isCompleted = false;
        if (goal && goal.target_value) {
            // Very simplified: assuming >= target_value means complete.
            // In reality, some goals like "reduce resting HR" might be completed when value <= target_value.
            if (value >= goal.target_value) {
                isCompleted = true;
            }
        }

        // 3. Update the goal's current_value
        await supabaseAdmin
            .from('goals')
            .update({
                current_value: value,
                ...(isCompleted ? { status: 'completed' } : {})
            })
            .eq('id', goalId)
            .eq('user_id', userId);

        res.status(201).json({ checkIn, completed: isCompleted });
    } catch (err) {
        console.error('Error logging check-in:', err);
        res.status(500).json({ error: 'Failed to log check-in' });
    }
});
