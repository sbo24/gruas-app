import { supabase } from './supabase';
import { Paquete } from '../types/domain';
import { viajesService } from './viajes.service';
import { SEED_PROFILES, SEED_GRUAS } from './seedLocal';

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
function getLocalPaquetes(): Paquete[] {
  try { return JSON.parse(localStorage.getItem('gruas_demo_paquetes') || '[]'); } catch { return []; }
}
function saveLocalPaquetes(p: Paquete[]) {
  localStorage.setItem('gruas_demo_paquetes', JSON.stringify(p));
}

export const paquetesService = {
  /** Paquetes de una fecha con relaciones (grua, conductor, viajes) */
  async getPaquetesByFecha(fechaStr: string): Promise<Paquete[]> {
    try {
      const { data, error } = await supabase
        .from('paquetes')
        .select('*, grua:gruas(*), conductor:profiles(*), paquete_viajes(*, viaje:viajes(*))')
        .eq('fecha', fechaStr)
        .order('numero');
      if (!error && data && data.length > 0) { saveLocalPaquetes(data); return data; }
    } catch { /* fallback */ }
    return getLocalPaquetes().filter(p => p.fecha === fechaStr);
  },

  /** Paquetes de un conductor específico */
  async getPaquetesByConductor(conductorId: string, fechaStr?: string): Promise<Paquete[]> {
    try {
      let q = supabase
        .from('paquetes')
        .select('*, grua:gruas(*), conductor:profiles(*), paquete_viajes(*, viaje:viajes(*))')
        .eq('conductor_id', conductorId);
      if (fechaStr) q = q.eq('fecha', fechaStr);
      const { data, error } = await q;
      if (!error && data && data.length > 0) return data;
    } catch { /* fallback */ }

    const all = getLocalPaquetes();
    return all.filter(p => p.conductor_id === conductorId && (!fechaStr || p.fecha === fechaStr));
  },

  /** Guarda propuestas del algoritmo */
  async savePropuestas(paquetes: Paquete[]): Promise<void> {
    // Hidratar relaciones desde datos locales
    const profiles = SEED_PROFILES;
    const gruas    = SEED_GRUAS;
    const hydrated = paquetes.map(p => ({
      ...p,
      grua:      gruas.find(g => g.id === p.grua_id) ?? undefined,
      conductor: profiles.find(pr => pr.id === p.conductor_id) ?? undefined,
    })) as Paquete[];
    saveLocalPaquetes(hydrated);

    // Actualizar estado de los viajes
    for (const pkg of paquetes) {
      for (const pv of (pkg.paquete_viajes || [])) {
        await viajesService.updateEstadoViaje(pv.viaje_id, 'EN_PAQUETE');
      }
    }

    // Intentar persistir en Supabase
    for (const pkg of paquetes) {
      try {
        await supabase.from('paquetes').insert([{
          id: pkg.id, fecha: pkg.fecha, grua_id: pkg.grua_id,
          conductor_id: pkg.conductor_id, numero: pkg.numero,
          hora_salida: pkg.hora_salida, hora_final_estimada: pkg.hora_final_estimada,
          kilometros: pkg.kilometros, duracion_minutos: pkg.duracion_minutos,
          puntuacion: pkg.puntuacion, estado: 'PROPUESTA',
        }]);
        for (const pv of (pkg.paquete_viajes || [])) {
          await supabase.from('paquete_viajes').insert([{
            paquete_id: pkg.id, viaje_id: pv.viaje_id, orden: pv.orden, hora_estimada: pv.hora_estimada,
          }]);
        }
      } catch { /* no Supabase */ }
    }
  },

  /** Asigna conductor a un paquete */
  async asignarConductor(paqueteId: string, conductorId: string): Promise<void> {
    const local = getLocalPaquetes();
    const idx = local.findIndex(p => p.id === paqueteId);
    if (idx !== -1) {
      const conductor = SEED_PROFILES.find(pr => pr.id === conductorId) || null;
      local[idx] = { ...local[idx], conductor_id: conductorId, conductor: conductor ?? undefined, estado: 'CONFIRMADO' };
      saveLocalPaquetes(local);
      for (const pv of (local[idx].paquete_viajes || [])) {
        await viajesService.updateEstadoViaje(pv.viaje_id, 'ASIGNADO', conductorId);
      }
    }
    try {
      await supabase.from('paquetes').update({ conductor_id: conductorId, estado: 'CONFIRMADO' }).eq('id', paqueteId);
    } catch { /* no Supabase */ }
  },
};
