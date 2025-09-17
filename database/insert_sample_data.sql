-- =====================================================
-- DATOS DE EJEMPLO PARA EL SISTEMA
-- Sistema de Gestión Ganadera - Gutierrez Hnos
-- =====================================================

-- =====================================================
-- CONFIGURACIONES INICIALES
-- =====================================================
INSERT INTO configuraciones (clave, valor, categoria, tipo, descripcion) VALUES
-- Configuración de empresa
('empresa.nombre', 'Gutierrez Hermanos S.A.S', 'empresa', 'string', 'Nombre de la empresa'),
('empresa.direccion', 'Finca La Esperanza, Vereda El Progreso, Montería, Córdoba', 'empresa', 'string', 'Dirección principal'),
('empresa.telefono', '+57 304 567-8901', 'empresa', 'string', 'Teléfono principal'),
('empresa.email', 'info@gutierrezhnos.com', 'empresa', 'string', 'Email de contacto'),
('empresa.cuit', '900.123.456-7', 'empresa', 'string', 'CUIT de la empresa'),
('empresa.descripcion', 'Empresa familiar dedicada a la cría y comercialización de ganado bovino de alta calidad en Córdoba, Colombia', 'empresa', 'string', 'Descripción de la empresa'),

-- Configuración del sistema
('sistema.version', '1.0.0', 'sistema', 'string', 'Versión actual del sistema'),
('sistema.moneda', 'COP', 'sistema', 'string', 'Moneda principal'),
('sistema.pais', 'Colombia', 'sistema', 'string', 'País de operación'),
('sistema.zona_horaria', 'America/Bogota', 'sistema', 'string', 'Zona horaria'),

-- Configuración de facturación
('facturacion.punto_venta_default', '1', 'facturacion', 'number', 'Punto de venta por defecto'),
('facturacion.iva_porcentaje', '19', 'facturacion', 'number', 'Porcentaje de IVA'),
('facturacion.vencimiento_dias', '30', 'facturacion', 'number', 'Días de vencimiento por defecto'),

-- Configuración de animales
('animales.peso_minimo', '200', 'animales', 'number', 'Peso mínimo para venta'),
('animales.edad_maxima', '8', 'animales', 'number', 'Edad máxima en años'),
('animales.vacunas_obligatorias', 'fiebre_aftosa, brucelosis', 'animales', 'string', 'Vacunas obligatorias');

