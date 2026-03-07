import { Router } from 'express';
import { supabaseAdmin, requireAuth } from '../server.js';

export const router = Router();

/**
 * Calculate a comprehensive health score (0–1000) based on available data.
 * 
 * The score is broken into categories, each worth a portion of the total:
 * - Activity & Steps:      200 pts
 * - Heart Rate & Recovery:  200 pts
 * - Sleep Quality:          200 pts
 * - Blood Work:             200 pts
 * - Consistency & Streaks:  200 pts
 * 
 * If a data source is missing, we don't penalise — we scale the score
 * proportionally across the categories that DO have data.
 */

// ─── Scoring helpers ────────────────────────────────────────────────

function scoreSteps(avgDailySteps) {
    // 10,000 steps/day = perfect score
    if (!avgDailySteps || avgDailySteps <= 0) return null;
    const ratio = Math.min(avgDailySteps / 10000, 1.3); // cap at 130%
    return Math.round(ratio * 200);
}

function scoreSleep(avgSleepHours) {
    // 7-9 hours = perfect, less or more = lower
    if (!avgSleepHours || avgSleepHours <= 0) return null;
    if (avgSleepHours >= 7 && avgSleepHours <= 9) return 200;
    if (avgSleepHours >= 6 && avgSleepHours < 7) return 160;
    if (avgSleepHours > 9 && avgSleepHours <= 10) return 170;
    if (avgSleepHours >= 5 && avgSleepHours < 6) return 120;
    if (avgSleepHours > 10) return 130;
    return 80; // less than 5 hours
}

function scoreHeartRate(restingHR, hrv) {
    // Lower resting HR is better (50-70 ideal), higher HRV is better
    let score = null;
    if (restingHR && restingHR > 0) {
        if (restingHR <= 55) score = 200;
        else if (restingHR <= 60) score = 190;
        else if (restingHR <= 65) score = 175;
        else if (restingHR <= 70) score = 160;
        else if (restingHR <= 75) score = 140;
        else if (restingHR <= 80) score = 120;
        else if (restingHR <= 85) score = 100;
        else score = 80;
    }
    // Boost if we have good HRV data
    if (hrv && hrv > 0 && score !== null) {
        if (hrv > 60) score = Math.min(200, score + 20);
        else if (hrv > 40) score = Math.min(200, score + 10);
        else if (hrv < 20) score = Math.max(0, score - 15);
    }
    return score;
}

function scoreBloodWork(labResults) {
    // Simple: score based on status of most recent test
    if (!labResults || labResults.length === 0) return null;

    let totalScore = 0;
    let count = 0;

    for (const result of labResults) {
        const status = (result.status || '').toLowerCase();
        if (status.includes('optimal') || status.includes('normal') || status.includes('good')) {
            totalScore += 200;
        } else if (status.includes('borderline') || status.includes('suboptimal')) {
            totalScore += 130;
        } else if (status.includes('low') || status.includes('high') || status.includes('deficien')) {
            totalScore += 80;
        } else if (status.includes('critical') || status.includes('danger')) {
            totalScore += 40;
        } else {
            totalScore += 150; // unknown status, moderate default
        }
        count++;
    }

    return count > 0 ? Math.round((totalScore / count) * 0.75) : null; // scale down from 200 base to 150 max
}

function scoreConsistency(dataPoints, daysTracked) {
    // How many of the last 7 days have data
    if (!daysTracked || daysTracked <= 0) return null;
    const ratio = Math.min(daysTracked / 7, 1);
    return Math.round(ratio * 100); // Max 100 for consistency
}

function scoreGoals(goals) {
    if (!goals || goals.length === 0) return null;
    let totalPct = 0;
    for (const g of goals) {
        if (!g.target_value) {
            totalPct += 0.5; // Default middle ground if no target
            continue;
        }
        let current = g.current_value || 0;
        let pct = Math.min(1, current / g.target_value);
        totalPct += pct;
    }
    const avgPct = (totalPct / goals.length);
    return Math.round(avgPct * 150); // Max 150 for goals
}

// ─── Main route ─────────────────────────────────────────────────────

