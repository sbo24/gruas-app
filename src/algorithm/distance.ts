import { APP_CONFIG } from '../config/appConfig';

export interface Coordinates {
  latitud: number;
  longitud: number;
}

/**
 * Calculates Haversine distance in kilometers between two coordinates
 */
export function calculateHaversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = (coord2.latitud - coord1.latitud) * (Math.PI / 180);
  const dLon = (coord2.longitud - coord1.longitud) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitud * (Math.PI / 180)) *
      Math.cos(coord2.latitud * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Distance from company base (Torrejón de la Calzada)
 */
export function getDistanceFromBase(coord: Coordinates): number {
  return calculateHaversineDistance(
    { latitud: APP_CONFIG.BASE.latitude, longitud: APP_CONFIG.BASE.longitude },
    coord
  );
}

/**
 * Check if a trip is considered long distance (> 130 km)
 */
export function isLongDistanceTrip(coord: Coordinates): boolean {
  return getDistanceFromBase(coord) > APP_CONFIG.OPERATIONS.LONG_DISTANCE_KM;
}

/**
 * Estimated travel time in minutes based on distance (assuming ~60 km/h avg speed + 5 min traffic padding)
 */
export function estimateTravelTimeMinutes(distanceKm: number): number {
  if (distanceKm <= 0) return 5;
  const minutes = Math.round((distanceKm / 55) * 60) + 5;
  return minutes;
}
