import { Viaje, Paquete, PaqueteViaje, Profile, Grua, HistorialEstado, Facturacion } from '../types/domain';

const TODAY = new Date().toISOString().split('T')[0];

// Fixed UUIDs para que siempre sean consistentes
const IDS = {
  // Profiles
  ADMIN:    'a0000000-0000-0000-0000-000000000001',
  OFICINA:  'a0000000-0000-0000-0000-000000000002',
  JUAN:     'a0000000-0000-0000-0000-000000000003',
  PEDRO:    'a0000000-0000-0000-0000-000000000004',
  ANTONIO:  'a0000000-0000-0000-0000-000000000005',
  // Gruas
  GRUA1:    'b0000000-0000-0000-0000-000000000001',
  GRUA2:    'b0000000-0000-0000-0000-000000000002',
  // Viajes
  V1:  'c0000000-0000-0000-0000-000000000001',
  V2:  'c0000000-0000-0000-0000-000000000002',
  V3:  'c0000000-0000-0000-0000-000000000003',
  V4:  'c0000000-0000-0000-0000-000000000004',
  V5:  'c0000000-0000-0000-0000-000000000005',
  V6:  'c0000000-0000-0000-0000-000000000006',
  V7:  'c0000000-0000-0000-0000-000000000007',
  V8:  'c0000000-0000-0000-0000-000000000008',
  V9:  'c0000000-0000-0000-0000-000000000009',
  V10: 'c0000000-0000-0000-0000-000000000010',
  // Paquetes
  PKG1: 'd0000000-0000-0000-0000-000000000001',
  PKG2: 'd0000000-0000-0000-0000-000000000002',
  PKG3: 'd0000000-0000-0000-0000-000000000003',
  PKG4: 'd0000000-0000-0000-0000-000000000004',
};

// ─── PERFILES ─────────────────────────────────────────────────────────────────
export const SEED_PROFILES: Profile[] = [
  { id: IDS.ADMIN,   email: 'admin@gruas.demo',           nombre: 'Administrador Principal',    rol: 'ADMIN',     activo: true },
  { id: IDS.OFICINA, email: 'oficina@gruas.demo',          nombre: 'Elena (Oficina Central)',    rol: 'OFICINA',   activo: true },
  { id: IDS.JUAN,    email: 'juan.conductor@gruas.demo',   nombre: 'Juan Pérez',                rol: 'CONDUCTOR', activo: true },
  { id: IDS.PEDRO,   email: 'pedro.conductor@gruas.demo',  nombre: 'Pedro Gómez',               rol: 'CONDUCTOR', activo: true },
  { id: IDS.ANTONIO, email: 'antonio.conductor@gruas.demo',nombre: 'Antonio López',             rol: 'CONDUCTOR', activo: true },
];

// ─── GRÚAS ────────────────────────────────────────────────────────────────────
export const SEED_GRUAS: Grua[] = [
  { id: IDS.GRUA1, nombre: 'Grúa Grande 01',     matricula: 'M-1234-XX', capacidad: 3, activa: true },
  { id: IDS.GRUA2, nombre: 'Grúa Plataforma 02', matricula: 'M-5678-YY', capacidad: 3, activa: true },
];

