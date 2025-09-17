-- =====================================================
-- SCRIPT COMPLETO DE CREACIÓN DE TABLAS
-- Sistema de Gestión Ganadera - Gutierrez Hnos
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    rol VARCHAR(20) DEFAULT 'operador' CHECK (rol IN ('administrador', 'operador', 'veterinario')),
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE CONFIGURACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS configuraciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    categoria VARCHAR(50) DEFAULT 'general',
    tipo VARCHAR(20) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE PROVEEDORES
-- =====================================================
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(200) NOT NULL,
    cuit VARCHAR(20) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    contacto VARCHAR(100),
    observaciones TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE COMPRADORES
-- =====================================================
CREATE TABLE IF NOT EXISTS compradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(200) NOT NULL,
    cuit VARCHAR(20) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    contacto VARCHAR(100),
    observaciones TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE TRANSPORTADORES
-- =====================================================
CREATE TABLE IF NOT EXISTS transportadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(200) NOT NULL,
    cuit VARCHAR(20) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    contacto VARCHAR(100),
    observaciones TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE ANIMALES
-- =====================================================
CREATE TABLE IF NOT EXISTS animales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_identificacion VARCHAR(50) UNIQUE NOT NULL,
    tipo_animal VARCHAR(50) NOT NULL CHECK (tipo_animal IN ('bovino', 'porcino', 'ovino', 'caprino', 'equino')),
    raza VARCHAR(100),
    sexo VARCHAR(10) CHECK (sexo IN ('macho', 'hembra')),
    fecha_nacimiento DATE,
    peso_nacimiento DECIMAL(8,2),
    peso_actual DECIMAL(8,2),
    estado_salud VARCHAR(50) DEFAULT 'sano' CHECK (estado_salud IN ('sano', 'enfermo', 'recuperacion', 'cuarentena')),
    observaciones TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE LOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS lotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(200),
    capacidad_maxima INTEGER DEFAULT 0,
    capacidad_actual INTEGER DEFAULT 0,
    tipo_lote VARCHAR(50) DEFAULT 'general' CHECK (tipo_lote IN ('general', 'cuarentena', 'maternidad', 'engorde', 'reproduccion')),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'mantenimiento')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE ASIGNACIONES DE ANIMALES A LOTES
-- =====================================================
CREATE TABLE IF NOT EXISTS lote_animales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lote_id UUID NOT NULL REFERENCES lotes(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_salida TIMESTAMP WITH TIME ZONE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lote_id, animal_id, fecha_asignacion)
);

-- =====================================================
-- TABLA DE COMPRAS
-- =====================================================
CREATE TABLE IF NOT EXISTS compras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_compra VARCHAR(50) UNIQUE NOT NULL,
    proveedor_id UUID NOT NULL REFERENCES proveedores(id),
    fecha DATE NOT NULL,
    tipo VARCHAR(20) DEFAULT 'compra' CHECK (tipo IN ('compra', 'donacion', 'trueque')),
    precio_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    cantidad_animales INTEGER DEFAULT 0,
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
    created_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE DETALLES DE COMPRA
-- =====================================================
CREATE TABLE IF NOT EXISTS detalle_compra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compra_id UUID NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animales(id),
    precio_unitario DECIMAL(10,2) NOT NULL,
    peso DECIMAL(8,2),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE VENTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_venta VARCHAR(50) UNIQUE NOT NULL,
    comprador_id UUID NOT NULL REFERENCES compradores(id),
    transportador_id UUID REFERENCES transportadores(id),
    fecha DATE NOT NULL,
    tipo VARCHAR(20) DEFAULT 'venta' CHECK (tipo IN ('venta', 'donacion', 'trueque')),
    valor_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    precio_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    cantidad_animales INTEGER DEFAULT 0,
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
    created_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE DETALLES DE VENTA
-- =====================================================
CREATE TABLE IF NOT EXISTS detalle_venta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    animal_id UUID NOT NULL REFERENCES animales(id),
    precio_unitario DECIMAL(10,2) NOT NULL,
    peso DECIMAL(8,2),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE PESADAS
-- =====================================================
CREATE TABLE IF NOT EXISTS pesadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    peso DECIMAL(8,2) NOT NULL,
    fecha_pesada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tipo_pesada VARCHAR(20) DEFAULT 'regular' CHECK (tipo_pesada IN ('regular', 'nacimiento', 'destete', 'pre_venta', 'post_venta')),
    observaciones TEXT,
    created_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE EVENTOS SANITARIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS eventos_sanitarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    tipo_evento VARCHAR(100) NOT NULL,
    fecha_evento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    descripcion TEXT,
    tratamiento TEXT,
    medicamento VARCHAR(200),
    dosis VARCHAR(100),
    veterinario VARCHAR(200),
    costo DECIMAL(10,2) DEFAULT 0,
    proxima_fecha TIMESTAMP WITH TIME ZONE,
    observaciones TEXT,
    created_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE FACTURAS
