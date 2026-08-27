import { supabase } from './supabase';
import { Profile, Grua } from '../types/domain';
import { SEED_PROFILES, SEED_GRUAS } from './seedLocal';

export { SEED_PROFILES as DEFAULT_PROFILES, SEED_GRUAS as DEFAULT_GRUAS };

export const usuariosService = {
  async getGruas(): Promise<Grua[]> {
    try {
      const { data, error } = await supabase.from('gruas').select('*').eq('activa', true).order('nombre');
      if (!error && data && data.length > 0) return data;
    } catch { /* fallback */ }
    // Intenta desde localStorage si fue guardado
    const stored = localStorage.getItem('gruas_demo_gruas');
    if (stored) { try { return JSON.parse(stored); } catch {} }
    return SEED_GRUAS;
  },

  async getProfiles(rol?: 'ADMIN' | 'OFICINA' | 'CONDUCTOR'): Promise<Profile[]> {
    try {
      let q = supabase.from('profiles').select('*').eq('activo', true);
      if (rol) q = q.eq('rol', rol);
      const { data, error } = await q;
      if (!error && data && data.length > 0) return data;
    } catch { /* fallback */ }
    const stored = localStorage.getItem('gruas_demo_profiles');
    const all: Profile[] = stored ? JSON.parse(stored) : SEED_PROFILES;
    return rol ? all.filter(p => p.rol === rol) : all;
  },

  async getProfileById(id: string): Promise<Profile | null> {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (data) return data;
    } catch { /* fallback */ }
    const stored = localStorage.getItem('gruas_demo_profiles');
    const all: Profile[] = stored ? JSON.parse(stored) : SEED_PROFILES;
    return all.find(p => p.id === id) || null;
  },
};
