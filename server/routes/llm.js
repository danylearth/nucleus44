import { Router } from 'express';
import { requireAuth } from '../server.js';

export const router = Router();

router.post('/', requireAuth, async (req, res) => {
    try {
        const { prompt, model, response_json_schema } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'prompt is required' });
        }

        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            return res.status(500).json({ error: 'LLM API not configured' });
        }

        const messages = [{ role: 'user', content: prompt }];

        const body = {
            model: model || process.env.LLM_MODEL || 'moonshotai/kimi-k2.5',
            messages,
        };

        if (response_json_schema) {
            body.response_format = {
                type: 'json_schema',
                json_schema: response_json_schema,
            };
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`LLM failed: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        res.json({ response: content });
    } catch (error) {
        console.error('LLM error:', error);
        res.status(500).json({ error: 'LLM invocation failed', details: error.message });
    }
});
