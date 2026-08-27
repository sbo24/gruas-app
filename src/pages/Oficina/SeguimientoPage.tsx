import React, { useState, useEffect } from 'react';
import { viajesService } from '../../services/viajes.service';
import { paquetesService } from '../../services/paquetes.service';
import { Viaje, Paquete } from '../../types/domain';
import { Badge } from '../../components/common/Badge';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { Activity, RefreshCw, Search, Truck, Filter, Clock } from 'lucide-react';

export const SeguimientoPage: React.FC = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Filter States (preserved across auto-refreshes)
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    const vData = await viajesService.getViajesByFecha(todayStr);
    const pData = await paquetesService.getPaquetesByFecha(todayStr);
    setViajes(vData);
    setPaquetes(pData);
    setLastRefreshed(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [todayStr]);

  // Auto-refresh every 30 seconds silently (Requirement 18)
  useAutoRefresh(() => {
    fetchData();
  }, 30000);

  // Helper to map driver name from paquetes
  const getConductorForViaje = (viajeId: string): string => {
    for (const pkg of paquetes) {
      if (pkg.paquete_viajes?.some(pv => pv.viaje_id === viajeId)) {
        return pkg.conductor?.nombre || 'Por Asignar';
      }
    }
    return 'Sin Paquete';
  };

  // Helper to get estimated time
  const getHoraPrevistaForViaje = (viajeId: string): string => {
    for (const pkg of paquetes) {
      const pv = pkg.paquete_viajes?.find(p => p.viaje_id === viajeId);
      if (pv && pv.hora_estimada) return pv.hora_estimada;
    }
    return '--:--';
  };

  const filteredViajes = viajes.filter(v => {
    const matchesSearch =
      v.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.direccion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = estadoFilter === 'TODOS' || v.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-saas">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Seguimiento en Tiempo Real</h2>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Monitoreo en vivo de viajes activos y conductores | Actualización auto (30s)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 text-right">
            <span>Última sincro:</span>
            <div className="font-mono font-bold text-slate-700">{lastRefreshed.toLocaleTimeString()}</div>
          </div>
          <button
            onClick={fetchData}
            title="Refrescar ahora"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar (Preserved on Refresh) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-saas flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por matrícula, cliente, ciudad..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500">Estado:</span>
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PENDIENTE_MONTAR">PENDIENTE_MONTAR</option>
            <option value="EN_PAQUETE">EN_PAQUETE</option>
            <option value="ASIGNADO">ASIGNADO</option>
            <option value="EN_CAMINO">EN_CAMINO</option>
            <option value="CARGANDO">CARGANDO</option>
            <option value="EN_RUTA">EN_RUTA</option>
            <option value="TERMINADO">TERMINADO</option>
          </select>
        </div>
      </div>

      {/* Tracking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-saas overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando seguimiento...</div>
        ) : filteredViajes.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No hay viajes que coincidan con los filtros.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Conductor</th>
                  <th className="px-6 py-3.5">Matrícula</th>
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Dirección Recogida</th>
                  <th className="px-6 py-3.5">Estado Actual</th>
                  <th className="px-6 py-3.5">Hora Prevista</th>
                  <th className="px-6 py-3.5">Última Actualización</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredViajes.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {getConductorForViaje(v.id)}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{v.matricula}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{v.cliente}</td>
                    <td className="px-6 py-4">{v.direccion}</td>
                    <td className="px-6 py-4">
                      <Badge estado={v.estado} />
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                      {getHoraPrevistaForViaje(v.id)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {v.updated_at ? new Date(v.updated_at).toLocaleTimeString() : 'Reciente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
