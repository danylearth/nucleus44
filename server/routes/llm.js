import { Router } from 'express';
import { supabaseAdmin, requireAuth } from '../server.js';

export const router = Router();

// ─── Gather full health context for the AI ─────────────────────────
async function buildHealthContext(userId) {
    const context = {};

    // 1. Blood / lab results (most recent 5)
    try {
        const { data: labResults } = await supabaseAdmin
            .from('lab_results')
            .select('test_name, test_date, status, results_summary, results')
            .eq('user_id', userId)
            .order('test_date', { ascending: false })
            .limit(5);
        if (labResults?.length) context.labResults = labResults;
    } catch (e) { /* table may not exist yet */ }

    // Also try the blood_results table (legacy name)
    if (!context.labResults) {
        try {
            const { data: bloodResults } = await supabaseAdmin
                .from('blood_results')
                .select('test_type, results, status, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);
            if (bloodResults?.length) context.bloodResults = bloodResults;
        } catch (e) { /* ok */ }
    }

    // 2. Recent health data from wearables (last 7 days, grouped by type)
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: healthData } = await supabaseAdmin
            .from('health_data')
            .select('data_type, data, synced_at')
            .eq('user_id', userId)
            .gte('synced_at', sevenDaysAgo)
            .order('synced_at', { ascending: false })
            .limit(30);
        if (healthData?.length) context.healthData = healthData;
    } catch (e) { /* ok */ }

    // 3. Current supplements
    try {
        const { data: supplements } = await supabaseAdmin
            .from('supplements')
            .select('name, dosage, frequency, active')
            .eq('user_id', userId)
            .eq('active', true);
        if (supplements?.length) context.supplements = supplements;
    } catch (e) { /* ok */ }

    // 4. Connected devices (Terra)
    try {
        const { data: connections } = await supabaseAdmin
            .from('terra_connections')
            .select('provider, is_active, last_sync')
            .eq('user_id', userId);
        if (connections?.length) context.devices = connections;
    } catch (e) { /* ok */ }

    // 5. DNA / epigenetic profile (if Muhdo data exists)
    try {
        const { data: dnaData } = await supabaseAdmin
            .from('health_data')
            .select('data')
            .eq('user_id', userId)
            .eq('data_type', 'dna_profile')
            .limit(1)
            .single();
        if (dnaData?.data) context.dnaProfile = dnaData.data;
    } catch (e) { /* ok */ }

    try {
        const { data: epiData } = await supabaseAdmin
            .from('health_data')
            .select('data')
            .eq('user_id', userId)
            .eq('data_type', 'epigenetic_profile')
            .limit(1)
            .single();
        if (epiData?.data) context.epigeneticProfile = epiData.data;
    } catch (e) { /* ok */ }

    return context;
}

