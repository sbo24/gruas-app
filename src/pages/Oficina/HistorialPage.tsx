import React, { useState, useEffect } from 'react';
import { viajesService } from '../../services/viajes.service';
import { Viaje, HistorialEstado } from '../../types/domain';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { History, Search, Filter, Eye, Clock, User, Phone, MapPin, CheckCircle, FileText } from 'lucide-react';

export const HistorialPage: React.FC = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [fechaFilter, setFechaFilter] = useState('');

  // Selected trip for detail modal
  const [selectedViaje, setSelectedViaje] = useState<Viaje | null>(null);
  const [historialList, setHistorialList] = useState<HistorialEstado[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await viajesService.getAllViajes();
    setViajes(data);
    setLoading(false);
  };

  const handleOpenDetail = async (viaje: Viaje) => {
    setSelectedViaje(viaje);
    setLoadingHistorial(true);
    const hData = await viajesService.getHistorialByViajeId(viaje.id);
    setHistorialList(hData);
    setLoadingHistorial(false);
  };

  const filteredViajes = viajes.filter(v => {
    const matchesSearch =
      v.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.direccion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = estadoFilter === 'TODOS' || v.estado === estadoFilter;
    const matchesFecha = !fechaFilter || v.fecha === fechaFilter;

    return matchesSearch && matchesEstado && matchesFecha;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-saas">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Historial Global de Viajes</h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Registro histórico de servicios, auditoría de estados y expedientes completos
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-saas flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, matrícula..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Fecha:</span>
            <input
              type="date"
              value={fechaFilter}
              onChange={(e) => setFechaFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Estado:</span>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="PENDIENTE_MONTAR">PENDIENTE_MONTAR</option>
              <option value="EN_PAQUETE">EN_PAQUETE</option>
              <option value="ASIGNADO">ASIGNADO</option>
              <option value="EN_CAMINO">EN_CAMINO</option>
              <option value="EN_RUTA">EN_RUTA</option>
              <option value="TERMINADO">TERMINADO</option>
              <option value="PAGADO">PAGADO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Viajes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-saas overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando historial...</div>
        ) : filteredViajes.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No hay viajes que coincidan con la búsqueda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Fecha</th>
                  <th className="px-6 py-3.5">Matrícula</th>
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Dirección Recogida</th>
                  <th className="px-6 py-3.5">Importe</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredViajes.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{v.fecha}</td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{v.matricula}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{v.cliente}</td>
                    <td className="px-6 py-4">{v.direccion}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{v.importe} €</td>
                    <td className="px-6 py-4">
                      <Badge estado={v.estado} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors ml-auto"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Expediente
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expediente Modal */}
      {selectedViaje && (
        <Modal
          isOpen={!!selectedViaje}
          onClose={() => setSelectedViaje(null)}
          title={`Expediente de Viaje ${selectedViaje.matricula}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Header Data Card */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono text-2xl font-black text-blue-400">{selectedViaje.matricula}</span>
                  <div className="text-xs text-slate-400 font-semibold">{selectedViaje.cliente}</div>
                </div>
                <Badge estado={selectedViaje.estado} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold">Teléfono:</span>
                  <span className="text-white font-semibold">{selectedViaje.telefono}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Importe:</span>
                  <span className="text-white font-black text-sm">{selectedViaje.importe} €</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block font-bold">Dirección de Recogida:</span>
                  <span className="text-white font-semibold">{selectedViaje.direccion}</span>
                </div>
              </div>
            </div>

            {/* State Change Timeline (Requirement 20) */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Línea Temporal de Cambios de Estado
              </h4>

              {loadingHistorial ? (
                <div className="p-4 text-xs text-slate-400">Cargando línea temporal...</div>
              ) : historialList.length === 0 ? (
                <div className="p-4 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl text-center">
                  Estado actual registrado como {selectedViaje.estado}. Sin auditorías adicionales.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                  {historialList.map((h, idx) => (
                    <div key={h.id || idx} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white"></div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">
                            Cambio a <span className="text-blue-600 font-black">{h.estado_nuevo}</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {h.created_at ? new Date(h.created_at).toLocaleString() : 'Reciente'}
                          </span>
                        </div>
                        {h.observaciones && (
                          <p className="text-xs text-slate-600 italic">{h.observaciones}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Observaciones originales */}
            {selectedViaje.observaciones && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                <span className="font-bold block">Observaciones Iniciales:</span>
                <p>{selectedViaje.observaciones}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
