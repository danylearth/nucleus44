import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase admin client (service role) ────────────────────────
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Helper: get user from request ──────────────────────────────
export async function getUserFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;

    // Get profile
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return { ...user, ...profile };
}

// ─── Helper: require auth middleware ─────────────────────────────
export function requireAuth(req, res, next) {
    getUserFromRequest(req).then(user => {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        req.user = user;
        next();
    }).catch(() => res.status(401).json({ error: 'Unauthorized' }));
}

// ─── Helper: require admin middleware ────────────────────────────
export function requireAdmin(req, res, next) {
    getUserFromRequest(req).then(user => {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        req.user = user;
        next();
    }).catch(() => res.status(401).json({ error: 'Unauthorized' }));
}

// ─── Import route handlers ──────────────────────────────────────
import { router as getAllUsersRouter } from './routes/getAllUsers.js';
import { router as assignPatientRouter } from './routes/assignPatientToClinic.js';
import { router as registerPatientRouter } from './routes/registerPatient.js';
import { router as healthDataRouter } from './routes/healthData.js';
import { router as getUserProfileRouter } from './routes/getUserProfile.js';
import { router as updateUserProfileRouter } from './routes/updateUserProfile.js';
import { router as downloadBloodResultRouter } from './routes/downloadBloodResult.js';
import { router as downloadBloodResultPdfRouter } from './routes/downloadBloodResultPdf.js';
import { router as matchBloodResultRouter } from './routes/matchBloodResult.js';
import { router as forceSyncRouter } from './routes/forceSync.js';
import { router as llmRouter } from './routes/llm.js';
import { router as emailRouter } from './routes/email.js';
import { router as signupRouter } from './routes/signup.js';

// ─── Express app ─────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Backend function routes
app.use('/api/functions/getAllUsers', getAllUsersRouter);
app.use('/api/functions/assignPatientToClinic', assignPatientRouter);
app.use('/api/functions/registerPatient', registerPatientRouter);
app.use('/api/functions/healthData', healthDataRouter);
app.use('/api/functions/getUserProfile', getUserProfileRouter);
app.use('/api/functions/updateUserProfile', updateUserProfileRouter);
app.use('/api/functions/downloadBloodResult', downloadBloodResultRouter);
app.use('/api/functions/downloadBloodResultPdf', downloadBloodResultPdfRouter);
app.use('/api/functions/matchBloodResult', matchBloodResultRouter);
app.use('/api/functions/forceSync', forceSyncRouter);
app.use('/api/functions/signup', signupRouter);

// Integration routes
app.use('/api/llm', llmRouter);
app.use('/api/email', emailRouter);

// Start
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Nucleus API running on http://localhost:${PORT}`);
});
