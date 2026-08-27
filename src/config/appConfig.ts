export const APP_CONFIG = {
  BASE: {
    latitude: 40.236 as number,
    longitude: -3.796 as number,
    name: 'Torrejón de la Calzada'
  },

  SCHEDULE: {
    START: '08:15' as string,
    AFTERNOON_START: '14:30' as string,
    END: '18:00' as string,
    BREAK_MINUTES: 30 as number
  },

  OPERATIONS: {
    LOAD_MINUTES_PER_VEHICLE: 12 as number,
    UNLOAD_MINUTES: 12 as number,
    TRUCK_CAPACITY: 3 as number,
    LONG_DISTANCE_KM: 130 as number
  }
};

export type UserRole = 'ADMIN' | 'OFICINA' | 'CONDUCTOR';

export const VIAJE_ESTADOS = [
  'PENDIENTE_MONTAR',
  'EN_PAQUETE',
  'ASIGNADO',
  'EN_CAMINO',
  'EN_UBICACION',
  'CARGANDO',
  'CARGADO',
  'EN_RUTA',
  'EN_BASE',
  'DESCARGANDO',
  'TERMINADO',
  'INCIDENCIA',
  'FACTURADO',
  'PAGADO'
] as const;

export type ViajeEstado = typeof VIAJE_ESTADOS[number];