-- =====================================================
-- USUARIOS DE PRUEBA
-- =====================================================
INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, telefono) VALUES
('admin@gutierrezhnos.com', '$2a$10$rQZ8K9vL2mN3pQ4rS5tU6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Juan Carlos', 'Gutierrez', 'administrador', '+57 304 123-4567'),
('operador@gutierrezhnos.com', '$2a$10$rQZ8K9vL2mN3pQ4rS5tU6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'María Elena', 'Rodriguez', 'operador', '+57 304 234-5678'),
('veterinario@gutierrezhnos.com', '$2a$10$rQZ8K9vL2mN3pQ4rS5tU6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5', 'Dr. Carlos', 'Mendoza', 'veterinario', '+57 304 345-6789');

-- =====================================================
-- PROVEEDORES
-- =====================================================
INSERT INTO proveedores (nombre, cuit, direccion, telefono, email, contacto) VALUES
('Finca San José', '900.111.222-3', 'Vereda La Esperanza, Montería, Córdoba', '+57 304 111-2222', 'contacto@fincasanjose.com', 'José María López'),
('Ganadería El Progreso', '900.222.333-4', 'Km 15 Vía Planeta Rica, Montería', '+57 304 222-3333', 'ventas@elprogreso.com', 'Ana María Torres'),
('Hacienda La Fortuna', '900.333.444-5', 'Corregimiento El Sabanal, Montería', '+57 304 333-4444', 'info@lafortuna.com', 'Roberto Carlos Silva'),
('Finca Los Laureles', '900.444.555-6', 'Vereda El Retiro, Montería', '+57 304 444-5555', 'gerencia@loslaureles.com', 'Carmen Rosa Herrera');

-- =====================================================
-- COMPRADORES
-- =====================================================
INSERT INTO compradores (nombre, cuit, direccion, telefono, email, contacto) VALUES
('Carnes Premium S.A.S', '900.555.666-7', 'Calle 25 # 15-30, Montería', '+57 304 555-6666', 'compras@carnespremium.com', 'Luis Fernando Gómez'),
('Distribuidora El Ganadero', '900.666.777-8', 'Carrera 8 # 20-45, Montería', '+57 304 666-7777', 'ventas@elganadero.com', 'Patricia Elena Ruiz'),
('Frigorífico Central', '900.777.888-9', 'Zona Industrial, Montería', '+57 304 777-8888', 'compras@frigorifico.com', 'Miguel Ángel Castro'),
('Exportadora Caribe', '900.888.999-0', 'Puerto de Coveñas, Sucre', '+57 304 888-9999', 'exportaciones@caribe.com', 'Isabel Cristina Vargas');

-- =====================================================
-- TRANSPORTADORES
-- =====================================================
INSERT INTO transportadores (nombre, cuit, direccion, telefono, email, contacto) VALUES
('Transportes Ganaderos del Norte', '900.999.000-1', 'Carrera 12 # 30-15, Montería', '+57 304 999-0000', 'info@transportesnorte.com', 'Alberto José Ramírez'),
('Logística Rural S.A.S', '900.000.111-2', 'Vía Cereté, Montería', '+57 304 000-1111', 'servicios@logisticarural.com', 'Sandra Milena Jiménez'),
('Fletes y Transportes', '900.111.222-3', 'Calle 18 # 25-40, Montería', '+57 304 111-2222', 'contacto@fletes.com', 'Jorge Luis Morales');

-- =====================================================
-- LOTES
-- =====================================================
INSERT INTO lotes (nombre, descripcion, ubicacion, capacidad_maxima, tipo_lote) VALUES
('Lote Principal', 'Lote principal para ganado adulto', 'Frente a la casa principal', 50, 'general'),
('Lote Maternidad', 'Lote especial para vacas preñadas y crías', 'Detrás del establo', 20, 'maternidad'),
('Lote Engorde', 'Lote para ganado en proceso de engorde', 'Lado derecho de la finca', 30, 'engorde'),
('Lote Cuarentena', 'Lote para animales nuevos o enfermos', 'Aislado al fondo', 10, 'cuarentena'),
('Lote Reproducción', 'Lote para toros reproductores', 'Cerca del corral de monta', 5, 'reproduccion');

-- =====================================================
-- ANIMALES
-- =====================================================
INSERT INTO animales (numero_identificacion, tipo_animal, raza, sexo, fecha_nacimiento, peso_nacimiento, peso_actual, estado_salud) VALUES
-- Toros reproductores
('T001', 'bovino', 'Brahman', 'macho', '2020-03-15', 35.5, 650.0, 'sano'),
('T002', 'bovino', 'Brahman', 'macho', '2019-08-22', 38.2, 720.0, 'sano'),
('T003', 'bovino', 'Angus', 'macho', '2020-01-10', 32.8, 680.0, 'sano'),

-- Vacas reproductoras
('V001', 'bovino', 'Brahman', 'hembra', '2018-05-20', 28.5, 480.0, 'sano'),
('V002', 'bovino', 'Brahman', 'hembra', '2019-02-14', 30.2, 520.0, 'sano'),
('V003', 'bovino', 'Angus', 'hembra', '2018-11-08', 29.8, 510.0, 'sano'),
('V004', 'bovino', 'Brahman', 'hembra', '2019-07-30', 31.1, 495.0, 'sano'),
('V005', 'bovino', 'Brahman', 'hembra', '2020-04-12', 27.9, 460.0, 'sano'),

-- Novillos para engorde
('N001', 'bovino', 'Brahman', 'macho', '2021-06-15', 32.0, 380.0, 'sano'),
('N002', 'bovino', 'Brahman', 'macho', '2021-08-20', 30.5, 350.0, 'sano'),
('N003', 'bovino', 'Angus', 'macho', '2021-04-10', 33.2, 420.0, 'sano'),
('N004', 'bovino', 'Brahman', 'macho', '2021-09-05', 29.8, 340.0, 'sano'),
('N005', 'bovino', 'Brahman', 'macho', '2021-07-18', 31.5, 365.0, 'sano'),

-- Novillas
('NV001', 'bovino', 'Brahman', 'hembra', '2021-03-22', 28.5, 320.0, 'sano'),
('NV002', 'bovino', 'Brahman', 'hembra', '2021-05-14', 29.2, 335.0, 'sano'),
('NV003', 'bovino', 'Angus', 'hembra', '2021-01-30', 30.8, 360.0, 'sano'),

-- Terneros
('TE001', 'bovino', 'Brahman', 'macho', '2023-02-15', 25.5, 85.0, 'sano'),
('TE002', 'bovino', 'Brahman', 'hembra', '2023-03-20', 24.8, 78.0, 'sano'),
('TE003', 'bovino', 'Angus', 'macho', '2023-01-10', 26.2, 92.0, 'sano'),
('TE004', 'bovino', 'Brahman', 'macho', '2023-04-05', 25.0, 80.0, 'sano'),
('TE005', 'bovino', 'Brahman', 'hembra', '2023-05-12', 24.5, 75.0, 'sano');

-- =====================================================
-- ASIGNACIONES DE ANIMALES A LOTES
-- =====================================================
INSERT INTO lote_animales (lote_id, animal_id) VALUES
-- Toros en lote de reproducción
((SELECT id FROM lotes WHERE nombre = 'Lote Reproducción'), (SELECT id FROM animales WHERE numero_identificacion = 'T001')),
((SELECT id FROM lotes WHERE nombre = 'Lote Reproducción'), (SELECT id FROM animales WHERE numero_identificacion = 'T002')),
((SELECT id FROM lotes WHERE nombre = 'Lote Reproducción'), (SELECT id FROM animales WHERE numero_identificacion = 'T003')),

-- Vacas en lote de maternidad
((SELECT id FROM lotes WHERE nombre = 'Lote Maternidad'), (SELECT id FROM animales WHERE numero_identificacion = 'V001')),
((SELECT id FROM lotes WHERE nombre = 'Lote Maternidad'), (SELECT id FROM animales WHERE numero_identificacion = 'V002')),
((SELECT id FROM lotes WHERE nombre = 'Lote Maternidad'), (SELECT id FROM animales WHERE numero_identificacion = 'V003')),
((SELECT id FROM lotes WHERE nombre = 'Lote Maternidad'), (SELECT id FROM animales WHERE numero_identificacion = 'V004')),
((SELECT id FROM lotes WHERE nombre = 'Lote Maternidad'), (SELECT id FROM animales WHERE numero_identificacion = 'V005')),

-- Novillos en lote de engorde
((SELECT id FROM lotes WHERE nombre = 'Lote Engorde'), (SELECT id FROM animales WHERE numero_identificacion = 'N001')),
((SELECT id FROM lotes WHERE nombre = 'Lote Engorde'), (SELECT id FROM animales WHERE numero_identificacion = 'N002')),
((SELECT id FROM lotes WHERE nombre = 'Lote Engorde'), (SELECT id FROM animales WHERE numero_identificacion = 'N003')),
((SELECT id FROM lotes WHERE nombre = 'Lote Engorde'), (SELECT id FROM animales WHERE numero_identificacion = 'N004')),
((SELECT id FROM lotes WHERE nombre = 'Lote Engorde'), (SELECT id FROM animales WHERE numero_identificacion = 'N005')),

-- Novillas en lote principal
((SELECT id FROM lotes WHERE nombre = 'Lote Principal'), (SELECT id FROM animales WHERE numero_identificacion = 'NV001')),
((SELECT id FROM lotes WHERE nombre = 'Lote Principal'), (SELECT id FROM animales WHERE numero_identificacion = 'NV002')),
((SELECT id FROM lotes WHERE nombre = 'Lote Principal'), (SELECT id FROM animales WHERE numero_identificacion = 'NV003')),

-- Terneros en lote principal
((SELECT id FROM lotes WHERE nombre = 'Lote Principal'), (SELECT id FROM animales WHERE numero_identificacion = 'TE001')),
((SELECT id FROM lotes WHERE nombre = 'Lote Principal'), (SELECT id FROM animales WHERE numero_identificacion = 'TE002')),
((SELECT id FROM lotes WHERE nombre = 'Lote Principal'), (SELECT id FROM animales WHERE numero_identificacion = 'TE003')),
((SELECT id FROM lotes WHERE nombre = 'Lote Principal'), (SELECT id FROM animales WHERE numero_identificacion = 'TE004')),
((SELECT id FROM lotes WHERE nombre = 'Lote Principal'), (SELECT id FROM animales WHERE numero_identificacion = 'TE005'));

-- =====================================================
-- COMPRAS DE EJEMPLO
-- =====================================================
INSERT INTO compras (numero_compra, proveedor_id, fecha, tipo, precio_total, cantidad_animales, observaciones, estado, created_by) VALUES
('COMP-2024-001', (SELECT id FROM proveedores WHERE nombre = 'Finca San José'), '2024-01-15', 'compra', 15000000, 3, 'Compra de toros reproductores Brahman', 'confirmada', (SELECT id FROM usuarios WHERE email = 'admin@gutierrezhnos.com')),
('COMP-2024-002', (SELECT id FROM proveedores WHERE nombre = 'Ganadería El Progreso'), '2024-02-20', 'compra', 12000000, 5, 'Compra de novillas para reproducción', 'confirmada', (SELECT id FROM usuarios WHERE email = 'operador@gutierrezhnos.com')),
('COMP-2024-003', (SELECT id FROM proveedores WHERE nombre = 'Hacienda La Fortuna'), '2024-03-10', 'compra', 8000000, 4, 'Compra de novillos para engorde', 'confirmada', (SELECT id FROM usuarios WHERE email = 'operador@gutierrezhnos.com'));

-- Detalles de compras
INSERT INTO detalle_compra (compra_id, animal_id, precio_unitario, peso, observaciones) VALUES
-- Compra 1 - Toros
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-001'), (SELECT id FROM animales WHERE numero_identificacion = 'T001'), 5000000, 650.0, 'Toro Brahman de 4 años'),
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-001'), (SELECT id FROM animales WHERE numero_identificacion = 'T002'), 5000000, 720.0, 'Toro Brahman de 5 años'),
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-001'), (SELECT id FROM animales WHERE numero_identificacion = 'T003'), 5000000, 680.0, 'Toro Angus de 4 años'),

-- Compra 2 - Novillas
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-002'), (SELECT id FROM animales WHERE numero_identificacion = 'V001'), 2400000, 480.0, 'Vaca Brahman de 6 años'),
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-002'), (SELECT id FROM animales WHERE numero_identificacion = 'V002'), 2400000, 520.0, 'Vaca Brahman de 5 años'),
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-002'), (SELECT id FROM animales WHERE numero_identificacion = 'V003'), 2400000, 510.0, 'Vaca Angus de 6 años'),
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-002'), (SELECT id FROM animales WHERE numero_identificacion = 'V004'), 2400000, 495.0, 'Vaca Brahman de 5 años'),
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-002'), (SELECT id FROM animales WHERE numero_identificacion = 'V005'), 2400000, 460.0, 'Vaca Brahman de 4 años'),

-- Compra 3 - Novillos
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-003'), (SELECT id FROM animales WHERE numero_identificacion = 'N001'), 2000000, 380.0, 'Novillo Brahman de 3 años'),
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-003'), (SELECT id FROM animales WHERE numero_identificacion = 'N002'), 2000000, 350.0, 'Novillo Brahman de 3 años'),
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-003'), (SELECT id FROM animales WHERE numero_identificacion = 'N003'), 2000000, 420.0, 'Novillo Angus de 3 años'),
((SELECT id FROM compras WHERE numero_compra = 'COMP-2024-003'), (SELECT id FROM animales WHERE numero_identificacion = 'N004'), 2000000, 340.0, 'Novillo Brahman de 3 años');

-- =====================================================
-- VENTAS DE EJEMPLO
-- =====================================================
INSERT INTO ventas (numero_venta, comprador_id, transportador_id, fecha, tipo, valor_total, precio_total, cantidad_animales, observaciones, estado, created_by) VALUES
('VENT-2024-001', (SELECT id FROM compradores WHERE nombre = 'Carnes Premium S.A.S'), (SELECT id FROM transportadores WHERE nombre = 'Transportes Ganaderos del Norte'), '2024-04-15', 'venta', 18000000, 18000000, 3, 'Venta de novillos para sacrificio', 'confirmada', (SELECT id FROM usuarios WHERE email = 'operador@gutierrezhnos.com')),
('VENT-2024-002', (SELECT id FROM compradores WHERE nombre = 'Distribuidora El Ganadero'), (SELECT id FROM transportadores WHERE nombre = 'Logística Rural S.A.S'), '2024-05-20', 'venta', 12000000, 12000000, 2, 'Venta de novillas para reproducción', 'confirmada', (SELECT id FROM usuarios WHERE email = 'operador@gutierrezhnos.com'));

-- Detalles de ventas
INSERT INTO detalle_venta (venta_id, animal_id, precio_unitario, peso, observaciones) VALUES
-- Venta 1 - Novillos
((SELECT id FROM ventas WHERE numero_venta = 'VENT-2024-001'), (SELECT id FROM animales WHERE numero_identificacion = 'N001'), 6000000, 450.0, 'Novillo Brahman listo para sacrificio'),
((SELECT id FROM ventas WHERE numero_venta = 'VENT-2024-001'), (SELECT id FROM animales WHERE numero_identificacion = 'N002'), 6000000, 420.0, 'Novillo Brahman listo para sacrificio'),
((SELECT id FROM ventas WHERE numero_venta = 'VENT-2024-001'), (SELECT id FROM animales WHERE numero_identificacion = 'N003'), 6000000, 480.0, 'Novillo Angus listo para sacrificio'),

-- Venta 2 - Novillas
((SELECT id FROM ventas WHERE numero_venta = 'VENT-2024-002'), (SELECT id FROM animales WHERE numero_identificacion = 'NV001'), 6000000, 380.0, 'Novilla Brahman para reproducción'),
((SELECT id FROM ventas WHERE numero_venta = 'VENT-2024-002'), (SELECT id FROM animales WHERE numero_identificacion = 'NV002'), 6000000, 390.0, 'Novilla Brahman para reproducción');

-- =====================================================
-- PESADAS DE EJEMPLO
-- =====================================================
INSERT INTO pesadas (animal_id, peso, fecha_pesada, tipo_pesada, observaciones, created_by) VALUES
-- Pesadas de nacimiento
((SELECT id FROM animales WHERE numero_identificacion = 'TE001'), 25.5, '2023-02-15 08:30:00', 'nacimiento', 'Ternero nacido en buen estado', (SELECT id FROM usuarios WHERE email = 'veterinario@gutierrezhnos.com')),
((SELECT id FROM animales WHERE numero_identificacion = 'TE002'), 24.8, '2023-03-20 09:15:00', 'nacimiento', 'Ternera nacida en buen estado', (SELECT id FROM usuarios WHERE email = 'veterinario@gutierrezhnos.com')),
((SELECT id FROM animales WHERE numero_identificacion = 'TE003'), 26.2, '2023-01-10 07:45:00', 'nacimiento', 'Ternero nacido en buen estado', (SELECT id FROM usuarios WHERE email = 'veterinario@gutierrezhnos.com')),

-- Pesadas regulares
((SELECT id FROM animales WHERE numero_identificacion = 'N001'), 380.0, '2024-01-15 10:00:00', 'regular', 'Pesada mensual', (SELECT id FROM usuarios WHERE email = 'operador@gutierrezhnos.com')),
((SELECT id FROM animales WHERE numero_identificacion = 'N002'), 350.0, '2024-01-15 10:30:00', 'regular', 'Pesada mensual', (SELECT id FROM usuarios WHERE email = 'operador@gutierrezhnos.com')),
((SELECT id FROM animales WHERE numero_identificacion = 'N003'), 420.0, '2024-01-15 11:00:00', 'regular', 'Pesada mensual', (SELECT id FROM usuarios WHERE email = 'operador@gutierrezhnos.com')),

-- Pesadas pre-venta
((SELECT id FROM animales WHERE numero_identificacion = 'N001'), 450.0, '2024-04-10 14:00:00', 'pre_venta', 'Pesada antes de la venta', (SELECT id FROM usuarios WHERE email = 'operador@gutierrezhnos.com')),
((SELECT id FROM animales WHERE numero_identificacion = 'N002'), 420.0, '2024-04-10 14:30:00', 'pre_venta', 'Pesada antes de la venta', (SELECT id FROM usuarios WHERE email = 'operador@gutierrezhnos.com')),
((SELECT id FROM animales WHERE numero_identificacion = 'N003'), 480.0, '2024-04-10 15:00:00', 'pre_venta', 'Pesada antes de la venta', (SELECT id FROM usuarios WHERE email = 'operador@gutierrezhnos.com'));

-- =====================================================
-- EVENTOS SANITARIOS
-- =====================================================
INSERT INTO eventos_sanitarios (animal_id, tipo_evento, fecha_evento, descripcion, tratamiento, medicamento, dosis, veterinario, costo) VALUES
-- Vacunaciones
((SELECT id FROM animales WHERE numero_identificacion = 'T001'), 'Vacunación', '2024-01-15 08:00:00', 'Vacuna contra fiebre aftosa', 'Aplicación intramuscular', 'Vacuna Fiebre Aftosa', '2ml', 'Dr. Carlos Mendoza', 50000),
((SELECT id FROM animales WHERE numero_identificacion = 'T002'), 'Vacunación', '2024-01-15 08:30:00', 'Vacuna contra fiebre aftosa', 'Aplicación intramuscular', 'Vacuna Fiebre Aftosa', '2ml', 'Dr. Carlos Mendoza', 50000),
((SELECT id FROM animales WHERE numero_identificacion = 'V001'), 'Vacunación', '2024-01-16 09:00:00', 'Vacuna contra brucelosis', 'Aplicación subcutánea', 'Vacuna Brucelosis', '1ml', 'Dr. Carlos Mendoza', 35000),

-- Desparasitaciones
((SELECT id FROM animales WHERE numero_identificacion = 'N001'), 'Desparasitación', '2024-02-01 10:00:00', 'Desparasitación interna', 'Aplicación oral', 'Ivermectina', '1ml por 50kg', 'Dr. Carlos Mendoza', 25000),
((SELECT id FROM animales WHERE numero_identificacion = 'N002'), 'Desparasitación', '2024-02-01 10:30:00', 'Desparasitación interna', 'Aplicación oral', 'Ivermectina', '1ml por 50kg', 'Dr. Carlos Mendoza', 25000),

-- Tratamientos médicos
((SELECT id FROM animales WHERE numero_identificacion = 'TE001'), 'Tratamiento', '2024-03-10 14:00:00', 'Tratamiento para diarrea', 'Aplicación intramuscular', 'Antibiótico', '2ml', 'Dr. Carlos Mendoza', 40000),
((SELECT id FROM animales WHERE numero_identificacion = 'V002'), 'Examen', '2024-03-15 09:00:00', 'Examen de preñez', 'Examen rectal', 'N/A', 'N/A', 'Dr. Carlos Mendoza', 80000);

-- =====================================================
-- CONFIGURACIÓN DE FACTURACIÓN
-- =====================================================
INSERT INTO configuracion_facturacion (tipo_comprobante, ultimo_numero, prefijo, sufijo, punto_venta) VALUES
('A', 0, 'A', '', 1),
('B', 0, 'B', '', 1),
('C', 0, 'C', '', 1),
('E', 0, 'E', '', 1);

-- =====================================================
-- FACTURAS DE EJEMPLO
-- =====================================================
INSERT INTO facturas (numero_factura, tipo_comprobante, punto_venta, fecha_emision, fecha_vencimiento, venta_id, estado, monto_total, iva_total, monto_neto, observaciones, created_by) VALUES
('A0001-00000001', 'A', 1, '2024-04-15', '2024-05-15', (SELECT id FROM ventas WHERE numero_venta = 'VENT-2024-001'), 'emitida', 18000000, 3420000, 14580000, 'Factura por venta de novillos', (SELECT id FROM usuarios WHERE email = 'admin@gutierrezhnos.com')),
('B0001-00000001', 'B', 1, '2024-05-20', '2024-06-20', (SELECT id FROM ventas WHERE numero_venta = 'VENT-2024-002'), 'emitida', 12000000, 0, 12000000, 'Factura por venta de novillas', (SELECT id FROM usuarios WHERE email = 'admin@gutierrezhnos.com'));

-- =====================================================
-- NOTIFICACIONES DE EJEMPLO
-- =====================================================
INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, data) VALUES
((SELECT id FROM usuarios WHERE email = 'admin@gutierrezhnos.com'), 'Nueva Venta Registrada', 'Se ha registrado una nueva venta por $18,000,000', 'success', '{"venta_id": "VENT-2024-001", "monto": 18000000}'),
((SELECT id FROM usuarios WHERE email = 'operador@gutierrezhnos.com'), 'Animal Requiere Atención', 'El animal TE001 presenta síntomas de diarrea', 'warning', '{"animal_id": "TE001", "evento": "diarrea"}'),
((SELECT id FROM usuarios WHERE email = 'veterinario@gutierrezhnos.com'), 'Vacunación Programada', 'Se requiere vacunar el lote principal', 'info', '{"lote": "Lote Principal", "vacuna": "Fiebre Aftosa"}'),
((SELECT id FROM usuarios WHERE email = 'admin@gutierrezhnos.com'), 'Factura Generada', 'Se ha generado la factura A0001-00000001', 'success', '{"factura_id": "A0001-00000001", "monto": 18000000}');