-- =====================================================
CREATE TABLE IF NOT EXISTS facturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_factura VARCHAR(20) UNIQUE NOT NULL,
    tipo_comprobante VARCHAR(5) CHECK (tipo_comprobante IN ('A', 'B', 'C', 'E')),
    punto_venta INTEGER DEFAULT 1,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    venta_id UUID REFERENCES ventas(id),
    compra_id UUID REFERENCES compras(id),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'emitida', 'pagada', 'cancelada')),
    monto_total NUMERIC NOT NULL,
    iva_total NUMERIC DEFAULT 0,
    monto_neto NUMERIC DEFAULT 0,
    observaciones TEXT,
    created_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE CONFIGURACIÓN DE FACTURACIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS configuracion_facturacion (
    tipo_comprobante VARCHAR(5) PRIMARY KEY CHECK (tipo_comprobante IN ('A', 'B', 'C', 'E')),
    ultimo_numero INTEGER DEFAULT 0,
    prefijo VARCHAR(10),
    sufijo VARCHAR(10),
    punto_venta INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'info' CHECK (tipo IN ('info', 'success', 'warning', 'error', 'alert')),
    leida BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE FOTOS DE ANIMALES
-- =====================================================
CREATE TABLE IF NOT EXISTS animal_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    animal_id UUID NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    descripcion TEXT,
    es_principal BOOLEAN DEFAULT false,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para generar el próximo número de factura
CREATE OR REPLACE FUNCTION generar_numero_factura(tipo_comp VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    next_num INTEGER;
    config_row configuracion_facturacion;
BEGIN
    -- Bloquear la fila para evitar condiciones de carrera
    SELECT * INTO config_row FROM configuracion_facturacion WHERE tipo_comprobante = tipo_comp FOR UPDATE;

    IF NOT FOUND THEN
        -- Si no existe configuración, crear una por defecto
        INSERT INTO configuracion_facturacion (tipo_comprobante, ultimo_numero, prefijo, sufijo, punto_venta)
        VALUES (tipo_comp, 0, tipo_comp, '', 1)
        RETURNING ultimo_numero, prefijo, sufijo, punto_venta INTO config_row;
    END IF;

    next_num := config_row.ultimo_numero + 1;
    UPDATE configuracion_facturacion SET ultimo_numero = next_num WHERE tipo_comprobante = tipo_comp;

    RETURN config_row.prefijo || LPAD(config_row.punto_venta::TEXT, 4, '0') || '-' || LPAD(next_num::TEXT, 8, '0') || config_row.sufijo;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar capacidad actual de lotes
CREATE OR REPLACE FUNCTION actualizar_capacidad_lote()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar capacidad actual del lote
    UPDATE lotes 
    SET capacidad_actual = (
        SELECT COUNT(*) 
        FROM lote_animales 
        WHERE lote_id = NEW.lote_id 
        AND fecha_salida IS NULL
    )
    WHERE id = NEW.lote_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar capacidad de lotes
CREATE TRIGGER trigger_actualizar_capacidad_lote
    AFTER INSERT OR UPDATE OR DELETE ON lote_animales
    FOR EACH ROW EXECUTE FUNCTION actualizar_capacidad_lote();

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- Índices para animales
CREATE INDEX IF NOT EXISTS idx_animales_numero ON animales(numero_identificacion);
CREATE INDEX IF NOT EXISTS idx_animales_tipo ON animales(tipo_animal);
CREATE INDEX IF NOT EXISTS idx_animales_estado ON animales(estado_salud);

-- Índices para compras
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha);
CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_compras_estado ON compras(estado);

-- Índices para ventas
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_comprador ON ventas(comprador_id);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);

