import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true }
});

/**
 * Devuelve true sólo si Supabase apunta a un servidor local real.
 * En GitHub Pages (sin Docker) devuelve false y los servicios
 * van directo al localStorage sin intentar conexión de red.
 */
export const isSupabaseLocal = (): boolean => {
  return supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');
};
