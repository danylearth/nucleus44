/**
 * src/functions/ — Frontend API wrappers for backend functions
 * 
 * These replace direct imports from Base44's Deno edge functions.
 * Each function calls the backend API via fetch().
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

async function callFunction(name, data = {}, method = 'POST') {
    const { data: { session } } = await (await import('@/api/supabaseClient')).supabase.auth.getSession();

    const response = await fetch(`${API_BASE}/api/functions/${name}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: method !== 'GET' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `Function ${name} failed`);
    }

    // Check if response is JSON or binary
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return response;
}

export { callFunction };