-- Índices para facturas
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_facturas_tipo ON facturas(tipo_comprobante);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha ON notificaciones(created_at);

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================
COMMENT ON TABLE usuarios IS 'Usuarios del sistema con diferentes roles';
COMMENT ON TABLE configuraciones IS 'Configuraciones generales del sistema';
COMMENT ON TABLE proveedores IS 'Proveedores de animales y servicios';
COMMENT ON TABLE compradores IS 'Compradores de animales';
COMMENT ON TABLE transportadores IS 'Empresas de transporte de animales';
COMMENT ON TABLE animales IS 'Registro de todos los animales del sistema';
COMMENT ON TABLE lotes IS 'Lotes o corrales donde se alojan los animales';
COMMENT ON TABLE lote_animales IS 'Relación entre lotes y animales';
COMMENT ON TABLE compras IS 'Registro de compras de animales';
COMMENT ON TABLE detalle_compra IS 'Detalle de animales en cada compra';
COMMENT ON TABLE ventas IS 'Registro de ventas de animales';
COMMENT ON TABLE detalle_venta IS 'Detalle de animales en cada venta';
COMMENT ON TABLE pesadas IS 'Historial de pesadas de animales';
COMMENT ON TABLE eventos_sanitarios IS 'Registro de eventos de salud animal';
COMMENT ON TABLE facturas IS 'Facturas generadas del sistema';
COMMENT ON TABLE configuracion_facturacion IS 'Configuración de numeración de facturas';
COMMENT ON TABLE notificaciones IS 'Notificaciones del sistema para usuarios';
COMMENT ON TABLE animal_photos IS 'Fotos asociadas a animales';

-- =====================================================
-- SEGURIDAD: RLS, FUNCIONES Y POLÍTICAS
-- =====================================================

-- Función para detectar si el usuario autenticado es administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.id = auth.uid() AND u.rol = 'administrador'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función genérica para setear created_by si existe la columna
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función genérica para setear updated_at si existe la columna
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Activar RLS en todas las tablas
-- =====================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE compradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE animales ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lote_animales ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE pesadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_sanitarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_facturacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_photos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Triggers de created_by y updated_at (donde corresponda)
-- =====================================================
CREATE TRIGGER compras_set_created_by BEFORE INSERT ON compras
FOR EACH ROW EXECUTE FUNCTION set_created_by();
CREATE TRIGGER compras_set_updated_at BEFORE UPDATE ON compras
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER ventas_set_created_by BEFORE INSERT ON ventas
FOR EACH ROW EXECUTE FUNCTION set_created_by();
CREATE TRIGGER ventas_set_updated_at BEFORE UPDATE ON ventas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER pesadas_set_created_by BEFORE INSERT ON pesadas
FOR EACH ROW EXECUTE FUNCTION set_created_by();

CREATE TRIGGER eventos_set_created_by BEFORE INSERT ON eventos_sanitarios
FOR EACH ROW EXECUTE FUNCTION set_created_by();
CREATE TRIGGER eventos_set_updated_at BEFORE UPDATE ON eventos_sanitarios
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER facturas_set_created_by BEFORE INSERT ON facturas
FOR EACH ROW EXECUTE FUNCTION set_created_by();
CREATE TRIGGER facturas_set_updated_at BEFORE UPDATE ON facturas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================
-- Políticas por tabla
-- Nota: Supabase requiere políticas explícitas por operación (SELECT/INSERT/UPDATE/DELETE)
-- =====================================================

-- USUARIOS: ver solo el propio registro; admin puede ver todos. Actualizar solo admin.
DROP POLICY IF EXISTS usuarios_select_self OR REPLACE ON usuarios;
CREATE POLICY usuarios_select_self ON usuarios
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_admin());
CREATE POLICY usuarios_update_admin ON usuarios
  FOR UPDATE TO authenticated
  USING (is_admin());

-- CONFIGURACIONES: leer todos los autenticados, escribir solo admin
CREATE POLICY configuraciones_select_all ON configuraciones
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY configuraciones_write_admin ON configuraciones
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());
CREATE POLICY configuraciones_update_admin ON configuraciones
  FOR UPDATE TO authenticated
  USING (is_admin());
CREATE POLICY configuraciones_delete_admin ON configuraciones
  FOR DELETE TO authenticated
  USING (is_admin());

-- PROVEEDORES / COMPRADORES / TRANSPORTADORES: leer autenticados, escribir admin
CREATE POLICY proveedores_select_all ON proveedores FOR SELECT TO authenticated USING (true);
CREATE POLICY proveedores_write_admin ON proveedores FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY compradores_select_all ON compradores FOR SELECT TO authenticated USING (true);
CREATE POLICY compradores_write_admin ON compradores FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY transportadores_select_all ON transportadores FOR SELECT TO authenticated USING (true);
CREATE POLICY transportadores_write_admin ON transportadores FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ANIMALES / LOTES / LOTE_ANIMALES: leer autenticados, escribir admin
CREATE POLICY animales_select_all ON animales FOR SELECT TO authenticated USING (true);
CREATE POLICY animales_write_admin ON animales FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY lotes_select_all ON lotes FOR SELECT TO authenticated USING (true);
CREATE POLICY lotes_write_admin ON lotes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY lote_animales_select_all ON lote_animales FOR SELECT TO authenticated USING (true);
CREATE POLICY lote_animales_write_admin ON lote_animales FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- COMPRAS: leer autenticados; insertar cualquiera autenticado (created_by vía trigger); actualizar/borrar dueño o admin
CREATE POLICY compras_select_all ON compras FOR SELECT TO authenticated USING (true);
CREATE POLICY compras_insert_auth ON compras FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY compras_update_owner_admin ON compras FOR UPDATE TO authenticated USING (created_by = auth.uid() OR is_admin());
CREATE POLICY compras_delete_owner_admin ON compras FOR DELETE TO authenticated USING (created_by = auth.uid() OR is_admin());

