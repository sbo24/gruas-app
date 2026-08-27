import React, { useState, useEffect } from 'react';
import { viajesService } from '../../services/viajes.service';
import { usuariosService } from '../../services/usuarios.service';
import { paquetesService } from '../../services/paquetes.service';
import { algorithmService } from '../../services/algorithm.service';
import { Viaje, Grua, Profile, Paquete } from '../../types/domain';
import { ProposedPackage } from '../../algorithm/optimizer';
import { validatePackageRules } from '../../algorithm/capacity';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Package,
  Truck,
  User,
  Zap,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  MoveRight,
  RefreshCw,
  Info
} from 'lucide-react';

export const MontajeDiarioPage: React.FC = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [viajesPendientes, setViajesPendientes] = useState<Viaje[]>([]);
  const [gruas, setGruas] = useState<Grua[]>([]);
  const [conductores, setConductores] = useState<Profile[]>([]);
  const [proposedPackages, setProposedPackages] = useState<ProposedPackage[]>([]);
  const [unassignedTrips, setUnassignedTrips] = useState<Viaje[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // Modal for adding a trip to package
  const [activePackageIndex, setActivePackageIndex] = useState<number | null>(null);
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [fecha]);

  const loadInitialData = async () => {
    setLoading(true);
    setConfirmSuccess(false);
    const allViajes = await viajesService.getViajesByFecha(fecha);
    const pendientes = allViajes.filter(v => v.estado === 'PENDIENTE_MONTAR' || v.estado === 'EN_PAQUETE');
    const gList = await usuariosService.getGruas();
    const cList = await usuariosService.getProfiles('CONDUCTOR');

    setViajesPendientes(pendientes);
    setGruas(gList);
    setConductores(cList);
    setUnassignedTrips(pendientes);
    setProposedPackages([]);
    setHasGenerated(false);
    setLoading(false);
  };

  // Run Optimizer Algorithm
  const handleGenerarPropuesta = () => {
    const result = algorithmService.generarPropuesta(viajesPendientes, gruas, conductores, fecha);
    setProposedPackages(result.paquetesPropuestos);
    setUnassignedTrips(result.viajesSinAsignar);
    setHasGenerated(true);
  };

  // Recalculate helper for manual modifications
  const updatePackageState = (updatedList: ProposedPackage[], newUnassigned: Viaje[]) => {
    // Re-evaluate each package
    const recalculated = updatedList.map(pkg => {
      const res = algorithmService.recalcularPaqueteManual(
        pkg.numero,
        pkg.viajes,
        pkg.grua_id,
        pkg.conductor_id,
        pkg.hora_salida
      );
      return res.paquete;
    });
    setProposedPackages(recalculated);
    setUnassignedTrips(newUnassigned);
  };

  // 1. Remove trip from package
  const handleRemoveTrip = (packageIndex: number, viajeId: string) => {
    const targetPkg = proposedPackages[packageIndex];
    const tripToRemove = targetPkg.viajes.find(v => v.id === viajeId);
    if (!tripToRemove) return;

    const newPkgViajes = targetPkg.viajes.filter(v => v.id !== viajeId);
    const newUnassigned = [...unassignedTrips, tripToRemove];

    const updatedPackages = [...proposedPackages];
    updatedPackages[packageIndex] = {
      ...targetPkg,
      viajes: newPkgViajes
    };

    updatePackageState(updatedPackages, newUnassigned);
  };

  // 2. Add trip to package
  const handleAddTripToPackage = (viajeId: string) => {
    if (activePackageIndex === null) return;
    const tripToAdd = unassignedTrips.find(v => v.id === viajeId);
    if (!tripToAdd) return;

    const targetPkg = proposedPackages[activePackageIndex];
    const newPkgViajes = [...targetPkg.viajes, tripToAdd];
    const newUnassigned = unassignedTrips.filter(v => v.id !== viajeId);

    const updatedPackages = [...proposedPackages];
    updatedPackages[activePackageIndex] = {
      ...targetPkg,
      viajes: newPkgViajes
    };

    updatePackageState(updatedPackages, newUnassigned);
    setIsAddTripModalOpen(false);
  };

  // 3. Move trip order inside package
  const handleMoveOrder = (packageIndex: number, tripIndex: number, direction: 'up' | 'down') => {
    const targetPkg = proposedPackages[packageIndex];
    const newViajes = [...targetPkg.viajes];
    const targetIdx = direction === 'up' ? tripIndex - 1 : tripIndex + 1;
    if (targetIdx < 0 || targetIdx >= newViajes.length) return;

    const temp = newViajes[tripIndex];
    newViajes[tripIndex] = newViajes[targetIdx];
    newViajes[targetIdx] = temp;

    const updatedPackages = [...proposedPackages];
    updatedPackages[packageIndex] = {
      ...targetPkg,
      viajes: newViajes
    };

    updatePackageState(updatedPackages, unassignedTrips);
  };

  // 4. Create new empty manual package
  const handleCreateManualPackage = () => {
    const nextNumber = proposedPackages.length + 1;
    const newPkg: ProposedPackage = {
      numero: nextNumber,
      grua_id: gruas[nextNumber % Math.max(1, gruas.length)]?.id || null,
      conductor_id: conductores[nextNumber % Math.max(1, conductores.length)]?.id || null,
      viajes: [],
      puntuacion: 0,
      kilometros: 0,
      duracion_minutos: 0,
      hora_salida: '08:15',
      hora_final_estimada: '09:00',
      motivos: []
    };
    setProposedPackages([...proposedPackages, newPkg]);
  };

  // 5. Delete package
  const handleDeletePackage = (packageIndex: number) => {
    const pkgToDelete = proposedPackages[packageIndex];
    const newUnassigned = [...unassignedTrips, ...pkgToDelete.viajes];
    const updated = proposedPackages.filter((_, idx) => idx !== packageIndex);
    updatePackageState(updated, newUnassigned);
  };

  // 6. Assign conductor to package
  const handleAssignConductor = (packageIndex: number, conductorId: string) => {
    const updated = [...proposedPackages];
    updated[packageIndex].conductor_id = conductorId || null;
    setProposedPackages(updated);
  };

  // Confirm and save packages to Supabase
  const handleConfirmPackages = async () => {
    setLoading(true);
    const domainPackages: Paquete[] = proposedPackages.map(pkg => ({
      id: crypto.randomUUID(),
      fecha,
      grua_id: pkg.grua_id,
      conductor_id: pkg.conductor_id,
      numero: pkg.numero,
      hora_salida: pkg.hora_salida,
      hora_final_estimada: pkg.hora_final_estimada,
      kilometros: pkg.kilometros,
      duracion_minutos: pkg.duracion_minutos,
      puntuacion: pkg.puntuacion,
      estado: 'CONFIRMADO',
      paquete_viajes: pkg.viajes.map((v, idx) => ({
        id: crypto.randomUUID(),
        paquete_id: '',
        viaje_id: v.id,
        orden: idx + 1,
        hora_estimada: pkg.hora_salida,
        hora_real: null
      }))
    }));

    await paquetesService.savePropuestas(domainPackages);
    setLoading(false);
    setConfirmSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-saas space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Montaje Diario de Paquetes</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Optimización automática e interactiva de rutas y grúas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
            />
            <button
              onClick={handleGenerarPropuesta}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30"
            >
              <Zap className="w-4 h-4 fill-current text-amber-300" />
              GENERAR PROPUESTA AUTOMÁTICA
            </button>
          </div>
        </div>

        {/* Resources Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600" />
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400">Grúas Disponibles</span>
              <div className="text-sm font-black text-slate-900">{gruas.length} unidades</div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <User className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400">Conductores</span>
              <div className="text-sm font-black text-slate-900">{conductores.length} activos</div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <Package className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400">Viajes Pendientes</span>
              <div className="text-sm font-black text-amber-600">{unassignedTrips.length} servicios</div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400">Paquetes Creados</span>
              <div className="text-sm font-black text-purple-600">{proposedPackages.length} paquetes</div>
            </div>
          </div>
        </div>
      </div>

      {confirmSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-sm">¡Paquetes confirmados y asignados con éxito!</div>
            <div className="text-xs text-emerald-700">Los conductores verán únicamente sus viajes en su aplicación móvil.</div>
          </div>
        </div>
      )}

      {/* Main Grid: Packages Column & Unassigned Trips Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposed Packages Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Paquetes Agrupados Propuestos
            </h3>

            {hasGenerated && (
              <button
                onClick={handleCreateManualPackage}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Paquete Manual
              </button>
            )}
          </div>

          {!hasGenerated ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">Haz clic en "GENERAR PROPUESTA AUTOMÁTICA"</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                El algoritmo clasificará los viajes (hora fija, viajes largos &gt; 130 km), aplicará la regla estricta NO RUEDA, calculará la mejor combinación de plazas (máx 3) y generará el plan optimizado.
              </p>
            </div>
          ) : proposedPackages.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              No se han podido agrupar paquetes automáticamente.
            </div>
          ) : (
            <div className="space-y-6">
              {proposedPackages.map((pkg, pIdx) => {
                const validation = validatePackageRules(pkg.viajes);
                const gruaObj = gruas.find(g => g.id === pkg.grua_id);

                return (
                  <div
                    key={pIdx}
                    className={`bg-white rounded-2xl border ${
                      !validation.valid ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    } shadow-saas overflow-hidden transition-all`}
                  >
                    {/* Package Card Header */}
                    <div className="p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-base">
                          #{pkg.numero}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base">{gruaObj ? gruaObj.nombre : `Grúa ${pIdx + 1}`}</span>
                            <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 font-mono rounded">
                              {gruaObj ? gruaObj.matricula : 'M-1234-XX'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Salida: <span className="text-slate-200 font-semibold">{pkg.hora_salida}</span> | Final Est: <span className="text-slate-200 font-semibold">{pkg.hora_final_estimada}</span>
                          </div>
                        </div>
                      </div>

                      {/* Package Metrics & Score Badge */}
                      <div className="flex items-center gap-4">
                        <div className="text-right text-xs">
                          <div className="font-bold text-slate-200">{pkg.kilometros} km | {pkg.duracion_minutos} min</div>
                          <div className="text-slate-400">{pkg.viajes.length} vehículos</div>
                        </div>

                        <div className="flex flex-col items-center justify-center px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Puntuación</span>
                          <span className={`text-base font-black ${pkg.puntuacion >= 80 ? 'text-emerald-400' : pkg.puntuacion >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {pkg.puntuacion}/100
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeletePackage(pIdx)}
                          title="Eliminar paquete"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Invalid Rule Warning Banner */}
                    {!validation.valid && (
                      <div className="p-3 bg-rose-500 text-white text-xs font-bold flex items-center gap-2 px-5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{validation.reason}</span>
                      </div>
                    )}

                    {/* Scoring Breakdown Reasons (Prompt Requirement 12) */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                        MOTIVOS DE LA PUNTUACIÓN
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        {pkg.motivos.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className={`flex items-center gap-1.5 font-medium ${
                              m.type === 'positive'
                                ? 'text-emerald-700'
                                : m.type === 'warning'
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            <span>{m.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Package Trips List */}
                    <div className="p-5 space-y-3">
                      {pkg.viajes.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                          Paquete vacío. Añade viajes desde la lista lateral.
                        </div>
                      ) : (
                        pkg.viajes.map((v, vIdx) => (
                          <div
                            key={v.id}
                            className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                                {vIdx + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-slate-900">{v.direccion}</span>
                                  <span className="font-mono text-xs font-bold text-blue-600">{v.matricula}</span>
                                </div>
                                <div className="text-xs text-slate-500 font-medium">
                                  {v.cliente} | Tlf: {v.telefono}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {v.doble && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                                  DOBLE (2 plazas)
                                </span>
                              )}
                              {!v.rueda && (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                                  NO RUEDA
                                </span>
                              )}
                              {v.hora_recogida && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded">
                                  {v.hora_recogida}
                                </span>
                              )}

                              {/* Action controls for trip inside package */}
                              <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                                <button
                                  onClick={() => handleMoveOrder(pIdx, vIdx, 'up')}
                                  disabled={vIdx === 0}
                                  title="Mover arriba"
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveOrder(pIdx, vIdx, 'down')}
                                  disabled={vIdx === pkg.viajes.length - 1}
                                  title="Mover abajo"
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveTrip(pIdx, v.id)}
                                  title="Quitar del paquete"
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Driver Selector Footer (Requirement 14) */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-700">Conductor Asignado:</span>
                        <select
                          value={pkg.conductor_id || ''}
                          onChange={(e) => handleAssignConductor(pIdx, e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                        >
                          <option value="">-- Seleccionar Conductor --</option>
                          {conductores.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          setActivePackageIndex(pIdx);
                          setIsAddTripModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir Viaje al Paquete
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleConfirmPackages}
                  disabled={loading || proposedPackages.some(p => !validatePackageRules(p.viajes).valid)}
                  className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-2xl transition-all shadow-xl shadow-emerald-600/30 disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  CONFIRMAR Y ASIGNAR PAQUETES A CONDUCTORES
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Unassigned / Pending Trips Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-saas space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Viajes Pendientes</span>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                {unassignedTrips.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Viajes de la jornada no asignados aún a un paquete
            </p>

            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
              {unassignedTrips.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Todos los viajes están agrupados.
                </div>
              ) : (
                unassignedTrips.map(v => (
                  <div
                    key={v.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600">{v.matricula}</span>
                      <Badge estado={v.estado} size="sm" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">{v.direccion}</div>
                    <div className="text-[11px] text-slate-500">{v.cliente}</div>
                    <div className="flex items-center gap-1 pt-1">
                      {v.doble && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">DOBLE</span>}
                      {!v.rueda && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">NO RUEDA</span>}
                      {v.hora_recogida && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-[9px] font-bold rounded">{v.hora_recogida}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Trip Modal */}
      <Modal
        isOpen={isAddTripModalOpen}
        onClose={() => setIsAddTripModalOpen(false)}
        title={`Añadir Viaje al Paquete #${(activePackageIndex ?? 0) + 1}`}
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Selecciona uno de los viajes pendientes para incluirlo en este paquete:</p>
          {unassignedTrips.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">No hay viajes pendientes disponibles.</div>
          ) : (
            unassignedTrips.map(v => (
              <div
                key={v.id}
                onClick={() => handleAddTripToPackage(v.id)}
                className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">{v.direccion}</div>
                  <div className="text-xs text-slate-500">{v.cliente} | Matrícula: <span className="font-mono text-blue-600 font-bold">{v.matricula}</span></div>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg">
                  Añadir
                </button>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
