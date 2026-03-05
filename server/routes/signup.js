import { Router } from 'express';
import { supabaseAdmin } from '../server.js';

export const router = Router();

/**
 * POST /api/functions/signup
 * Creates a new user via Supabase admin API (bypasses email rate limits).
 * Auto-confirms the email so users can log in immediately.
 * The database trigger `handle_new_user()` will auto-create the profile row.
 */
router.post('/', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password, and full name are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Create user via admin API (bypasses rate limits, auto-confirms email)
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName },
        });

        if (authErr) {
            // Handle duplicate email
            if (authErr.message?.includes('already been registered') || authErr.message?.includes('already exists')) {
                return res.status(409).json({ error: 'An account with this email already exists. Try signing in.' });
            }
            throw authErr;
        }

        console.log(`✅ User registered: ${email} (${authData.user.id})`);

        res.json({
            success: true,
            message: 'Account created successfully. You can now sign in.',
            user: {
                id: authData.user.id,
                email: authData.user.email,
            },
        });
    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).json({ error: 'Failed to create account', details: error.message });
    }
});
