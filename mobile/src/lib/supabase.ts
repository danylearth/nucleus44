import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://spxhgrvozlbvyhcgekca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNweGhncnZvemxidnloY2dla2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzI3MTUsImV4cCI6MjA4ODMwODcxNX0.GA39J8Mj1iVYdIiGvB0cgtqSRw0YLmkX4fIkZmAEYlc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// API base for server functions
export const API_BASE = __DEV__
    ? 'http://192.168.0.175:3001'
    : 'https://your-production-server.com';

// Helper to call server functions with auth
export async function callFunction(name: string, data: any = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${API_BASE}/api/functions/${name}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(err.error || `Function ${name} failed`);
    }

    return response.json();
}