-- DETALLE_COMPRA: leer autenticados; escribir admin o dueño de compra
CREATE POLICY detalle_compra_select_all ON detalle_compra FOR SELECT TO authenticated USING (true);
CREATE POLICY detalle_compra_write_restricted ON detalle_compra
  FOR ALL TO authenticated
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM compras c WHERE c.id = detalle_compra.compra_id AND c.created_by = auth.uid()
    )
  )
  WITH CHECK (
    is_admin() OR EXISTS (
      SELECT 1 FROM compras c WHERE c.id = detalle_compra.compra_id AND c.created_by = auth.uid()
    )
  );

-- VENTAS: leer autenticados; insertar autenticado; actualizar/borrar dueño o admin
CREATE POLICY ventas_select_all ON ventas FOR SELECT TO authenticated USING (true);
CREATE POLICY ventas_insert_auth ON ventas FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY ventas_update_owner_admin ON ventas FOR UPDATE TO authenticated USING (created_by = auth.uid() OR is_admin());
CREATE POLICY ventas_delete_owner_admin ON ventas FOR DELETE TO authenticated USING (created_by = auth.uid() OR is_admin());

-- DETALLE_VENTA: leer autenticados; escribir admin o dueño de venta
CREATE POLICY detalle_venta_select_all ON detalle_venta FOR SELECT TO authenticated USING (true);
CREATE POLICY detalle_venta_write_restricted ON detalle_venta
  FOR ALL TO authenticated
  USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM ventas v WHERE v.id = detalle_venta.venta_id AND v.created_by = auth.uid()
    )
  )
  WITH CHECK (
    is_admin() OR EXISTS (
      SELECT 1 FROM ventas v WHERE v.id = detalle_venta.venta_id AND v.created_by = auth.uid()
    )
  );

-- PESADAS: leer autenticados; insertar autenticado; update/delete dueño o admin
CREATE POLICY pesadas_select_all ON pesadas FOR SELECT TO authenticated USING (true);
CREATE POLICY pesadas_insert_auth ON pesadas FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY pesadas_update_owner_admin ON pesadas FOR UPDATE TO authenticated USING (created_by = auth.uid() OR is_admin());
CREATE POLICY pesadas_delete_owner_admin ON pesadas FOR DELETE TO authenticated USING (created_by = auth.uid() OR is_admin());

-- EVENTOS SANITARIOS: similar a pesadas
CREATE POLICY eventos_select_all ON eventos_sanitarios FOR SELECT TO authenticated USING (true);
CREATE POLICY eventos_insert_auth ON eventos_sanitarios FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY eventos_update_owner_admin ON eventos_sanitarios FOR UPDATE TO authenticated USING (created_by = auth.uid() OR is_admin());
CREATE POLICY eventos_delete_owner_admin ON eventos_sanitarios FOR DELETE TO authenticated USING (created_by = auth.uid() OR is_admin());

-- FACTURAS: leer autenticados; inserta autenticado; update/delete dueño o admin
CREATE POLICY facturas_select_all ON facturas FOR SELECT TO authenticated USING (true);
CREATE POLICY facturas_insert_auth ON facturas FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY facturas_update_owner_admin ON facturas FOR UPDATE TO authenticated USING (created_by = auth.uid() OR is_admin());
CREATE POLICY facturas_delete_owner_admin ON facturas FOR DELETE TO authenticated USING (created_by = auth.uid() OR is_admin());

