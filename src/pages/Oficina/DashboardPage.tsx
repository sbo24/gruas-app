import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { viajesService } from '../../services/viajes.service';
import { paquetesService } from '../../services/paquetes.service';
import { Viaje, Paquete } from '../../types/domain';
import { Badge } from '../../components/common/Badge';
import {
  Package,
  PlusCircle,
  Activity,
  Receipt,
  Truck,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const vData = await viajesService.getViajesByFecha(todayStr);
      const pData = await paquetesService.getPaquetesByFecha(todayStr);
      setViajes(vData);
      setPaquetes(pData);
      setLoading(false);
    };
    loadData();
  }, [todayStr]);

  const pendientesCount = viajes.filter(v => v.estado === 'PENDIENTE_MONTAR').length;
  const enProcesoCount = viajes.filter(v => ['ASIGNADO', 'EN_CAMINO', 'EN_UBICACION', 'CARGANDO', 'CARGADO', 'EN_RUTA', 'EN_BASE', 'DESCARGANDO'].includes(v.estado)).length;
  const terminadosCount = viajes.filter(v => v.estado === 'TERMINADO' || v.estado === 'PAGADO').length;
  const totalFacturacion = viajes.reduce((sum, v) => sum + (v.importe || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-saas">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Panel de Control de Oficina</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Resumen diario de flota y asistencia | Base Torrejón de la Calzada
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/oficina/crear-viaje"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-blue-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            Crear Viaje
          </Link>
          <Link
            to="/oficina/montaje"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-emerald-600/20"
          >
            <Package className="w-4 h-4" />
            Montaje Diario
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-saas flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendientes Montar</span>
            <div className="text-3xl font-black text-amber-600 mt-1">{pendientesCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-saas flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Viajes En Ruta</span>
            <div className="text-3xl font-black text-cyan-600 mt-1">{enProcesoCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-saas flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Terminados Hoy</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">{terminadosCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-saas flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Est. Jornada</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{totalFacturacion.toFixed(2)} €</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Viajes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-saas overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Viajes Registrados para la Jornada</h3>
          <span className="text-xs text-slate-500 font-medium">{viajes.length} servicios totales</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Cargando viajes...</div>
        ) : viajes.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No hay viajes registrados hoy.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Matrícula</th>
                  <th className="px-6 py-3">Dirección</th>
                  <th className="px-6 py-3">Características</th>
                  <th className="px-6 py-3">Importe</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viajes.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{v.cliente}</td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{v.matricula}</td>
                    <td className="px-6 py-4">{v.direccion}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {v.doble && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-xs">
                            DOBLE
                          </span>
                        )}
                        {!v.rueda && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-xs">
                            NO RUEDA
                          </span>
                        )}
                        {v.hora_recogida && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-xs">
                            {v.hora_recogida}
                          </span>
                        )}
                        {!v.doble && v.rueda && !v.hora_recogida && (
                          <span className="text-slate-400 text-xs">Normal</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{v.importe} €</td>
                    <td className="px-6 py-4">
                      <Badge estado={v.estado} />
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
