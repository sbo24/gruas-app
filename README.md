# Demo Local — Aplicación de Gestión de Grúas y Flotas de Auxilio

Esta es una **demo funcional local completa (MVP)** para la gestión de una empresa de grúas, auxilio en carretera y transporte de vehículos.

La aplicación permite simular y ejecutar en vivo el flujo completo desde la creación de viajes en oficina, optimización automática de rutas y paquetes con algoritmo heurístico, montaje diario interactivo, asignación de conductores, ejecución de jornada en interfaz móvil de conductor con cambio secuencial de estados, seguimiento en tiempo real y facturación/historial.

---

## 🚀 Requisitos Previos

- **Node.js**: v18+
- **npm**: v9+
- **Docker Desktop**: Necesario para ejecutar Supabase localmente.
- **Supabase CLI** (Opcional pero recomendado para gestión de BD): `npm i -g supabase`

---

## 🛠️ Guía de Instalación y Ejecución Paso a Paso

### 1. Clonar / Acceder al Proyecto
```bash
cd camiones
```

### 2. Instalar Dependencias Frontend
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Contenido por defecto en `.env`:
```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE1NzczOTQ0MDAsImV4cCI6MTk5Mjk3MDQwMH0.dummy_local_key
```

---

## 🗄️ Iniciar y Configurar Supabase Local

### 1. Iniciar Supabase Local
Asegúrate de que **Docker Desktop** esté iniciado y ejecuta:
```bash
npx supabase start
```
*Esto iniciará la base de datos PostgreSQL en `localhost:54322`, la API REST en `localhost:54321` y Supabase Studio en `http://localhost:54323`.*

### 2. Aplicar Migraciones y Cargar Datos de Prueba (Seed)
```bash
npx supabase db reset
```
*Este comando aplica automáticamente las migraciones en `supabase/migrations/` y los datos de prueba de `supabase/seed.sql`.*

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Accede en tu navegador a: **`http://localhost:5173`**

---

## 👤 Usuarios de Prueba y Credenciales Demo

Todas las cuentas demo utilizan la contraseña: **`demo1234`**

| Rol | Nombre | Email | Acceso a Rutas |
| :--- | :--- | :--- | :--- |
| **OFICINA** | Elena (Oficina Central) | `oficina@gruas.demo` | `/oficina` (Dashboard, Crear Viaje, Montaje, Seguimiento, Facturación, Historial) |
| **CONDUCTOR** | Juan Pérez | `juan.conductor@gruas.demo` | `/conductor` (Vista mobile-first de sus viajes asignados y cambio de estados) |
| **CONDUCTOR** | Pedro Gómez | `pedro.conductor@gruas.demo` | `/conductor` |
| **CONDUCTOR** | Antonio López | `antonio.conductor@gruas.demo` | `/conductor` |
| **ADMIN** | Administrador Principal | `admin@gruas.demo` | `/admin`, `/oficina`, `/conductor` |

*Nota: La cabecera superior de la app incluye selectores rápidos de 1-Click para alternar entre roles instantáneamente durante la evaluación demo.*

---

## 🧠 Algoritmo de Agrupación (Reglas y Lógica)

El algoritmo optimizador opera en 6 Fases (Fases A a F) situadas en `src/algorithm/`:

1. **Regla de Capacidad**: Máximo **3 plazas** por grúa.
   - Vehículo normal: 1 plaza.
   - Vehículo DOBLE (`doble = true`): 2 plazas.
2. **Regla NO RUEDA**: Si un paquete agrupa 3 vehículos individuales (1+1+1), **al menos uno DEBE tener `rueda = true`**. Si los 3 vehículos carecen de rueda (`rueda = false`), la combinación es estricta e incondicionalmente descartada.
3. **Prioridad de Horas Fijadas**: Viajes con `hora_recogida` definida tienen máxima prioridad de posicionamiento en la jornada.
4. **Viajes Largos (> 130 km)**: Evaluados mediante distancia Haversine desde la base en **Torrejón de la Calzada** (`lat: 40.236, lng: -3.796`). Se agrupan prioritariamente en paquetes individuales directos.
5. **Horario Operativo (08:15 a 18:00)**:
   - Inicio: 08:15.
   - Carga: 12 min / vehículo.
   - Descarga: 12 min / vehículo.
   - Pausa comida: 30 min antes del turno de tarde.
   - Límite máximo: 18:00 (Propuestas que excedan las 18:00 son descartadas).

---

## 🛑 Detener Supabase Local

Cuando desees detener los contenedores de Supabase:
```bash
npx supabase stop
```