router.post('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Gather all health data from last 7 days
        const { data: healthData } = await supabaseAdmin
            .from('health_data')
            .select('data_type, data, synced_at')
            .eq('user_id', userId)
            .gte('synced_at', sevenDaysAgo)
            .order('synced_at', { ascending: false });

        // Gather lab results
        let labResults = [];
        try {
            const { data } = await supabaseAdmin
                .from('lab_results')
                .select('status, test_date')
                .eq('user_id', userId)
                .order('test_date', { ascending: false })
                .limit(5);
            if (data) labResults = data;
        } catch (e) { /* table might not exist */ }

        if (!labResults.length) {
            try {
                const { data } = await supabaseAdmin
                    .from('blood_results')
                    .select('status, created_at')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(5);
                if (data) labResults = data;
            } catch (e) { /* ok */ }
        }

        // Gather active goals
        let activeGoals = [];
        try {
            const { data } = await supabaseAdmin
                .from('goals')
                .select('target_value, current_value, status')
                .eq('user_id', userId)
                .eq('status', 'active');
            if (data) activeGoals = data;
        } catch (e) { /* table might not exist yet */ }

        // Parse health data into metrics
        let totalSteps = 0, stepDays = 0;
        let totalSleepHours = 0, sleepDays = 0;
        let restingHRs = [], hrvValues = [];
        const uniqueDays = new Set();

        if (healthData) {
            for (const record of healthData) {
                const day = record.synced_at?.split('T')[0];
                if (day) uniqueDays.add(day);

                const d = record.data || {};

                switch (record.data_type) {
                    case 'daily':
                    case 'activity':
                        if (d.steps) { totalSteps += d.steps; stepDays++; }
                        if (d.total_steps) { totalSteps += d.total_steps; stepDays++; }
                        break;
                    case 'sleep':
                        const hours = d.duration_hours || d.total_sleep_duration_hours ||
                            (d.duration_seconds ? d.duration_seconds / 3600 : 0);
                        if (hours > 0) { totalSleepHours += hours; sleepDays++; }
                        break;
                    case 'body':
                    case 'heart_rate':
                        if (d.resting_heart_rate) restingHRs.push(d.resting_heart_rate);
                        if (d.avg_hr_bpm) restingHRs.push(d.avg_hr_bpm);
                        if (d.hrv) hrvValues.push(d.hrv);
                        if (d.avg_hrv) hrvValues.push(d.avg_hrv);
                        break;
                }
            }
        }

        // Calculate sub-scores
        const avgSteps = stepDays > 0 ? totalSteps / stepDays : 0;
        const avgSleep = sleepDays > 0 ? totalSleepHours / sleepDays : 0;
        const avgHR = restingHRs.length > 0 ? restingHRs.reduce((a, b) => a + b) / restingHRs.length : 0;
        const avgHRV = hrvValues.length > 0 ? hrvValues.reduce((a, b) => a + b) / hrvValues.length : 0;

        const categoryMaxes = {
            activity: 200,
            sleep: 200,
            heart: 200, // Make sure key matches frontend optionally
            blood: 150,
            goals: 150,
            consistency: 100,
        };

        const categories = {
            activity: scoreSteps(avgSteps),
            sleep: scoreSleep(avgSleep),
            heart: scoreHeartRate(avgHR, avgHRV),
            blood: scoreBloodWork(labResults),
            goals: scoreGoals(activeGoals),
            consistency: scoreConsistency(healthData?.length || 0, uniqueDays.size),
        };

        // Calculate final score — scale proportionally across available categories
        const availableCategories = Object.entries(categories).filter(([_, v]) => v !== null);
        let finalScore = 750; // default if no data

        if (availableCategories.length > 0) {
            const rawTotal = availableCategories.reduce((sum, [_, v]) => sum + v, 0);
            const maxPossible = availableCategories.reduce((sum, [k, _]) => sum + categoryMaxes[k], 0);
            finalScore = Math.round((rawTotal / maxPossible) * 1000);
            finalScore = Math.max(0, Math.min(1000, finalScore));
        }

        // Update the user's health_score in profiles
        await supabaseAdmin
            .from('profiles')
            .update({ health_score: finalScore })
            .eq('id', userId);

        // Build breakdown for the UI
        const breakdown = {};
        for (const [key, value] of Object.entries(categories)) {
            const maxKey = categoryMaxes[key] || 200;
            breakdown[key] = {
                score: value,
                maxScore: maxKey,
                percentage: value !== null ? Math.round((value / maxKey) * 100) : null,
                hasData: value !== null,
            };
        }

        res.json({
            score: finalScore,
            breakdown,
            dataPoints: healthData?.length || 0,
            daysTracked: uniqueDays.size,
            lastUpdated: new Date().toISOString(),
            metrics: {
                avgDailySteps: Math.round(avgSteps),
                avgSleepHours: Math.round(avgSleep * 10) / 10,
                avgRestingHR: Math.round(avgHR),
                avgHRV: Math.round(avgHRV),
                labResultsCount: labResults.length,
            },
        });
    } catch (error) {
        console.error('Health score calculation error:', error);
        res.status(500).json({ error: 'Failed to calculate health score', details: error.message });
    }
});
