/**
 * @/entities/all — Re-exports all entity wrappers from the Supabase-backed base44 client
 *
 * This replaces the Base44 Vite plugin's auto-resolution of `@/entities/all`.
 * Each entity uses the Supabase compatibility layer (filter, list, get, create, update, delete).
 */
import { base44 } from '@/api/base44Client';

// Auth
export const User = base44.auth;

// Entities
export const HealthData = base44.entities.HealthData;
export const LabResult = base44.entities.LabResult;
export const LabResultParameter = base44.entities.LabResultParameter;
export const TerraConnection = base44.entities.TerraConnection;
export const Product = base44.entities.Product;
export const CartItem = base44.entities.CartItem;
export const Order = base44.entities.Order;
export const Clinic = base44.entities.Clinic;
export const AIInsight = base44.entities.AIInsight;
export const Supplement = base44.entities.Supplement;
export const HealthTest = base44.entities.HealthTest;
export const TestOrder = base44.entities.TestOrder;
export const Query = base44.entities.Query;
export const WearableDevice = base44.entities.WearableDevice;
export const ChatConversation = base44.entities.ChatConversation;
