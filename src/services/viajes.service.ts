import { supabase } from './supabase';
import { Viaje, HistorialEstado, Facturacion } from '../types/domain';
import { ViajeEstado } from '../config/appConfig';

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
function getLocalViajes(): Viaje[] {
  try { return JSON.parse(localStorage.getItem('gruas_demo_viajes') || '[]'); } catch { return []; }
}
function saveLocalViajes(v: Viaje[]) {
  localStorage.setItem('gruas_demo_viajes', JSON.stringify(v));
}
function getLocalHistorial(): HistorialEstado[] {
  try { return JSON.parse(localStorage.getItem('gruas_demo_historial') || '[]'); } catch { return []; }
}
function saveLocalHistorial(h: HistorialEstado[]) {
  localStorage.setItem('gruas_demo_historial', JSON.stringify(h));
}

export const viajesService = {
  /** Viajes del día */
  async getViajesByFecha(fechaStr: string): Promise<Viaje[]> {
    try {
      const { data, error } = await supabase.from('viajes').select('*').eq('fecha', fechaStr).order('created_at');
      if (!error && data && data.length > 0) { saveLocalViajes(data); return data; }
    } catch { /* fallback */ }
    return getLocalViajes().filter(v => v.fecha === fechaStr);
  },

  /** Todos los viajes (historial) */
  async getAllViajes(): Promise<Viaje[]> {
    try {
      const { data, error } = await supabase.from('viajes').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) { saveLocalViajes(data); return data; }
    } catch { /* fallback */ }
    return getLocalViajes();
  },

  /** Crear viaje */
  async createViaje(viajeData: Omit<Viaje, 'id' | 'created_at' | 'updated_at'>): Promise<Viaje> {
    const newViaje: Viaje = {
      ...viajeData,
      id: crypto.randomUUID(),
      estado: 'PENDIENTE_MONTAR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    try {
      const { data, error } = await supabase.from('viajes').insert([newViaje]).select().single();
      if (!error && data) { const local = getLocalViajes(); local.unshift(data); saveLocalViajes(local); return data; }
    } catch { /* fallback */ }
    const local = getLocalViajes();
    local.unshift(newViaje);
    saveLocalViajes(local);
    return newViaje;
  },

  /** Cambiar estado y registrar historial */
  async updateEstadoViaje(
    viajeId: string,
    estadoNuevo: ViajeEstado,
    usuarioId?: string,
    observaciones?: string
  ): Promise<Viaje> {
    const local = getLocalViajes();
    const idx = local.findIndex(v => v.id === viajeId);
    const estadoAnterior = idx !== -1 ? local[idx].estado : null;

    // Historial local
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

    // Facturación automática al terminar
    if (estadoNuevo === 'TERMINADO') {
      const importe = idx !== -1 ? local[idx].importe : 0;
      const facturas: Facturacion[] = JSON.parse(localStorage.getItem('gruas_demo_facturacion') || '[]');
      if (!facturas.find(f => f.viaje_id === viajeId)) {
        facturas.push({
          id: crypto.randomUUID(), viaje_id: viajeId, importe,
          estado: 'PENDIENTE', fecha_pago: null, usuario_pago_id: null,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('gruas_demo_facturacion', JSON.stringify(facturas));
      }
    }

    try {
      await supabase.from('viajes').update({ estado: estadoNuevo, updated_at: new Date().toISOString() }).eq('id', viajeId);
      await supabase.from('historial_estados').insert([histEntry]);
      if (estadoNuevo === 'TERMINADO') {
        const importe = idx !== -1 ? local[idx].importe : 0;
        await supabase.from('facturacion').insert([{
          viaje_id: viajeId, importe, estado: 'PENDIENTE', created_at: new Date().toISOString()
        }]);
      }
    } catch { /* supabase not available */ }

    if (idx !== -1) {
      local[idx] = { ...local[idx], estado: estadoNuevo, updated_at: new Date().toISOString() };
      saveLocalViajes(local);
      return local[idx];
    }
    throw new Error('Viaje no encontrado');
  },

  /** Historial de estados de un viaje */
  async getHistorialByViajeId(viajeId: string): Promise<HistorialEstado[]> {
    try {
      const { data } = await supabase.from('historial_estados').select('*, usuario:profiles(*)').eq('viaje_id', viajeId).order('created_at');
      if (data && data.length > 0) return data;
    } catch { /* fallback */ }
    return getLocalHistorial().filter(h => h.viaje_id === viajeId);
  },

  /** Registros de facturación */
  async getFacturacion(): Promise<Facturacion[]> {
    try {
      const { data } = await supabase.from('facturacion').select('*, viaje:viajes(*), usuario_pago:profiles(*)').order('created_at', { ascending: false });
      if (data && data.length > 0) return data;
    } catch { /* fallback */ }
    const facturas: Facturacion[] = JSON.parse(localStorage.getItem('gruas_demo_facturacion') || '[]');
    const viajes = getLocalViajes();
    return facturas.map(f => ({ ...f, viaje: viajes.find(v => v.id === f.viaje_id) }));
  },

  /** Marcar factura pagada */
  async marcarFacturaPagada(facturaId: string, usuarioId: string, viajeId?: string): Promise<void> {
    // Local
    const facturas: Facturacion[] = JSON.parse(localStorage.getItem('gruas_demo_facturacion') || '[]');
    const idx = facturas.findIndex(f => f.id === facturaId || f.viaje_id === viajeId);
    if (idx !== -1) {
      facturas[idx] = { ...facturas[idx], estado: 'PAGADO', fecha_pago: new Date().toISOString(), usuario_pago_id: usuarioId };
      localStorage.setItem('gruas_demo_facturacion', JSON.stringify(facturas));
    }
    if (viajeId) await this.updateEstadoViaje(viajeId, 'PAGADO', usuarioId, 'Factura abonada');
    try {
      await supabase.from('facturacion').update({ estado: 'PAGADO', fecha_pago: new Date().toISOString(), usuario_pago_id: usuarioId }).eq('id', facturaId);
    } catch { /* fallback */ }
  },
};
