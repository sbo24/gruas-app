import { Profile, Grua } from '../types/domain';
import { SEED_PROFILES, SEED_GRUAS, bootstrapLocalData } from './seedLocal';

export { SEED_PROFILES as DEFAULT_PROFILES, SEED_GRUAS as DEFAULT_GRUAS };

export const usuariosService = {
  async getGruas(): Promise<Grua[]> {
    bootstrapLocalData();
    try {
      const stored = localStorage.getItem('gruas_demo_gruas');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) return parsed;
      }
    } catch { /* fallback */ }
    return SEED_GRUAS;
  },

  async getProfiles(rol?: 'ADMIN' | 'OFICINA' | 'CONDUCTOR'): Promise<Profile[]> {
    bootstrapLocalData();
    try {
      const stored = localStorage.getItem('gruas_demo_profiles');
      const all: Profile[] = stored ? JSON.parse(stored) : SEED_PROFILES;
      if (all && all.length > 0) {
        return rol ? all.filter(p => p.rol === rol) : all;
      }
    } catch { /* fallback */ }
    return rol ? SEED_PROFILES.filter(p => p.rol === rol) : SEED_PROFILES;
  },

  async getProfileById(id: string): Promise<Profile | null> {
    bootstrapLocalData();
    try {
      const stored = localStorage.getItem('gruas_demo_profiles');
      const all: Profile[] = stored ? JSON.parse(stored) : SEED_PROFILES;
      return all.find(p => p.id === id) || null;
    } catch { /* fallback */ }
    return SEED_PROFILES.find(p => p.id === id) || null;
  },
};
