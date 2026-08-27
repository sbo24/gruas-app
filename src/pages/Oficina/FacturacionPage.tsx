import React, { useState, useEffect } from 'react';
import { viajesService } from '../../services/viajes.service';
import { Facturacion, Viaje } from '../../types/domain';
import { useAuth } from '../../context/AuthContext';
import { Receipt, CheckCircle, Clock, Check } from 'lucide-react';

export const FacturacionPage: React.FC = () => {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState<Facturacion[]>([]);
  const [viajesTerminados, setViajesTerminados] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const fData = await viajesService.getFacturacion();
    const allViajes = await viajesService.getAllViajes();
    const terminados = allViajes.filter(v => v.estado === 'TERMINADO' || v.estado === 'PAGADO');

    setFacturas(fData);
    setViajesTerminados(terminados);
    setLoading(false);
  };

  const handleMarcarComoPagado = async (facturaId: string, viajeId?: string) => {
    if (!user) return;
    await viajesService.marcarFacturaPagada(facturaId, user.id);
    if (viajeId) {
      await viajesService.updateEstadoViaje(viajeId, 'PAGADO', user.id, 'Factura abonada');
    }
    loadData();
  };

  const totalPendiente = viajesTerminados
    .filter(v => v.estado !== 'PAGADO')
    .reduce((sum, v) => sum + (v.importe || 0), 0);

  const totalCobrado = viajesTerminados
    .filter(v => v.estado === 'PAGADO')
    .reduce((sum, v) => sum + (v.importe || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-saas">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Facturación de Servicios</h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Gestión de cobros e importes de servicios finalizados
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-saas flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendiente de Cobro</span>
            <div className="text-3xl font-black text-orange-600 mt-1">{totalPendiente.toFixed(2)} €</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-saas flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cobrado / Pagado</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">{totalCobrado.toFixed(2)} €</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Facturación Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-saas overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Histórico de Servicios Finalizados</h3>
          <span className="text-xs text-slate-500 font-medium">{viajesTerminados.length} facturas totales</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando facturación...</div>
        ) : viajesTerminados.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No hay viajes terminados pendientes de facturación.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Matrícula</th>
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Fecha</th>
                  <th className="px-6 py-3.5">Importe</th>
                  <th className="px-6 py-3.5">Estado Cobro</th>
                  <th className="px-6 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viajesTerminados.map((v) => {
                  const fact = facturas.find(f => f.viaje_id === v.id);
                  const isPagado = v.estado === 'PAGADO' || (fact && fact.estado === 'PAGADO');

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">{v.matricula}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{v.cliente}</td>
                      <td className="px-6 py-4">{v.fecha}</td>
                      <td className="px-6 py-4 font-black text-slate-900">{v.importe} €</td>
                      <td className="px-6 py-4">
                        {isPagado ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                            PAGADO
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                            PENDIENTE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isPagado && (
                          <button
                            onClick={() => handleMarcarComoPagado(fact ? fact.id : crypto.randomUUID(), v.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs ml-auto transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            MARCAR COMO PAGADO
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
