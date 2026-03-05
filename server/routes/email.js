import { Router } from 'express';
import { requireAuth } from '../server.js';

export const router = Router();

router.post('/', requireAuth, async (req, res) => {
    try {
        const { to, subject, body } = req.body;

        if (!to || !subject || !body) {
            return res.status(400).json({ error: 'to, subject, and body are required' });
        }

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        if (!RESEND_API_KEY) {
            return res.status(500).json({ error: 'Email service not configured' });
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'Nucleus <noreply@nucleus.health>',
                to,
                subject,
                html: body,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Email failed: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        console.log(`📧 Email sent to ${to}: ${subject}`);

        res.json({ success: true, id: data.id });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});
