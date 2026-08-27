import { Viaje, HistorialEstado, Facturacion } from '../types/domain';
import { ViajeEstado } from '../config/appConfig';
import { bootstrapLocalData } from './seedLocal';

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
function getLocalViajes(): Viaje[] {
  bootstrapLocalData();
  try {
    const raw = localStorage.getItem('gruas_demo_viajes');
    if (!raw) return [];
    const list: Viaje[] = JSON.parse(raw);
    return list;
  } catch {
    return [];
  }
}

function saveLocalViajes(v: Viaje[]) {
  localStorage.setItem('gruas_demo_viajes', JSON.stringify(v));
}

function getLocalHistorial(): HistorialEstado[] {
  bootstrapLocalData();
  try {
    const raw = localStorage.getItem('gruas_demo_historial');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalHistorial(h: HistorialEstado[]) {
  localStorage.setItem('gruas_demo_historial', JSON.stringify(h));
}

function getLocalFacturacion(): Facturacion[] {
  bootstrapLocalData();
  try {
    const raw = localStorage.getItem('gruas_demo_facturacion');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFacturacion(f: Facturacion[]) {
  localStorage.setItem('gruas_demo_facturacion', JSON.stringify(f));
}

export const viajesService = {
  /**
   * Obtiene los viajes para una fecha concreta (o todos si coinciden)
   */
  async getViajesByFecha(fechaStr: string): Promise<Viaje[]> {
    const viajes = getLocalViajes();
    // Si la fecha coincide o filtramos por fecha
    const filtrados = viajes.filter(v => v.fecha === fechaStr);
    // Si no hay ninguno para esa fecha exacta, devolver los viajes con fecha actualizada
    if (filtrados.length === 0 && viajes.length > 0) {
      return viajes;
    }
    return filtrados.length > 0 ? filtrados : viajes;
  },

  /**
   * Obtiene todos los viajes registrados
   */
  async getAllViajes(): Promise<Viaje[]> {
    return getLocalViajes();
  },

  /**
   * Crea un nuevo viaje de forma instantánea
   */
  async createViaje(viajeData: Omit<Viaje, 'id' | 'created_at' | 'updated_at'>): Promise<Viaje> {
    const newViaje: Viaje = {
      ...viajeData,
      id: crypto.randomUUID(),
      estado: viajeData.estado || 'PENDIENTE_MONTAR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const local = getLocalViajes();
    local.unshift(newViaje);
    saveLocalViajes(local);
    return newViaje;
  },

  /**
   * Actualiza el estado de un viaje y registra el historial
   */
  async updateEstadoViaje(
    viajeId: string,
    estadoNuevo: ViajeEstado,
    usuarioId?: string,
    observaciones?: string
  ): Promise<Viaje> {
    const local = getLocalViajes();
    const idx = local.findIndex(v => v.id === viajeId);
    const estadoAnterior = idx !== -1 ? local[idx].estado : null;

    // Registrar en Historial
    const histEntry: HistorialEstado = {
      id: crypto.randomUUID(),
      viaje_id: viajeId,
      usuario_id: usuarioId || null,
      estado_anterior: estadoAnterior || null,
      estado_nuevo: estadoNuevo,
      observaciones: observaciones || null,
      created_at: new Date().toISOString(),
    };
    const hist = getLocalHistorial();
    hist.push(histEntry);
    saveLocalHistorial(hist);

    // Si pasa a TERMINADO, generar registro en Facturación
    if (estadoNuevo === 'TERMINADO' || estadoNuevo === 'PAGADO') {
      const importe = idx !== -1 ? local[idx].importe : 100;
      const facturas = getLocalFacturacion();
      const existing = facturas.find(f => f.viaje_id === viajeId);
      if (!existing) {
        facturas.push({
          id: crypto.randomUUID(),
          viaje_id: viajeId,
          importe,
          estado: estadoNuevo === 'PAGADO' ? 'PAGADO' : 'PENDIENTE',
          fecha_pago: estadoNuevo === 'PAGADO' ? new Date().toISOString() : null,
          usuario_pago_id: usuarioId || null,
          created_at: new Date().toISOString(),
        });
        saveLocalFacturacion(facturas);
      }
    }

    if (idx !== -1) {
      local[idx] = {
        ...local[idx],
        estado: estadoNuevo,
        updated_at: new Date().toISOString(),
      };
      saveLocalViajes(local);
      return local[idx];
    }

    throw new Error('Viaje no encontrado');
  },

  /**
   * Obtiene la línea temporal de estados de un viaje
   */
  async getHistorialByViajeId(viajeId: string): Promise<HistorialEstado[]> {
    const hist = getLocalHistorial();
    return hist.filter(h => h.viaje_id === viajeId);
  },

  /**
   * Obtiene las facturas con la información del viaje
   */
  async getFacturacion(): Promise<Facturacion[]> {
    const facturas = getLocalFacturacion();
    const viajes = getLocalViajes();
    return facturas.map(f => ({
      ...f,
      viaje: viajes.find(v => v.id === f.viaje_id),
    }));
  },

  /**
   * Marca una factura como pagada
   */
  async marcarFacturaPagada(facturaId: string, usuarioId: string, viajeId?: string): Promise<void> {
    const facturas = getLocalFacturacion();
    const idx = facturas.findIndex(f => f.id === facturaId || f.viaje_id === viajeId);
    if (idx !== -1) {
      facturas[idx] = {
        ...facturas[idx],
        estado: 'PAGADO',
        fecha_pago: new Date().toISOString(),
        usuario_pago_id: usuarioId,
      };
      saveLocalFacturacion(facturas);
    }
    if (viajeId) {
      await this.updateEstadoViaje(viajeId, 'PAGADO', usuarioId, 'Factura abonada');
    }
  },
};
