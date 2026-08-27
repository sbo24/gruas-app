-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('ADMIN', 'OFICINA', 'CONDUCTOR')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GRUAS TABLE
CREATE TABLE IF NOT EXISTS public.gruas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  matricula TEXT UNIQUE NOT NULL,
  capacidad INT DEFAULT 3,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIAJES TABLE
CREATE TABLE IF NOT EXISTS public.viajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente TEXT NOT NULL,
  matricula TEXT NOT NULL,
  telefono TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora_recogida TIME NULL,
  direccion TEXT NOT NULL,
  latitud DOUBLE PRECISION NOT NULL,
  longitud DOUBLE PRECISION NOT NULL,
  rueda BOOLEAN DEFAULT true,
  doble BOOLEAN DEFAULT false,
  tipo_calle TEXT,
  observaciones TEXT,
  importe NUMERIC(10,2) DEFAULT 0.00,
  estado TEXT NOT NULL DEFAULT 'PENDIENTE_MONTAR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAQUETES TABLE
CREATE TABLE IF NOT EXISTS public.paquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  grua_id UUID REFERENCES public.gruas(id) ON DELETE SET NULL,
  conductor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  numero INT NOT NULL,
  hora_salida TIME,
  hora_final_estimada TIME,
  kilometros NUMERIC(8,2),
  duracion_minutos INT,
  puntuacion INT,
  estado TEXT DEFAULT 'PROPUESTA' CHECK (estado IN ('PROPUESTA', 'CONFIRMADO', 'EN_PROCESO', 'FINALIZADO')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAQUETE_VIAJES TABLE
CREATE TABLE IF NOT EXISTS public.paquete_viajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paquete_id UUID REFERENCES public.paquetes(id) ON DELETE CASCADE,
  viaje_id UUID REFERENCES public.viajes(id) ON DELETE CASCADE,
  orden INT NOT NULL,
  hora_estimada TIME,
  hora_real TIME,
  CONSTRAINT unique_viaje_paquete UNIQUE (viaje_id)
);

-- ARCHIVOS TABLE
CREATE TABLE IF NOT EXISTS public.archivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id UUID REFERENCES public.viajes(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('FOTO_INICIAL', 'FOTO_MATRICULA', 'FOTO_BASTIDOR', 'DOCUMENTACION', 'FIRMA')),
  nombre TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HISTORIAL_ESTADOS TABLE
CREATE TABLE IF NOT EXISTS public.historial_estados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id UUID REFERENCES public.viajes(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  estado_anterior TEXT,
  estado_nuevo TEXT NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FACTURACION TABLE
CREATE TABLE IF NOT EXISTS public.facturacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id UUID REFERENCES public.viajes(id) ON DELETE CASCADE UNIQUE,
  importe NUMERIC(10,2) NOT NULL,
  estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'PAGADO')),
  fecha_pago TIMESTAMPTZ,
  usuario_pago_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS & POLICIES (ENABLE ALL FOR DEMO APP)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gruas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paquete_viajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write access to profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow public read access to gruas" ON public.gruas FOR SELECT USING (true);
CREATE POLICY "Allow public write access to gruas" ON public.gruas FOR ALL USING (true);

CREATE POLICY "Allow public read access to viajes" ON public.viajes FOR SELECT USING (true);
CREATE POLICY "Allow public write access to viajes" ON public.viajes FOR ALL USING (true);

CREATE POLICY "Allow public read access to paquetes" ON public.paquetes FOR SELECT USING (true);
CREATE POLICY "Allow public write access to paquetes" ON public.paquetes FOR ALL USING (true);

CREATE POLICY "Allow public read access to paquete_viajes" ON public.paquete_viajes FOR SELECT USING (true);
CREATE POLICY "Allow public write access to paquete_viajes" ON public.paquete_viajes FOR ALL USING (true);

CREATE POLICY "Allow public read access to archivos" ON public.archivos FOR SELECT USING (true);
CREATE POLICY "Allow public write access to archivos" ON public.archivos FOR ALL USING (true);

CREATE POLICY "Allow public read access to historial_estados" ON public.historial_estados FOR SELECT USING (true);
CREATE POLICY "Allow public write access to historial_estados" ON public.historial_estados FOR ALL USING (true);

CREATE POLICY "Allow public read access to facturacion" ON public.facturacion FOR SELECT USING (true);
CREATE POLICY "Allow public write access to facturacion" ON public.facturacion FOR ALL USING (true);

-- Automatic updated_at trigger for viajes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_viajes_updated_at BEFORE UPDATE ON public.viajes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
