import { APP_CONFIG } from '../config/appConfig';

export interface ScheduleItinerary {
  horaSalida: string;
  horaFinalEstimada: string;
  duracionMinutos: number;
  exceedsMaxTime: boolean;
  paradas: {
    viajeId: string;
    horaEstimada: string;
  }[];
}

/**
 * Utility to add minutes to HH:MM format string
 */
export function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + minutes, 0, 0);
  const newH = String(date.getHours()).padStart(2, '0');
  const newM = String(date.getMinutes()).padStart(2, '0');
  return `${newH}:${newM}`;
}

/**
 * Converts HH:MM time string to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Calculates detailed itinerary schedule for a list of trips in order
 */
export function calculatePackageSchedule(
  viajes: { id: string; latitud: number; longitud: number; hora_recogida: string | null }[],
  startTime: string = APP_CONFIG.SCHEDULE.START,
  duracionTotalMinutos: number = 90
): ScheduleItinerary {
  let currentTime = startTime;
  const paradas: { viajeId: string; horaEstimada: string }[] = [];

  // Distribute pickup times along the route
  const timePerStop = Math.max(15, Math.floor(duracionTotalMinutos / Math.max(1, viajes.length)));

  for (let i = 0; i < viajes.length; i++) {
    const v = viajes[i];
    // If trip has a fixed pickup time, align schedule if reasonable
    if (v.hora_recogida && i === 0) {
      currentTime = v.hora_recogida.length === 5 ? v.hora_recogida : v.hora_recogida.substring(0, 5);
    } else {
      currentTime = addMinutesToTime(currentTime, timePerStop);
    }
    paradas.push({
      viajeId: v.id,
      horaEstimada: currentTime
    });
  }

  const horaFinal = addMinutesToTime(startTime, duracionTotalMinutos);
  const exceedsMaxTime = timeToMinutes(horaFinal) > timeToMinutes(APP_CONFIG.SCHEDULE.END);

  return {
    horaSalida: startTime,
    horaFinalEstimada: horaFinal,
    duracionMinutos: duracionTotalMinutos,
    exceedsMaxTime,
    paradas
  };
}
