/**
 * entities.js — Re-exports from the Supabase-backed base44 client
 * 
 * Pages that import { Query } or { User } from '@/api/entities' continue to work.
 */
import { base44 } from './base44Client';

export const Query = base44.entities.Query;

// auth sdk:
export const User = base44.auth;