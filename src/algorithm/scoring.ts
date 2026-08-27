import { Viaje, ScoringReason } from '../types/domain';
import { calculateHaversineDistance, getDistanceFromBase } from './distance';
import { getTripCapacity } from './capacity';
import { APP_CONFIG } from '../config/appConfig';

export interface ScoreDetail {
  puntuacion: number;
  kilometros: number;
  duracionMinutos: number;
  motivos: ScoringReason[];
}

export function scorePackageCombination(viajes: Viaje[]): ScoreDetail {
  const motivos: ScoringReason[] = [];
  let score = 50; // Neutral base score

  if (viajes.length === 0) {
    return { puntuacion: 0, kilometros: 0, duracionMinutos: 0, motivos: [] };
  }

  // 1. Capacity Utilization Score (+40 max)
  const totalCapacity = viajes.reduce((sum, v) => sum + getTripCapacity(v), 0);
  if (totalCapacity === APP_CONFIG.OPERATIONS.TRUCK_CAPACITY) {
    score += 40;
    motivos.push({ text: '✓ Aprovecha el 100% de la capacidad (3/3 plazas)', type: 'positive' });
  } else if (totalCapacity === 2) {
    score += 25;
    motivos.push({ text: '✓ Buen aprovechamiento de capacidad (2/3 plazas)', type: 'positive' });
  } else {
    score += 10;
    motivos.push({ text: '⚠ Paquete de ocupación baja (1/3 plazas)', type: 'warning' });
  }

  // 2. Distance and Geographic Proximity
  // Route: Base -> Pickup 1 -> Pickup 2 ... -> Base
  let totalKm = 0;
  const baseCoord = { latitud: APP_CONFIG.BASE.latitude, longitud: APP_CONFIG.BASE.longitude };
  
  let currentCoord = baseCoord;
  let interPickupDistances = 0;

  for (let i = 0; i < viajes.length; i++) {
    const nextCoord = { latitud: viajes[i].latitud, longitud: viajes[i].longitud };
    const dist = calculateHaversineDistance(currentCoord, nextCoord);
    totalKm += dist;
    if (i > 0) {
      interPickupDistances += dist;
    }
    currentCoord = nextCoord;
  }
  // Return to base
  totalKm += calculateHaversineDistance(currentCoord, baseCoord);
  totalKm = Math.round(totalKm * 10) / 10;

  // Proximity bonus
  if (viajes.length > 1) {
    const avgInterDistance = interPickupDistances / (viajes.length - 1);
    if (avgInterDistance <= 12) {
      score += 20;
      motivos.push({ text: '✓ Recogidas cercanas entre sí', type: 'positive' });
    } else if (avgInterDistance > 25) {
      score -= 10;
      motivos.push({ text: `⚠ Añade ${Math.round(avgInterDistance)} km de desplazamiento adicional entre recogidas`, type: 'warning' });
    }
  }

  // 3. Fixed Time Compliance
  const hasFixedTime = viajes.some(v => v.hora_recogida !== null);
  if (hasFixedTime) {
    score += 15;
    motivos.push({ text: '✓ Respeta hora fija de recogida prioritaria', type: 'positive' });
  }

  // 4. Long Distance check
  const isLong = viajes.some(v => getDistanceFromBase({ latitud: v.latitud, longitud: v.longitud }) > APP_CONFIG.OPERATIONS.LONG_DISTANCE_KM);
  if (isLong) {
    if (viajes.length === 1) {
      score += 15;
      motivos.push({ text: '✓ Viaje Largo asignado a paquete individual directo', type: 'positive' });
    } else {
      score -= 15;
      motivos.push({ text: '⚠ Agrupa viaje largo con otros desplazamientos localizados', type: 'warning' });
    }
  }

  // Cap score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  // Estimate total operational duration (driving + loading 12m + unloading 12m)
  const drivingMinutes = Math.round((totalKm / 55) * 60);
  const loadingMinutes = viajes.length * APP_CONFIG.OPERATIONS.LOAD_MINUTES_PER_VEHICLE;
  const unloadingMinutes = APP_CONFIG.OPERATIONS.UNLOAD_MINUTES;
  const duracionMinutos = drivingMinutes + loadingMinutes + unloadingMinutes;

  return {
    puntuacion: finalScore,
    kilometros: totalKm,
    duracionMinutos,
    motivos
  };
}
