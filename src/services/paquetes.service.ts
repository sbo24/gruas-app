import { Paquete } from '../types/domain';
import { viajesService } from './viajes.service';
import { SEED_PROFILES, SEED_GRUAS, bootstrapLocalData } from './seedLocal';

function getLocalPaquetes(): Paquete[] {
  bootstrapLocalData();
  try {
    const raw = localStorage.getItem('gruas_demo_paquetes');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPaquetes(p: Paquete[]) {
  localStorage.setItem('gruas_demo_paquetes', JSON.stringify(p));
}

export const paquetesService = {
  async getPaquetesByFecha(fechaStr: string): Promise<Paquete[]> {
    const all = getLocalPaquetes();
    const filtrados = all.filter(p => p.fecha === fechaStr);
    return filtrados.length > 0 ? filtrados : all;
  },

  async getPaquetesByConductor(conductorId: string, fechaStr?: string): Promise<Paquete[]> {
    const all = getLocalPaquetes();
    return all.filter(p => p.conductor_id === conductorId && (!fechaStr || p.fecha === fechaStr));
  },

  async savePropuestas(paquetes: Paquete[]): Promise<void> {
    const hydrated = paquetes.map(p => ({
      ...p,
      grua: SEED_GRUAS.find(g => g.id === p.grua_id) ?? undefined,
      conductor: SEED_PROFILES.find(pr => pr.id === p.conductor_id) ?? undefined,
    })) as Paquete[];
    saveLocalPaquetes(hydrated);

    for (const pkg of paquetes) {
      for (const pv of (pkg.paquete_viajes || [])) {
        await viajesService.updateEstadoViaje(pv.viaje_id, 'EN_PAQUETE');
      }
    }
  },

  async asignarConductor(paqueteId: string, conductorId: string): Promise<void> {
    const local = getLocalPaquetes();
    const idx = local.findIndex(p => p.id === paqueteId);
    if (idx !== -1) {
      const conductor = SEED_PROFILES.find(pr => pr.id === conductorId) ?? undefined;
      local[idx] = {
        ...local[idx],
        conductor_id: conductorId,
        conductor,
        estado: 'CONFIRMADO',
      };
      saveLocalPaquetes(local);
      for (const pv of (local[idx].paquete_viajes || [])) {
        await viajesService.updateEstadoViaje(pv.viaje_id, 'ASIGNADO', conductorId);
      }
    }
  },
};
