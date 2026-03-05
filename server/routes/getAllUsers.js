import { Router } from 'express';
import { supabaseAdmin, requireAdmin } from '../server.js';

export const router = Router();

router.post('/', requireAdmin, async (req, res) => {
    try {
        console.log(`📋 User ${req.user.email} requesting all users list`);

        const { data: allUsers, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const cleanUsers = (allUsers || []).map(user => ({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            created_at: user.created_at,
            last_login: user.last_login,
            health_score: user.health_score || 750,
        }));

        res.json({
            success: true,
            total_users: cleanUsers.length,
            users: cleanUsers,
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
