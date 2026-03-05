/**
 * app-params.js — Simplified for self-hosted deployment
 * 
 * No longer needs Base44 app params. Supabase config comes from env vars.
 */

export const appParams = {
	supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
	supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
	apiUrl: import.meta.env.VITE_API_URL || '',
};
