import { runOptimizationAlgorithm, ProposedPackage, OptimizationResult } from '../algorithm/optimizer';
import { scorePackageCombination } from '../algorithm/scoring';
import { validatePackageRules, ValidationResult } from '../algorithm/capacity';
import { calculatePackageSchedule } from '../algorithm/schedule';
import { Viaje, Grua, Profile, Paquete } from '../types/domain';
import { APP_CONFIG } from '../config/appConfig';

export const algorithmService = {
  /**
   * Run full proposal optimization algorithm
   */
  generarPropuesta(
    viajesPendientes: Viaje[],
    gruasDisponibles: Grua[],
    conductoresDisponibles: Profile[],
    fechaStr: string
  ): OptimizationResult {
    return runOptimizationAlgorithm(viajesPendientes, gruasDisponibles, conductoresDisponibles, fechaStr);
  },

  /**
   * Recalculates metrics, schedule, score, and validations for a manually modified package
   */
  recalcularPaqueteManual(
    numero: number,
    viajes: Viaje[],
    gruaId: string | null,
    conductorId: string | null,
    horaSalida: string = APP_CONFIG.SCHEDULE.START
  ): { paquete: ProposedPackage; validation: ValidationResult } {
    const validation = validatePackageRules(viajes);
    const scoring = scorePackageCombination(viajes);

    const schedule = calculatePackageSchedule(
      viajes.map(v => ({ id: v.id, latitud: v.latitud, longitud: v.longitud, hora_recogida: v.hora_recogida })),
      horaSalida,
      scoring.duracionMinutos
    );

    const paquete: ProposedPackage = {
      numero,
      grua_id: gruaId,
      conductor_id: conductorId,
      viajes,
      puntuacion: validation.valid ? scoring.puntuacion : 0,
      kilometros: scoring.kilometros,
      duracion_minutos: scoring.duracionMinutos,
      hora_salida: schedule.horaSalida,
      hora_final_estimada: schedule.horaFinalEstimada,
      motivos: validation.valid 
        ? scoring.motivos 
        : [{ text: validation.reason || 'Regla de capacidad/plazas violada', type: 'negative' }]
    };

    return { paquete, validation };
  }
};
