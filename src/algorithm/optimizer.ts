import { Viaje, Paquete, Grua, Profile, ScoringReason } from '../types/domain';
import { validatePackageRules } from './capacity';
import { scorePackageCombination } from './scoring';
import { calculatePackageSchedule } from './schedule';
import { isLongDistanceTrip } from './distance';
import { APP_CONFIG } from '../config/appConfig';

export interface ProposedPackage {
  numero: number;
  grua_id: string | null;
  conductor_id: string | null;
  viajes: Viaje[];
  puntuacion: number;
  kilometros: number;
  duracion_minutos: number;
  hora_salida: string;
  hora_final_estimada: string;
  motivos: ScoringReason[];
}

export interface OptimizationResult {
  paquetesPropuestos: ProposedPackage[];
  viajesSinAsignar: Viaje[];
  fecha: string;
}

/**
 * Main Algorithm Optimizer (Phases A through F)
 */
export function runOptimizationAlgorithm(
  viajesPendientes: Viaje[],
  gruasDisponibles: Grua[],
  conductoresDisponibles: Profile[],
  fechaStr: string
): OptimizationResult {
  if (viajesPendientes.length === 0) {
    return { paquetesPropuestos: [], viajesSinAsignar: [], fecha: fechaStr };
  }

  // --- FASE A: Clasificación de Viajes ---
  const viajesConHoraFija: Viaje[] = [];
  const viajesLargos: Viaje[] = [];
  const viajesNormales: Viaje[] = [];

  for (const v of viajesPendientes) {
    if (isLongDistanceTrip({ latitud: v.latitud, longitud: v.longitud })) {
      viajesLargos.push(v);
    } else if (v.hora_recogida !== null && v.hora_recogida !== '') {
      viajesConHoraFija.push(v);
    } else {
      viajesNormales.push(v);
    }
  }

  const poolViajes = [...viajesConHoraFija, ...viajesLargos, ...viajesNormales];
  const assignedViajeIds = new Set<string>();
  const proposedPackages: ProposedPackage[] = [];

  // Helper to generate candidate combinations of up to 3 trips
  const candidateCombinations: { viajes: Viaje[]; score: number; km: number; duracion: number; motivos: ScoringReason[] }[] = [];

  // --- FASE B & C: Combinaciones y Scoring ---
  // Single trips
  for (const v of poolViajes) {
    const subset = [v];
    const validation = validatePackageRules(subset);
    if (validation.valid) {
      const scoring = scorePackageCombination(subset);
      candidateCombinations.push({
        viajes: subset,
        score: scoring.puntuacion,
        km: scoring.kilometros,
        duracion: scoring.duracionMinutos,
        motivos: scoring.motivos
      });
    }
  }

  // Double combinations (2 trips)
  for (let i = 0; i < poolViajes.length; i++) {
    for (let j = i + 1; j < poolViajes.length; j++) {
      const subset = [poolViajes[i], poolViajes[j]];
      const validation = validatePackageRules(subset);
      if (validation.valid) {
        const scoring = scorePackageCombination(subset);
        candidateCombinations.push({
          viajes: subset,
          score: scoring.puntuacion,
          km: scoring.kilometros,
          duracion: scoring.duracionMinutos,
          motivos: scoring.motivos
        });
      }
    }
  }

  // Triple combinations (3 trips) - Validates NO RUEDA rule internally
  for (let i = 0; i < poolViajes.length; i++) {
    for (let j = i + 1; j < poolViajes.length; j++) {
      for (let k = j + 1; k < poolViajes.length; k++) {
        const subset = [poolViajes[i], poolViajes[j], poolViajes[k]];
        const validation = validatePackageRules(subset);
        if (validation.valid) {
          const scoring = scorePackageCombination(subset);
          candidateCombinations.push({
            viajes: subset,
            score: scoring.puntuacion,
            km: scoring.kilometros,
            duracion: scoring.duracionMinutos,
            motivos: scoring.motivos
          });
        }
      }
    }
  }

  // Sort candidate combinations by score descending, prioritizing combinations with more trips
  candidateCombinations.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.viajes.length - a.viajes.length;
  });

  // --- FASE D & E: Seleccionar Candidatos y Asignar a Paquetes ---
  let packageIndex = 1;
  let currentStartTime = APP_CONFIG.SCHEDULE.START;

  for (const combo of candidateCombinations) {
    // Check if any trip in combo is already assigned
    const alreadyAssigned = combo.viajes.some(v => assignedViajeIds.has(v.id));
    if (alreadyAssigned) continue;

    // Check scheduling (Phase F)
    const schedule = calculatePackageSchedule(
      combo.viajes.map(v => ({ id: v.id, latitud: v.latitud, longitud: v.longitud, hora_recogida: v.hora_recogida })),
      currentStartTime,
      combo.duracion
    );

    if (schedule.exceedsMaxTime) {
      // Skip if exceeds max time 18:00
      continue;
    }

    // Assign trips to package
    combo.viajes.forEach(v => assignedViajeIds.add(v.id));

    // Assign truck and driver if available
    const gruaAssigned = gruasDisponibles[(packageIndex - 1) % Math.max(1, gruasDisponibles.length)] || null;
    const conductorAssigned = conductoresDisponibles[(packageIndex - 1) % Math.max(1, conductoresDisponibles.length)] || null;

    proposedPackages.push({
      numero: packageIndex,
      grua_id: gruaAssigned ? gruaAssigned.id : null,
      conductor_id: conductorAssigned ? conductorAssigned.id : null,
      viajes: combo.viajes,
      puntuacion: combo.score,
      kilometros: combo.km,
      duracion_minutos: combo.duracion,
      hora_salida: schedule.horaSalida,
      hora_final_estimada: schedule.horaFinalEstimada,
      motivos: combo.motivos
    });

    packageIndex++;

    // Advance time for next package
    currentStartTime = schedule.horaFinalEstimada;
    if (currentStartTime < APP_CONFIG.SCHEDULE.AFTERNOON_START && currentStartTime > '13:00') {
      currentStartTime = APP_CONFIG.SCHEDULE.AFTERNOON_START;
    }
  }

  // Determine unassigned trips
  const viajesSinAsignar = poolViajes.filter(v => !assignedViajeIds.has(v.id));

  return {
    paquetesPropuestos: proposedPackages,
    viajesSinAsignar,
    fecha: fechaStr
  };
}