-- CONFIGURACION_FACTURACION: leer autenticados; escribir admin
CREATE POLICY conf_fact_select_all ON configuracion_facturacion FOR SELECT TO authenticated USING (true);
CREATE POLICY conf_fact_write_admin ON configuracion_facturacion FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- NOTIFICACIONES: leer propias o admin; insertar cualquiera autenticado; actualizar solo dueño; borrar admin o dueño
CREATE POLICY notif_select_self_or_admin ON notificaciones
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid() OR is_admin());
CREATE POLICY notif_insert_auth ON notificaciones
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY notif_update_owner ON notificaciones
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid() OR is_admin());
CREATE POLICY notif_delete_owner_admin ON notificaciones
  FOR DELETE TO authenticated
  USING (usuario_id = auth.uid() OR is_admin());

-- ANIMAL_PHOTOS: leer autenticados; escribir admin
CREATE POLICY animal_photos_select_all ON animal_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY animal_photos_write_admin ON animal_photos FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- =====================================================
-- FIN SEGURIDAD
-- =====================================================

-- =====================================================
-- MEJORAS ADICIONALES: CONSTRAINTS, TRIGGERS Y ÍNDICES
-- =====================================================

-- Constraint: Factura debe vincularse a venta O compra (exclusivo)
ALTER TABLE facturas
  DROP CONSTRAINT IF EXISTS facturas_origen_unico,
  ADD CONSTRAINT facturas_origen_unico
  CHECK (
    (venta_id IS NOT NULL AND compra_id IS NULL)
    OR (venta_id IS NULL AND compra_id IS NOT NULL)
  );

-- Evitar animal repetido en el detalle de una misma compra/venta
ALTER TABLE detalle_compra
  DROP CONSTRAINT IF EXISTS uq_detalle_compra_item,
  ADD CONSTRAINT uq_detalle_compra_item UNIQUE (compra_id, animal_id);

ALTER TABLE detalle_venta
  DROP CONSTRAINT IF EXISTS uq_detalle_venta_item,
  ADD CONSTRAINT uq_detalle_venta_item UNIQUE (venta_id, animal_id);

-- Triggers updated_at para tablas que lo incluyen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'usuarios_set_updated_at'
  ) THEN
    CREATE TRIGGER usuarios_set_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'configuraciones_set_updated_at'
  ) THEN
    CREATE TRIGGER configuraciones_set_updated_at BEFORE UPDATE ON configuraciones
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'proveedores_set_updated_at'
  ) THEN
    CREATE TRIGGER proveedores_set_updated_at BEFORE UPDATE ON proveedores
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'compradores_set_updated_at'
  ) THEN
    CREATE TRIGGER compradores_set_updated_at BEFORE UPDATE ON compradores
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'transportadores_set_updated_at'
  ) THEN
    CREATE TRIGGER transportadores_set_updated_at BEFORE UPDATE ON transportadores
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'animales_set_updated_at'
  ) THEN
    CREATE TRIGGER animales_set_updated_at BEFORE UPDATE ON animales
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'lotes_set_updated_at'
  ) THEN
    CREATE TRIGGER lotes_set_updated_at BEFORE UPDATE ON lotes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'detalle_compra_set_updated_at'
  ) THEN
    CREATE TRIGGER detalle_compra_set_updated_at BEFORE UPDATE ON detalle_compra
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'detalle_venta_set_updated_at'
  ) THEN
    CREATE TRIGGER detalle_venta_set_updated_at BEFORE UPDATE ON detalle_venta
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'notificaciones_set_updated_at'
  ) THEN
    CREATE TRIGGER notificaciones_set_updated_at BEFORE UPDATE ON notificaciones
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'animal_photos_set_updated_at'
  ) THEN
    CREATE TRIGGER animal_photos_set_updated_at BEFORE UPDATE ON animal_photos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'configuracion_facturacion_set_updated_at'
  ) THEN
    CREATE TRIGGER configuracion_facturacion_set_updated_at BEFORE UPDATE ON configuracion_facturacion
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- Índices en FKs y campos de uso frecuente
CREATE INDEX IF NOT EXISTS idx_detalle_compra_compra ON detalle_compra(compra_id);
CREATE INDEX IF NOT EXISTS idx_detalle_compra_animal ON detalle_compra(animal_id);
CREATE INDEX IF NOT EXISTS idx_detalle_venta_venta ON detalle_venta(venta_id);
CREATE INDEX IF NOT EXISTS idx_detalle_venta_animal ON detalle_venta(animal_id);
CREATE INDEX IF NOT EXISTS idx_lote_animales_lote ON lote_animales(lote_id);
CREATE INDEX IF NOT EXISTS idx_lote_animales_animal ON lote_animales(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_photos_animal ON animal_photos(animal_id);

-- Índice parcial para facturas pendientes
CREATE INDEX IF NOT EXISTS idx_facturas_pendientes ON facturas(id) WHERE estado = 'pendiente';

