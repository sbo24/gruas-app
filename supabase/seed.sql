-- SEED DATA FOR DEMO LOCAL GESTIÓN DE GRÚAS

-- Clean existing data
TRUNCATE TABLE public.facturacion CASCADE;
TRUNCATE TABLE public.historial_estados CASCADE;
TRUNCATE TABLE public.archivos CASCADE;
TRUNCATE TABLE public.paquete_viajes CASCADE;
TRUNCATE TABLE public.paquetes CASCADE;
TRUNCATE TABLE public.viajes CASCADE;
TRUNCATE TABLE public.gruas CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Insert auth.users for Supabase Auth local testing
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@gruas.demo', '$2a$10$wE99lX4Xj8b3RzMv0D9rjeM43qV56yVbA/.Yd81xO16t/O1fM5T9K', NOW(), '{"provider":"email","providers":["email"]}', '{"nombre":"Administrador Principal"}', NOW(), NOW(), 'authenticated', 'authenticated'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'oficina@gruas.demo', '$2a$10$wE99lX4Xj8b3RzMv0D9rjeM43qV56yVbA/.Yd81xO16t/O1fM5T9K', NOW(), '{"provider":"email","providers":["email"]}', '{"nombre":"Elena (Oficina Central)"}', NOW(), NOW(), 'authenticated', 'authenticated'),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'juan.conductor@gruas.demo', '$2a$10$wE99lX4Xj8b3RzMv0D9rjeM43qV56yVbA/.Yd81xO16t/O1fM5T9K', NOW(), '{"provider":"email","providers":["email"]}', '{"nombre":"Juan Pérez (Conductor)"}', NOW(), NOW(), 'authenticated', 'authenticated'),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'pedro.conductor@gruas.demo', '$2a$10$wE99lX4Xj8b3RzMv0D9rjeM43qV56yVbA/.Yd81xO16t/O1fM5T9K', NOW(), '{"provider":"email","providers":["email"]}', '{"nombre":"Pedro Gómez (Conductor)"}', NOW(), NOW(), 'authenticated', 'authenticated'),
  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'antonio.conductor@gruas.demo', '$2a$10$wE99lX4Xj8b3RzMv0D9rjeM43qV56yVbA/.Yd81xO16t/O1fM5T9K', NOW(), '{"provider":"email","providers":["email"]}', '{"nombre":"Antonio López (Conductor)"}', NOW(), NOW(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Insert PROFILES
INSERT INTO public.profiles (id, email, nombre, rol, activo) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@gruas.demo', 'Administrador Principal', 'ADMIN', true),
  ('a0000000-0000-0000-0000-000000000002', 'oficina@gruas.demo', 'Elena (Oficina Central)', 'OFICINA', true),
  ('a0000000-0000-0000-0000-000000000003', 'juan.conductor@gruas.demo', 'Juan Pérez', 'CONDUCTOR', true),
  ('a0000000-0000-0000-0000-000000000004', 'pedro.conductor@gruas.demo', 'Pedro Gómez', 'CONDUCTOR', true),
  ('a0000000-0000-0000-0000-000000000005', 'antonio.conductor@gruas.demo', 'Antonio López', 'CONDUCTOR', true);

-- Insert GRUAS (Capacidad 3 por defecto)
INSERT INTO public.gruas (id, nombre, matricula, capacidad, activa) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Grúa Grande 01', 'M-1234-XX', 3, true),
  ('b0000000-0000-0000-0000-000000000002', 'Grúa Plataforma 02', 'M-5678-YY', 3, true);

-- Insert VIAJES DE PRUEBA (Base: Torrejón de la Calzada lat 40.236, lng -3.796)
INSERT INTO public.viajes 
(id, cliente, matricula, telefono, fecha, hora_recogida, direccion, latitud, longitud, rueda, doble, tipo_calle, observaciones, importe, estado) 
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Aseguradora Mapfre', '1234-BBB', '600111222', CURRENT_DATE, '09:00', 'Calle Mayor 12, Alcorcón', 40.345, -3.824, true, false, 'Calle Ancha', 'Vehículo con avería eléctrica', 120.00, 'PENDIENTE_MONTAR'),
  ('c0000000-0000-0000-0000-000000000002', 'Mutua Madrileña', '5678-CCC', '600222333', CURRENT_DATE, NULL, 'Av. España 45, Fuenlabrada', 40.284, -3.794, true, false, 'Avenida', 'Fallo de motor', 95.00, 'PENDIENTE_MONTAR'),
  ('c0000000-0000-0000-0000-000000000003', 'Pelayo Seguros', '9012-DDD', '600333444', CURRENT_DATE, NULL, 'Plaza Pradillo 3, Móstoles', 40.322, -3.864, false, false, 'Peatonal', 'Sin rueda de repuesto ni dirección', 110.00, 'PENDIENTE_MONTAR'),
  ('c0000000-0000-0000-0000-000000000004', 'Allianz Direct', '3456-EEE', '600444555', CURRENT_DATE, '09:00', 'Calle Real 88, Illescas', 40.124, -3.846, true, true, 'Carretera', 'Furgón voluminoso DOBLE plaza', 180.00, 'PENDIENTE_MONTAR'),
  ('c0000000-0000-0000-0000-000000000005', 'Línea Directa', '7890-FFF', '600555666', CURRENT_DATE, NULL, 'Polígono Industrial 4, Yuncos', 40.086, -3.872, false, false, 'Industrial', 'Ruedas bloqueadas por accidente', 105.00, 'PENDIENTE_MONTAR'),
  ('c0000000-0000-0000-0000-000000000006', 'AXA Seguros', '2345-GGG', '600666777', CURRENT_DATE, NULL, 'Calle Toledo 15, Yuncler', 40.041, -3.904, false, false, 'Estrecha', 'Rueda reventada', 115.00, 'PENDIENTE_MONTAR'),
  ('c0000000-0000-0000-0000-000000000007', 'Generali Seguros', '6789-HHH', '600777888', CURRENT_DATE, NULL, 'Calle Pintor Sorolla 2, Parla', 40.237, -3.774, true, false, 'Calle Normal', 'Cambio de batería', 85.00, 'PENDIENTE_MONTAR'),
  ('c0000000-0000-0000-0000-000000000008', 'Reale Seguros', '0123-JJJ', '600888999', CURRENT_DATE, NULL, 'Av. de los Ángeles 100, Getafe', 40.308, -3.732, true, true, 'Avenida', 'Camión ligero DOBLE plaza', 160.00, 'PENDIENTE_MONTAR'),
  ('c0000000-0000-0000-0000-000000000009', 'Aseguradora Mapfre', '4567-KKK', '600999000', CURRENT_DATE, NULL, 'Calle Fuenlabrada 30, Leganés', 40.328, -3.765, true, false, 'Calle Normal', 'Salida de vía leve', 90.00, 'PENDIENTE_MONTAR'),
  ('c0000000-0000-0000-0000-000000000010', 'Asistencia Larga Distancia', '8901-LLL', '611222333', CURRENT_DATE, NULL, 'Av. Portugal 210, Talavera de la Reina', 39.963, -4.830, true, false, 'Carretera', 'Viaje Largo (> 130 km de base)', 350.00, 'PENDIENTE_MONTAR');
