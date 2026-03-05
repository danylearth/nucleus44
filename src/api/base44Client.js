/**
 * base44Client.js — Supabase-backed compatibility layer
 * 
 * This replaces the @base44/sdk client with Supabase equivalents.
 * The API shape matches base44 so existing pages don't need import changes:
 *   - base44.auth.me() / .updateMe() / .login() / .logout()
 *   - base44.entities.EntityName.filter() / .list() / .get() / .create() / .update() / .delete()
 *   - base44.integrations.Core.InvokeLLM() / .UploadFile() / etc.
 */
import { supabase } from './supabaseClient';

// ─── Table name mapping ──────────────────────────────────────────
// Maps Base44 entity names to Supabase table names
const TABLE_MAP = {
  HealthData: 'health_data',
  LabResult: 'lab_results',
  LabResultParameter: 'lab_result_parameters',
  TerraConnection: 'terra_connections',
  Product: 'products',
  CartItem: 'cart_items',
  Order: 'orders',
  Clinic: 'clinics',
  User: 'profiles',
  AIInsight: 'ai_insights',
  Supplement: 'supplements',
  HealthTest: 'health_tests',
  TestOrder: 'test_orders',
  Query: 'queries',
};

// ─── Entity CRUD wrapper ─────────────────────────────────────────
// Creates an object with filter/list/get/create/update/delete methods
// that match the Base44 SDK interface
function createEntity(entityName) {
  const table = TABLE_MAP[entityName] || entityName.toLowerCase() + 's';

  return {
    /**
     * Filter records by query object
     * Base44 API: entity.filter(queryObj, orderBy?, limit?)
     */
    async filter(query = {}, orderBy, limit) {
      let q = supabase.from(table).select('*');

      // Apply filters
      for (const [key, value] of Object.entries(query)) {
        q = q.eq(key, value);
      }

      // Apply ordering (Base44 uses '-field' for descending)
      if (orderBy) {
        const desc = orderBy.startsWith('-');
        const column = desc ? orderBy.slice(1) : orderBy;
        q = q.order(column, { ascending: !desc });
      }

      // Apply limit
      if (limit) {
        q = q.limit(limit);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    /**
     * List all records with optional ordering and limit
     * Base44 API: entity.list(orderBy?, limit?)
     */
    async list(orderBy, limit) {
      let q = supabase.from(table).select('*');

      if (orderBy) {
        const desc = orderBy.startsWith('-');
        const column = desc ? orderBy.slice(1) : orderBy;
        q = q.order(column, { ascending: !desc });
      }

      if (limit) {
        q = q.limit(limit);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    /**
     * Get a single record by ID
     * Base44 API: entity.get(id)
     */
    async get(id) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Create a new record
     * Base44 API: entity.create(data)
     */
    async create(record) {
      const { data, error } = await supabase
        .from(table)
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Update a record by ID
     * Base44 API: entity.update(id, data)
     */
    async update(id, record) {
      const { data, error } = await supabase
        .from(table)
        .update(record)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Delete a record by ID
     * Base44 API: entity.delete(id)
     */
    async delete(id) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  };
}

// ─── Auth wrapper ────────────────────────────────────────────────
// Matches base44.auth API: me(), updateMe(), login(), logout(), redirectToLogin()
const auth = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');

    // Fetch profile data from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      ...profile,
    };
  },

  async updateMe(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Alias used by onboarding and other pages
  async updateMyUserData(updates) {
    return this.updateMe(updates);
  },

  async login(redirectUrl) {
    window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl || '/')}`;
  },

  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  redirectToLogin(redirectUrl) {
    // Redirect to login page with return URL
    window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl || window.location.href)}`;
  },
};

// ─── Integrations wrapper ────────────────────────────────────────
// Replaces base44.integrations.Core with direct service calls
const API_BASE = import.meta.env.VITE_API_URL || '';

const integrations = {
  Core: {
    async InvokeLLM({ prompt, model, response_json_schema, ...rest }) {
      const response = await fetch(`${API_BASE}/api/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, response_json_schema, ...rest }),
      });
      if (!response.ok) throw new Error('LLM invocation failed');
      return response.json();
    },

    async UploadFile({ file }) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      return { file_url: publicUrl };
    },

    async SendEmail({ to, subject, body }) {
      const response = await fetch(`${API_BASE}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body }),
      });
      if (!response.ok) throw new Error('Email send failed');
      return response.json();
    },

    async SendSMS({ to, message }) {
      const response = await fetch(`${API_BASE}/api/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message }),
      });
      if (!response.ok) throw new Error('SMS send failed');
      return response.json();
    },

    async GenerateImage({ prompt }) {
      const response = await fetch(`${API_BASE}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error('Image generation failed');
      return response.json();
    },

    async ExtractDataFromUploadedFile({ file_url }) {
      const response = await fetch(`${API_BASE}/api/extract-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_url }),
      });
      if (!response.ok) throw new Error('Data extraction failed');
      return response.json();
    },
  },
};

// ─── Entities proxy ──────────────────────────────────────────────
// Creates entity wrappers on-demand so base44.entities.AnyName works
const entities = new Proxy({}, {
  get(target, entityName) {
    if (!target[entityName]) {
      target[entityName] = createEntity(entityName);
    }
    return target[entityName];
  },
});

// ─── Export as "base44" for maximum compatibility ────────────────
// Pages import { base44 } from '@/api/base44Client' — this keeps working
export const base44 = {
  auth,
  entities,
  integrations,
};
