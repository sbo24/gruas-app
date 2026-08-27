import { Viaje } from '../types/domain';
import { APP_CONFIG } from '../config/appConfig';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  totalCapacity: number;
}

/**
 * Calculates the capacity occupied by a single trip
 * Normal vehicle = 1 spot
 * DOBLE vehicle = 2 spots
 */
export function getTripCapacity(viaje: Viaje): number {
  return viaje.doble ? 2 : 1;
}

/**
 * Validates capacity and NO RUEDA rules for a set of trips in a package
 */
export function validatePackageRules(viajes: Viaje[]): ValidationResult {
  if (viajes.length === 0) {
    return { valid: true, totalCapacity: 0 };
  }

  // 1. Calculate Total Spots Occupied
  const totalCapacity = viajes.reduce((sum, v) => sum + getTripCapacity(v), 0);

  if (totalCapacity > APP_CONFIG.OPERATIONS.TRUCK_CAPACITY) {
    return {
      valid: false,
      reason: `Excede la capacidad máxima de la grúa (${totalCapacity}/${APP_CONFIG.OPERATIONS.TRUCK_CAPACITY} plazas occupied)`,
      totalCapacity
    };
  }

  // 2. NO RUEDA Rule: If exactly 3 individual vehicles (1 + 1 + 1)
  if (viajes.length === 3) {
    const allSingle = viajes.every(v => !v.doble);
    if (allSingle) {
      const hasWheel = viajes.some(v => v.rueda);
      if (!hasWheel) {
        return {
          valid: false,
          reason: 'Regla NO RUEDA: Paquete inválido porque los 3 vehículos carecen de rueda (al menos 1 debe tener rueda)',
          totalCapacity
        };
      }
    }
  }

  return { valid: true, totalCapacity };
}
