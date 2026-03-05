import { Router } from 'express';
import { supabaseAdmin, requireAuth } from '../server.js';

export const router = Router();

router.post('/', requireAuth, async (req, res) => {
    try {
        const { prompt, messages: clientMessages, model, response_json_schema } = req.body;

        if (!prompt && (!clientMessages || clientMessages.length === 0)) {
            return res.status(400).json({ error: 'prompt or messages is required' });
        }

        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            return res.status(500).json({ error: 'LLM API not configured — set OPENROUTER_API_KEY in server/.env' });
        }

        // Build messages array with system prompt + conversation history
        const messages = [];

        // System prompt with health context
        let systemPrompt = `You are Nucleus AI, a helpful, professional health assistant.

Your role:
- Answer health-related questions clearly, concisely, and in plain language.
- Personalize insights when the user's biometric, blood, or DNA data is available.
- Encourage safe and sustainable habits around nutrition, sleep, exercise, stress, and recovery.
- Stay supportive, positive, and engaging — like a knowledgeable health coach.

Boundaries:
- You are not a doctor and cannot diagnose or prescribe treatments.
- Always remind users to consult a licensed healthcare professional for medical concerns.
- Avoid advice that could cause harm (unsafe diets, extreme exercise, prescriptions).

Style:
- Use a friendly, encouraging tone that makes complex health concepts simple.
- Summarize with key takeaways or action steps where useful.
- If data is missing, ask clarifying questions instead of guessing.
- Offer options (e.g., "You could try X, or Y") rather than rigid rules.`;

        // Try to enrich with user's health data
        try {
            const userId = req.user.id;

            // Get recent blood results
            const { data: labResults } = await supabaseAdmin
                .from('lab_results')
                .select('test_name, test_date, status, results_summary')
                .eq('user_id', userId)
                .eq('approval_status', 'approved')
                .order('test_date', { ascending: false })
                .limit(3);

            if (labResults && labResults.length > 0) {
                systemPrompt += `\n\nUser's recent blood test results:\n`;
                for (const r of labResults) {
                    systemPrompt += `- ${r.test_name} (${r.test_date}): ${r.status}. ${r.results_summary || ''}\n`;
                }
            }

            // Get recent health data
            const { data: healthData } = await supabaseAdmin
                .from('health_data')
                .select('data_type, data, timestamp')
                .eq('user_id', userId)
                .order('timestamp', { ascending: false })
                .limit(5);

            if (healthData && healthData.length > 0) {
                systemPrompt += `\n\nUser's recent health data:\n`;
                for (const h of healthData) {
                    systemPrompt += `- ${h.data_type} (${h.timestamp}): ${JSON.stringify(h.data).substring(0, 200)}\n`;
                }
            }

            // Get user profile info
            systemPrompt += `\nUser profile: ${req.user.full_name || 'Unknown'}, DOB: ${req.user.date_of_birth || 'Unknown'}`;
        } catch (e) {
            // Non-critical, continue without health context
            console.log('Could not enrich AI context:', e.message);
        }

        messages.push({ role: 'system', content: systemPrompt });

        // Add conversation history if provided
        if (clientMessages && clientMessages.length > 0) {
            for (const msg of clientMessages) {
                messages.push({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                });
            }
        } else if (prompt) {
            messages.push({ role: 'user', content: prompt });
        }

        const body = {
            model: model || process.env.LLM_MODEL || 'google/gemini-2.5-flash',
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