// ─── Build the system prompt ────────────────────────────────────────
function buildSystemPrompt(userProfile, healthContext) {
    let prompt = `You are **Nucleus AI**, a premium, data-driven health assistant built into the Nucleus health platform.

## YOUR MISSION
Give the user genuinely useful, personalised health insights — not generic wellness advice. You have access to their real biometric data, blood work, supplements, wearable metrics, and (when available) DNA & epigenetic profiles. Use this data to be **specific**.

## CORE BEHAVIOUR
1. **Be specific, not generic.** Instead of "eat more vegetables", say "Your ferritin is 15 ng/mL — that's borderline low. Consider adding iron-rich foods like beef liver, lentils, or spinach, and pairing them with vitamin C for absorption."
2. **Reference the user's actual numbers** when relevant. Quote specific biomarkers, sleep durations, heart rate trends, etc.
3. **Highlight what's going well** before areas for improvement. People respond better to encouragement.
4. **Give actionable next steps.** End responses with specific actions the user can take today.
5. **Use clear structure** — bullet points, numbered lists, and bold for key terms. Keep paragraphs short.
6. **Flag concerning patterns** gently but clearly. If something looks off, say so and recommend they discuss it with their doctor.

## BOUNDARIES
- You are NOT a doctor. You cannot diagnose conditions or prescribe medications.
- Always recommend consulting a healthcare professional for medical concerns.
- Never recommend unsafe diets, extreme fasting, unproven supplements, or dangerous exercise volumes.
- If you don't have enough data to answer, say so honestly and suggest what data would help.

## TONE
- Knowledgeable but approachable — like a well-informed friend who happens to be a health expert.
- Brief and punchy unless the user asks for deep-dives.
- Use emojis sparingly for warmth (1-2 per message max).

## USER PROFILE
- Name: ${userProfile.full_name || 'Unknown'}
- Date of birth: ${userProfile.date_of_birth || 'Unknown'}
- Gender: ${userProfile.gender || 'Unknown'}
- Health score: ${userProfile.health_score || 'Not calculated yet'}`;

    // Add blood / lab data
    const labs = healthContext.labResults || healthContext.bloodResults;
    if (labs?.length) {
        prompt += `\n\n## BLOOD / LAB RESULTS (most recent)\n`;
        for (const r of labs) {
            const name = r.test_name || r.test_type || 'Lab test';
            const date = r.test_date || r.created_at;
            const summary = r.results_summary || '';
            const status = r.status || '';
            prompt += `- **${name}** (${date}): ${status} ${summary}\n`;
            if (r.results && typeof r.results === 'object') {
                const resultsStr = JSON.stringify(r.results).substring(0, 500);
                prompt += `  Raw data: ${resultsStr}\n`;
            }
        }
    }

    // Add wearable health data
    if (healthContext.healthData?.length) {
        prompt += `\n\n## WEARABLE & HEALTH DATA (last 7 days)\n`;
        // Group by type
        const grouped = {};
        for (const h of healthContext.healthData) {
            const type = h.data_type || 'other';
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push(h);
        }
        for (const [type, items] of Object.entries(grouped)) {
            prompt += `\n### ${type.toUpperCase()} (${items.length} records)\n`;
            for (const item of items.slice(0, 3)) {
                const dataStr = JSON.stringify(item.data).substring(0, 300);
                prompt += `- ${item.synced_at}: ${dataStr}\n`;
            }
        }
    }

    // Add supplements
    if (healthContext.supplements?.length) {
        prompt += `\n\n## CURRENT SUPPLEMENTS\n`;
        for (const s of healthContext.supplements) {
            prompt += `- ${s.name}: ${s.dosage || 'unknown dose'}, ${s.frequency || 'unknown frequency'}\n`;
        }
    }

    // Add connected devices
    if (healthContext.devices?.length) {
        prompt += `\n\n## CONNECTED DEVICES\n`;
        for (const d of healthContext.devices) {
            const status = d.is_active !== false ? 'Active' : 'Disconnected';
            prompt += `- ${d.provider}: ${status}${d.last_sync ? ` (last sync: ${d.last_sync})` : ''}\n`;
        }
    }

    // Add DNA / epigenetic data
    if (healthContext.dnaProfile) {
        prompt += `\n\n## DNA PROFILE\n${JSON.stringify(healthContext.dnaProfile).substring(0, 800)}\n`;
    }
    if (healthContext.epigeneticProfile) {
        prompt += `\n\n## EPIGENETIC PROFILE\n${JSON.stringify(healthContext.epigeneticProfile).substring(0, 800)}\n`;
    }

    // Note what data is missing
    const missing = [];
    if (!labs?.length) missing.push('blood/lab results');
    if (!healthContext.healthData?.length) missing.push('wearable health data');
    if (!healthContext.supplements?.length) missing.push('supplement information');
    if (!healthContext.dnaProfile) missing.push('DNA profile');
    if (!healthContext.devices?.length) missing.push('connected devices');

    if (missing.length > 0) {
        prompt += `\n\n## MISSING DATA\nThe following data sources are not yet connected: ${missing.join(', ')}. If the user asks about these, let them know they can connect them in the app for better insights.`;
    }

    return prompt;
}

// ─── Main route ─────────────────────────────────────────────────────
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

        const userId = req.user.id;

        // Build rich health context (runs in parallel for speed)
        const healthContext = await buildHealthContext(userId);

        // Build system prompt with full user data
        const systemPrompt = buildSystemPrompt(req.user, healthContext);

        const messages = [{ role: 'system', content: systemPrompt }];

        // Add conversation history
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
            model: model || process.env.LLM_MODEL || 'google/gemini-2.0-flash-001',
            messages,
            max_tokens: 2048,
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

        // Save chat messages to Supabase for history (async, don't block response)
        const lastUserMsg = clientMessages?.[clientMessages.length - 1] || { content: prompt };
        supabaseAdmin.from('chat_messages').insert([
            { user_id: userId, role: 'user', content: lastUserMsg.content },
            { user_id: userId, role: 'assistant', content: content },
        ]).then(() => { }).catch(e => console.log('Chat save error (non-critical):', e.message));

        res.json({ response: content });
    } catch (error) {
        console.error('LLM error:', error);
        res.status(500).json({ error: 'LLM invocation failed', details: error.message });
    }
});
