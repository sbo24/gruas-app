import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paquetesService } from '../../services/paquetes.service';
import { viajesService } from '../../services/viajes.service';
import { Paquete, Viaje } from '../../types/domain';
import { Badge } from '../../components/common/Badge';
import { ViajeEstado } from '../../config/appConfig';
import {
  Truck,
  MapPin,
  Phone,
  ExternalLink,
  CheckCircle2,
  Navigation,
  Clock,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const STATE_FLOW: ViajeEstado[] = [
  'ASIGNADO',
  'EN_CAMINO',
  'EN_UBICACION',
  'CARGANDO',
  'CARGADO',
  'EN_RUTA',
  'EN_BASE',
  'DESCARGANDO',
  'TERMINADO'
];

export const ConductorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [selectedViaje, setSelectedViaje] = useState<Viaje | null>(null);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDriverData();
  }, [user]);

  const loadDriverData = async () => {
    if (!user) return;
    setLoading(true);
    const pData = await paquetesService.getPaquetesByConductor(user.id, todayStr);
    setPaquetes(pData);
    setLoading(false);
  };

  const handleAdvanceState = async (viaje: Viaje) => {
    const currentIdx = STATE_FLOW.indexOf(viaje.estado);
    if (currentIdx === -1 || currentIdx >= STATE_FLOW.length - 1) return;

    const nextState = STATE_FLOW[currentIdx + 1];
    const updated = await viajesService.updateEstadoViaje(viaje.id, nextState, user?.id, `Avanzado por conductor ${user?.nombre}`);

    setSelectedViaje(updated);
    loadDriverData();
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-12 font-sans">
      {/* Driver Header Mobile First */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold tracking-wider uppercase text-blue-400">JORNADA CONDUCTOR</div>
              <h2 className="text-lg font-black text-white leading-tight">
                BUENOS DÍAS, {user?.nombre.toUpperCase()}
              </h2>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {selectedViaje ? (
          /* TRIP DETAIL & STATE TRANSITION VIEW */
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 space-y-6 shadow-2xl animate-in fade-in">
            <button
              onClick={() => setSelectedViaje(null)}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
            >
              ← Volver a Mi Jornada
            </button>

            <div className="space-y-2 border-b border-slate-700 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-mono font-black text-blue-400">{selectedViaje.matricula}</span>
                <Badge estado={selectedViaje.estado} />
              </div>
              <h3 className="text-xl font-bold text-white">{selectedViaje.cliente}</h3>
            </div>

            {/* Trip Details Grid */}
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block">Dirección</span>
                  <span className="font-semibold text-white">{selectedViaje.direccion}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block">Teléfono</span>
                  <a href={`tel:${selectedViaje.telefono}`} className="font-bold text-emerald-400 text-base underline">
                    {selectedViaje.telefono}
                  </a>
                </div>
              </div>

              {selectedViaje.hora_recogida && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400 block">Hora Recogida Fija</span>
                    <span className="font-bold text-purple-300">{selectedViaje.hora_recogida}</span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-900/60 rounded-xl flex items-center gap-2 text-xs">
                {selectedViaje.doble && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded">DOBLE</span>}
                {!selectedViaje.rueda && <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded">NO RUEDA</span>}
                {selectedViaje.rueda && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">TIENE RUEDA</span>}
              </div>

              {selectedViaje.observaciones && (
                <div className="p-3 bg-slate-900/80 rounded-xl text-xs text-slate-300 border border-slate-700">
                  <span className="font-bold text-slate-400 block mb-1">Observaciones:</span>
                  {selectedViaje.observaciones}
                </div>
              )}
            </div>

            {/* Google Maps Button */}
            <button
              onClick={() => openGoogleMaps(selectedViaje.latitud, selectedViaje.longitud)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 text-base transition-colors"
            >
              <Navigation className="w-5 h-5 fill-current" />
              ABRIR EN GOOGLE MAPS
            </button>

            {/* Sequential State Workflow Action Button */}
            {selectedViaje.estado !== 'TERMINADO' ? (
              <div className="pt-4 border-t border-slate-700 space-y-2">
                <span className="block text-xs font-bold text-center uppercase tracking-wider text-slate-400">
                  Siguiente Cambio de Estado
                </span>
                <button
                  onClick={() => handleAdvanceState(selectedViaje)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/30 transition-all animate-pulse"
                >
                  <span>AVANZAR A: {STATE_FLOW[STATE_FLOW.indexOf(selectedViaje.estado) + 1]?.replace(/_/g, ' ')}</span>
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold text-center rounded-2xl flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                VIAJE TERMINADO CORRECTAMENTE
              </div>
            )}
          </div>
        ) : (
          /* DRIVER PACKAGES LIST VIEW */
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              MI JORNADA DE HOY
            </h3>

            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Cargando paquetes asignados...</div>
            ) : paquetes.length === 0 ? (
              <div className="p-8 bg-slate-800 rounded-3xl border border-slate-700 text-center space-y-2 text-slate-400">
                <Truck className="w-10 h-10 mx-auto text-slate-600" />
                <div className="font-bold text-white text-base">Sin paquetes asignados</div>
                <div className="text-xs">No tienes rutas confirmadas asignadas para hoy todavía.</div>
              </div>
            ) : (
              paquetes.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-slate-800 border border-slate-700 rounded-3xl p-5 space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                        #{pkg.numero}
                      </span>
                      <div>
                        <div className="font-bold text-white text-base">PAQUETE {pkg.numero}</div>
                        <div className="text-xs text-slate-400">{pkg.paquete_viajes?.length || 0} VEHÍCULOS | {pkg.kilometros || 0} KM</div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded-xl border border-blue-800">
                      {pkg.hora_salida || '09:00'}
                    </span>
                  </div>

                  {/* List of Trips in Package */}
                  <div className="space-y-2.5">
                    {pkg.paquete_viajes?.map((pv) => {
                      const v = pv.viaje;
                      if (!v) return null;
                      return (
                        <div
                          key={v.id}
                          onClick={() => setSelectedViaje(v)}
                          className="p-3.5 bg-slate-900 hover:bg-slate-950 border border-slate-700/80 rounded-2xl flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-blue-400">{v.matricula}</span>
                              <Badge estado={v.estado} size="sm" />
                            </div>
                            <div className="text-xs text-white font-bold mt-1">{v.direccion}</div>
                            <div className="text-[11px] text-slate-400">{v.cliente}</div>
                          </div>
                          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-md">
                            VER VIAJE
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};