-- =====================================================
-- FOTOS DE ANIMALES (URLs de ejemplo)
-- =====================================================
INSERT INTO animal_photos (animal_id, url, descripcion, es_principal, orden) VALUES
((SELECT id FROM animales WHERE numero_identificacion = 'T001'), 'https://images.unsplash.com/photo-1544966503-7cc4bb7f9e4d?w=400', 'Foto principal del toro T001', true, 1),
((SELECT id FROM animales WHERE numero_identificacion = 'T002'), 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=400', 'Foto principal del toro T002', true, 1),
((SELECT id FROM animales WHERE numero_identificacion = 'V001'), 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', 'Foto principal de la vaca V001', true, 1),
((SELECT id FROM animales WHERE numero_identificacion = 'N001'), 'https://images.unsplash.com/photo-1544966503-7cc4bb7f9e4d?w=400', 'Foto principal del novillo N001', true, 1),
((SELECT id FROM animales WHERE numero_identificacion = 'TE001'), 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=400', 'Foto principal del ternero TE001', true, 1);

-- =====================================================
-- ACTUALIZAR NÚMEROS DE CONFIGURACIÓN DE FACTURACIÓN
-- =====================================================
UPDATE configuracion_facturacion SET ultimo_numero = 1 WHERE tipo_comprobante = 'A';
UPDATE configuracion_facturacion SET ultimo_numero = 1 WHERE tipo_comprobante = 'B';

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================
-- Los datos de ejemplo incluyen:
-- - 3 usuarios con diferentes roles
-- - 4 proveedores, 4 compradores y 3 transportadores
-- - 5 lotes con diferentes tipos
-- - 20 animales de diferentes edades y tipos
-- - 3 compras con detalles
-- - 2 ventas con detalles
-- - Múltiples pesadas y eventos sanitarios
-- - 2 facturas generadas
-- - Notificaciones del sistema
-- - Fotos de ejemplo para algunos animales
-- - Configuración completa del sistema
