import { UserRole, ViajeEstado } from '../config/appConfig';

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  activo: boolean;
  created_at?: string;
}

export interface Grua {
  id: string;
  nombre: string;
  matricula: string;
  capacidad: number;
  activa: boolean;
  created_at?: string;
}

export interface Viaje {
  id: string;
  cliente: string;
  matricula: string;
  telefono: string;
  fecha: string;
  hora_recogida: string | null;
  direccion: string;
  latitud: number;
  longitud: number;
  rueda: boolean;
  doble: boolean;
  tipo_calle?: string | null;
  observaciones?: string | null;
  importe: number;
  estado: ViajeEstado;
  created_at?: string;
  updated_at?: string;
}

export interface PaqueteViaje {
  id: string;
  paquete_id: string;
  viaje_id: string;
  orden: number;
  hora_estimada: string | null;
  hora_real: string | null;
  viaje?: Viaje;
}

export type PaqueteEstado = 'PROPUESTA' | 'CONFIRMADO' | 'EN_PROCESO' | 'FINALIZADO';

export interface Paquete {
  id: string;
  fecha: string;
  grua_id: string | null;
  conductor_id: string | null;
  numero: number;
  hora_salida: string | null;
  hora_final_estimada: string | null;
  kilometros: number;
  duracion_minutos: number;
  puntuacion: number;
  estado: PaqueteEstado;
  created_at?: string;
  grua?: Grua;
  conductor?: Profile;
  paquete_viajes?: PaqueteViaje[];
  motivos?: ScoringReason[];
}

export interface ScoringReason {
  text: string;
  type: 'positive' | 'warning' | 'negative';
}

export interface Archivo {
  id: string;
  viaje_id: string;
  tipo: 'FOTO_INICIAL' | 'FOTO_MATRICULA' | 'FOTO_BASTIDOR' | 'DOCUMENTACION' | 'FIRMA';
  nombre: string;
  storage_path: string;
  created_at?: string;
}

export interface HistorialEstado {
  id: string;
  viaje_id: string;
  usuario_id: string | null;
  estado_anterior: string | null;
  estado_nuevo: string;
  observaciones?: string | null;
  created_at?: string;
  usuario?: Profile;
}

export interface Facturacion {
  id: string;
  viaje_id: string;
  importe: number;
  estado: 'PENDIENTE' | 'PAGADO';
  fecha_pago: string | null;
  usuario_pago_id: string | null;
  created_at?: string;
  viaje?: Viaje;
  usuario_pago?: Profile;
}