// ─── VIAJES ───────────────────────────────────────────────────────────────────
// Base: Torrejón de la Calzada lat:40.236, lng:-3.796
export const SEED_VIAJES: Viaje[] = [
  {
    id: IDS.V1,
    cliente: 'Aseguradora Mapfre',
    matricula: '1234-BBB',
    telefono: '600 111 222',
    fecha: TODAY,
    hora_recogida: '09:00',
    direccion: 'Calle Mayor 12, Alcorcón, Madrid',
    latitud: 40.3454,
    longitud: -3.8243,
    rueda: true,
    doble: false,
    tipo_calle: 'Calle Normal',
    observaciones: 'Vehículo con avería eléctrica. Cliente espera en el garaje comunitario.',
    importe: 120,
    estado: 'PENDIENTE_MONTAR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: IDS.V2,
    cliente: 'Mutua Madrileña',
    matricula: '5678-CCC',
    telefono: '600 222 333',
    fecha: TODAY,
    hora_recogida: null,
    direccion: 'Av. de España 45, Fuenlabrada, Madrid',
    latitud: 40.2840,
    longitud: -3.7940,
    rueda: true,
    doble: false,
    tipo_calle: 'Avenida',
    observaciones: 'Fallo de motor en semáforo. Acceso fácil.',
    importe: 95,
    estado: 'PENDIENTE_MONTAR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: IDS.V3,
    cliente: 'Pelayo Seguros',
    matricula: '9012-DDD',
    telefono: '600 333 444',
    fecha: TODAY,
    hora_recogida: null,
    direccion: 'Plaza del Pradillo 3, Móstoles, Madrid',
    latitud: 40.3222,
    longitud: -3.8638,
    rueda: false,
    doble: false,
    tipo_calle: 'Peatonal',
    observaciones: 'Sin rueda de repuesto. Dirección bloqueada. Zona peatonal estrecha.',
    importe: 110,
    estado: 'PENDIENTE_MONTAR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: IDS.V4,
    cliente: 'Allianz Direct',
    matricula: '3456-EEE',
    telefono: '600 444 555',
    fecha: TODAY,
    hora_recogida: '09:00',
    direccion: 'Calle Real 88, Illescas, Toledo',
    latitud: 40.1237,
    longitud: -3.8460,
    rueda: true,
    doble: true,
    tipo_calle: 'Carretera',
    observaciones: 'Furgón Sprinter de reparto. VEHÍCULO DOBLE (2 plazas). Cita fija 9h.',
    importe: 180,
    estado: 'PENDIENTE_MONTAR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: IDS.V5,
    cliente: 'Línea Directa',
    matricula: '7890-FFF',
    telefono: '600 555 666',
    fecha: TODAY,
    hora_recogida: null,
    direccion: 'Polígono Industrial Yuncos, Yuncos, Toledo',
    latitud: 40.0855,
    longitud: -3.8723,
    rueda: false,
    doble: false,
    tipo_calle: 'Industrial',
    observaciones: 'Ruedas bloqueadas por accidente leve en rotonda.',
    importe: 105,
    estado: 'PENDIENTE_MONTAR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: IDS.V6,
    cliente: 'AXA Seguros',
    matricula: '2345-GGG',
    telefono: '600 666 777',
    fecha: TODAY,
    hora_recogida: null,
    direccion: 'Calle Toledo 15, Yuncler, Toledo',
    latitud: 40.0414,
    longitud: -3.9039,
    rueda: false,
    doble: false,
    tipo_calle: 'Estrecha',
    observaciones: 'Rueda reventada. Calle muy estrecha, grúa pequeña preferible.',
    importe: 115,
    estado: 'PENDIENTE_MONTAR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: IDS.V7,
    cliente: 'Generali Seguros',
    matricula: '6789-HHH',
    telefono: '600 777 888',
    fecha: TODAY,
    hora_recogida: null,
    direccion: 'Calle Pintor Sorolla 2, Parla, Madrid',
    latitud: 40.2373,
    longitud: -3.7741,
    rueda: true,
    doble: false,
    tipo_calle: 'Calle Normal',
    observaciones: 'Problema de batería. Vehículo en aparcamiento subterráneo P1.',
    importe: 85,
    estado: 'PENDIENTE_MONTAR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: IDS.V8,
    cliente: 'Reale Seguros',
    matricula: '0123-JJJ',
    telefono: '600 888 999',
    fecha: TODAY,
    hora_recogida: null,
    direccion: 'Av. de los Ángeles 100, Getafe, Madrid',
    latitud: 40.3076,
    longitud: -3.7324,
    rueda: true,
    doble: true,
    tipo_calle: 'Avenida',
    observaciones: 'Camioneta Transit. DOBLE PLAZA. Sin incidencia de acceso.',
    importe: 160,
    estado: 'PENDIENTE_MONTAR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: IDS.V9,
    cliente: 'Aseguradora Mapfre',
    matricula: '4567-KKK',
    telefono: '600 999 000',
    fecha: TODAY,
    hora_recogida: null,
    direccion: 'Calle Fuenlabrada 30, Leganés, Madrid',
    latitud: 40.3280,
    longitud: -3.7651,
    rueda: true,
    doble: false,
    tipo_calle: 'Calle Normal',
    observaciones: 'Salida de vía leve. Vehículo accesible.',
    importe: 90,
    estado: 'PENDIENTE_MONTAR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: IDS.V10,
    cliente: 'Asistencia Larga Distancia SL',
    matricula: '8901-LLL',
    telefono: '611 222 333',
    fecha: TODAY,
    hora_recogida: null,
    direccion: 'Av. de Portugal 210, Talavera de la Reina, Toledo',
    latitud: 39.9633,
    longitud: -4.8302,
    rueda: true,
    doble: false,
    tipo_calle: 'Carretera',
    observaciones: '⚠ VIAJE LARGO (>130 km desde base). Requiere gestión especial y parada de descanso.',
    importe: 350,
    estado: 'PENDIENTE_MONTAR',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ─── PAQUETES PRECONFIRMADOS (para la vista de conductor) ─────────────────────
// Paquete 1: Juan conduce GRUA1 → Alcorcón + Fuenlabrada + Móstoles (3 plazas: 1+1+1, uno tiene rueda✓)
// Paquete 2: Pedro conduce GRUA2 → Illescas (DOBLE) + Yuncos (2+1=3 plazas)
// Paquete 3: Juan conduce GRUA1 (tarde) → Parla + Getafe(DOBLE) (1+2=3 plazas)
// Paquete 4: Pedro conduce GRUA2 → Talavera (largo, individual)

export const SEED_PAQUETE_VIAJES_MAP: Record<string, string[]> = {
  [IDS.PKG1]: [IDS.V1, IDS.V2, IDS.V3],  // Alcorcón + Fuenlabrada + Móstoles
  [IDS.PKG2]: [IDS.V4, IDS.V5],           // Illescas(DOBLE) + Yuncos → 3 plazas
  [IDS.PKG3]: [IDS.V7, IDS.V8],           // Parla + Getafe(DOBLE) → 3 plazas
  [IDS.PKG4]: [IDS.V10],                   // Talavera (VIAJE LARGO, individual)
};

export const SEED_PAQUETES: Paquete[] = [
  {
    id: IDS.PKG1,
    fecha: TODAY,
    grua_id: IDS.GRUA1,
    conductor_id: IDS.JUAN,
    numero: 1,
    hora_salida: '08:15',
    hora_final_estimada: '12:30',
    kilometros: 72.4,
    duracion_minutos: 255,
    puntuacion: 92,
    estado: 'CONFIRMADO',
    created_at: new Date().toISOString(),
    grua: SEED_GRUAS[0],
    conductor: SEED_PROFILES[2],
    paquete_viajes: [
      { id: 'pv-001', paquete_id: IDS.PKG1, viaje_id: IDS.V1, orden: 1, hora_estimada: '09:00', hora_real: null, viaje: SEED_VIAJES[0] },
      { id: 'pv-002', paquete_id: IDS.PKG1, viaje_id: IDS.V2, orden: 2, hora_estimada: '10:00', hora_real: null, viaje: SEED_VIAJES[1] },
      { id: 'pv-003', paquete_id: IDS.PKG1, viaje_id: IDS.V3, orden: 3, hora_estimada: '11:15', hora_real: null, viaje: SEED_VIAJES[2] },
    ],
  },
  {
    id: IDS.PKG2,
    fecha: TODAY,
    grua_id: IDS.GRUA2,
    conductor_id: IDS.PEDRO,
    numero: 2,
    hora_salida: '08:15',
    hora_final_estimada: '12:00',
    kilometros: 55.8,
    duracion_minutos: 225,
    puntuacion: 85,
    estado: 'CONFIRMADO',
    created_at: new Date().toISOString(),
    grua: SEED_GRUAS[1],
    conductor: SEED_PROFILES[3],
    paquete_viajes: [
      { id: 'pv-004', paquete_id: IDS.PKG2, viaje_id: IDS.V4, orden: 1, hora_estimada: '09:00', hora_real: null, viaje: SEED_VIAJES[3] },
      { id: 'pv-005', paquete_id: IDS.PKG2, viaje_id: IDS.V5, orden: 2, hora_estimada: '10:30', hora_real: null, viaje: SEED_VIAJES[4] },
    ],
  },
  {
    id: IDS.PKG3,
    fecha: TODAY,
    grua_id: IDS.GRUA1,
    conductor_id: IDS.JUAN,
    numero: 3,
    hora_salida: '14:30',
    hora_final_estimada: '17:45',
    kilometros: 41.2,
    duracion_minutos: 195,
    puntuacion: 88,
    estado: 'CONFIRMADO',
    created_at: new Date().toISOString(),
    grua: SEED_GRUAS[0],
    conductor: SEED_PROFILES[2],
    paquete_viajes: [
      { id: 'pv-006', paquete_id: IDS.PKG3, viaje_id: IDS.V7, orden: 1, hora_estimada: '14:45', hora_real: null, viaje: SEED_VIAJES[6] },
      { id: 'pv-007', paquete_id: IDS.PKG3, viaje_id: IDS.V8, orden: 2, hora_estimada: '15:45', hora_real: null, viaje: SEED_VIAJES[7] },
    ],
  },
  {
    id: IDS.PKG4,
    fecha: TODAY,
    grua_id: IDS.GRUA2,
    conductor_id: IDS.PEDRO,
    numero: 4,
    hora_salida: '08:15',
    hora_final_estimada: '14:00',
    kilometros: 310.6,
    duracion_minutos: 345,
    puntuacion: 78,
    estado: 'CONFIRMADO',
    created_at: new Date().toISOString(),
    grua: SEED_GRUAS[1],
    conductor: SEED_PROFILES[3],
    paquete_viajes: [
      { id: 'pv-008', paquete_id: IDS.PKG4, viaje_id: IDS.V10, orden: 1, hora_estimada: '08:30', hora_real: null, viaje: SEED_VIAJES[9] },
    ],
  },
];

// Historial demo (para el expediente del viaje V1 ya terminado en un día anterior)
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const SEED_HISTORIAL: HistorialEstado[] = [
  { id: 'h-001', viaje_id: IDS.V1, usuario_id: IDS.JUAN, estado_anterior: null, estado_nuevo: 'ASIGNADO', observaciones: 'Asignado a Juan Pérez - Paquete 1', created_at: `${TODAY}T08:15:00Z` },
  { id: 'h-002', viaje_id: IDS.V1, usuario_id: IDS.JUAN, estado_anterior: 'ASIGNADO', estado_nuevo: 'EN_CAMINO', observaciones: 'Conductor salió de base', created_at: `${TODAY}T08:16:00Z` },
  { id: 'h-003', viaje_id: IDS.V1, usuario_id: IDS.JUAN, estado_anterior: 'EN_CAMINO', estado_nuevo: 'EN_UBICACION', observaciones: null, created_at: `${TODAY}T08:55:00Z` },
  { id: 'h-004', viaje_id: IDS.V1, usuario_id: IDS.JUAN, estado_anterior: 'EN_UBICACION', estado_nuevo: 'CARGANDO', observaciones: 'Iniciando carga del vehículo', created_at: `${TODAY}T09:02:00Z` },
];

// Facturación demo (V terminados de ayer)
export const SEED_FACTURACION: Facturacion[] = [];

// ─── BOOTSTRAP LOCAL ──────────────────────────────────────────────────────────
const SEED_VERSION_KEY = 'gruas_seed_version';
const SEED_VERSION     = 'v1.2'; // Bump this to force re-seed

export function bootstrapLocalData() {
  const currentVersion = localStorage.getItem(SEED_VERSION_KEY);
  if (currentVersion === SEED_VERSION) return; // Already seeded this version

  console.log('[Grúas Demo] Cargando datos de prueba en localStorage...');

  // Actualizar estado de algunos viajes para que la demo sea más interesante
  const viajesConEstados = SEED_VIAJES.map(v => {
    if (v.id === IDS.V1) return { ...v, estado: 'ASIGNADO' as const };
    if (v.id === IDS.V2) return { ...v, estado: 'ASIGNADO' as const };
    if (v.id === IDS.V3) return { ...v, estado: 'ASIGNADO' as const };
    if (v.id === IDS.V4) return { ...v, estado: 'EN_CAMINO' as const };
    if (v.id === IDS.V5) return { ...v, estado: 'ASIGNADO' as const };
    if (v.id === IDS.V7) return { ...v, estado: 'ASIGNADO' as const };
    if (v.id === IDS.V8) return { ...v, estado: 'ASIGNADO' as const };
    if (v.id === IDS.V10) return { ...v, estado: 'EN_RUTA' as const };
    return v;
  });

  localStorage.setItem('gruas_demo_viajes',    JSON.stringify(viajesConEstados));
  localStorage.setItem('gruas_demo_paquetes',  JSON.stringify(SEED_PAQUETES));
  localStorage.setItem('gruas_demo_historial', JSON.stringify(SEED_HISTORIAL));
  localStorage.setItem('gruas_demo_profiles',  JSON.stringify(SEED_PROFILES));
  localStorage.setItem('gruas_demo_gruas',     JSON.stringify(SEED_GRUAS));
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);

  console.log('[Grúas Demo] ✅ Datos de prueba cargados correctamente.');
}

/** Fuerza un reset completo del seed (para testing) */
export function resetLocalSeed() {
  localStorage.removeItem(SEED_VERSION_KEY);
  bootstrapLocalData();
}
