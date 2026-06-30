-- ============================================================
-- SISTEMA DE GESTIÓN DE LA CALIDAD (SGC)
-- UNIVERSIDAD NACIONAL DE TRUJILLO
-- PostgreSQL 16+
-- ============================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ESQUEMA
CREATE SCHEMA IF NOT EXISTS sgc;
SET search_path TO sgc;

-- ============================================================
-- TABLAS BASE (AUDITORÍA Y SEGURIDAD)
-- ============================================================

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL, -- Código institucional
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'gestor_calidad', 'auditor', 'docente', 'estudiante', 'egresado', 'administrativo', 'invitado')),
    facultad VARCHAR(100),
    escuela VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- ============================================================
-- MÓDULO 1: GESTIÓN DOCUMENTAL
-- ============================================================

CREATE TABLE tipos_documento (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    requiere_aprobacion BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    tipo_documento_id INTEGER NOT NULL REFERENCES tipos_documento(id),
    proceso_id UUID, -- FK a procesos (definido más abajo)
    version_actual INTEGER DEFAULT 1,
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'en_revision', 'aprobado', 'obsoleto', 'archivado')),
    contenido TEXT, -- Markdown o HTML
    archivo_url VARCHAR(500),
    fecha_vigencia DATE,
    fecha_revision DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE INDEX idx_documentos_estado ON documentos(estado);
CREATE INDEX idx_documentos_tipo ON documentos(tipo_documento_id);

CREATE TABLE versiones_documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
    numero_version INTEGER NOT NULL,
    cambios_descripcion TEXT NOT NULL,
    contenido TEXT,
    archivo_url VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'borrador',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE aprobaciones_documento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    documento_id UUID NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
    version_id UUID REFERENCES versiones_documento(id),
    aprobador_id UUID NOT NULL REFERENCES usuarios(id),
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('aprobado', 'rechazado', 'observado')),
    comentario TEXT,
    fecha_aprobacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MÓDULO 2: MAPA DE PROCESOS
-- ============================================================

CREATE TABLE macroprocesos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    responsable_id UUID REFERENCES usuarios(id),
    tipo VARCHAR(30) CHECK (tipo IN ('estrategico', 'misional', 'apoyo', 'evaluacion')),
    estado BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE procesos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    macroproceso_id UUID REFERENCES macroprocesos(id),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    objetivo TEXT,
    alcance TEXT,
    responsable_id UUID REFERENCES usuarios(id),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'en_mejora')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE actividades_proceso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proceso_id UUID NOT NULL REFERENCES procesos(id) ON DELETE CASCADE,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    secuencia INTEGER NOT NULL,
    responsable_id UUID REFERENCES usuarios(id),
    entradas TEXT,
    salidas TEXT,
    indicadores TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE flujos_trabajo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proceso_id UUID NOT NULL REFERENCES procesos(id),
    nombre VARCHAR(150) NOT NULL,
    definicion_json JSONB NOT NULL, -- BPMN-like JSON
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id)
);

-- ============================================================
-- MÓDULO 3: ACREDITACIÓN Y AUTOEVALUACIÓN
-- ============================================================

CREATE TABLE estandares_acreditacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    organizacion VARCHAR(100), -- SUNEDU, ISO 21001, etc.
    descripcion TEXT,
    vigente_desde DATE,
    vigente_hasta DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE factores_criterio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estandar_id UUID NOT NULL REFERENCES estandares_acreditacion(id) ON DELETE CASCADE,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    peso DECIMAL(5,2),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE autoevaluaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estandar_id UUID NOT NULL REFERENCES estandares_acreditacion(id),
    periodo VARCHAR(20) NOT NULL, -- 2024-I, 2024-II
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado VARCHAR(20) DEFAULT 'en_proceso' CHECK (estado IN ('en_proceso', 'completada', 'certificada')),
    puntaje_total DECIMAL(5,2),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE evaluaciones_criterio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    autoevaluacion_id UUID NOT NULL REFERENCES autoevaluaciones(id) ON DELETE CASCADE,
    factor_id UUID NOT NULL REFERENCES factores_criterio(id),
    cumplimiento VARCHAR(20) CHECK (cumplimiento IN ('cumple', 'cumple_parcial', 'no_cumple', 'no_aplica')),
    puntaje DECIMAL(5,2),
    evidencias TEXT,
    observaciones TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

-- ============================================================
-- MÓDULO 4: AUDITORÍAS E INSPECCIONES
-- ============================================================

CREATE TABLE planes_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    tipo VARCHAR(30) CHECK (tipo IN ('interna', 'externa', 'especial')),
    alcance TEXT,
    fecha_programada DATE NOT NULL,
    fecha_ejecucion DATE,
    estado VARCHAR(20) DEFAULT 'planificado' CHECK (estado IN ('planificado', 'en_ejecucion', 'ejecutado', 'cerrado')),
    lider_id UUID REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE equipos_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES planes_auditoria(id) ON DELETE CASCADE,
    auditor_id UUID NOT NULL REFERENCES usuarios(id),
    rol_en_equipo VARCHAR(30) CHECK (rol_en_equipo IN ('lider', 'auditor', 'observador')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hallazgos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES planes_auditoria(id),
    tipo VARCHAR(30) CHECK (tipo IN ('no_conformidad', 'observacion', 'oportunidad_mejora')),
    descripcion TEXT NOT NULL,
    area_proceso_id UUID REFERENCES procesos(id),
    gravedad VARCHAR(20) CHECK (gravedad IN ('baja', 'media', 'alta', 'critica')),
    estado VARCHAR(20) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_tratamiento', 'cerrado')),
    fecha_cierre DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

-- ============================================================
-- MÓDULO 5: ACCIONES CORRECTIVAS Y PREVENTIVAS (CAPA)
-- ============================================================

CREATE TABLE capas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('correctiva', 'preventiva', 'mejora')),
    hallazgo_id UUID REFERENCES hallazgos(id),
    descripcion TEXT NOT NULL,
    causa_raiz TEXT,
    accion_propuesta TEXT NOT NULL,
    responsable_id UUID REFERENCES usuarios(id),
    fecha_implementacion DATE,
    fecha_verificacion DATE,
    evidencia_url VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'registrada' CHECK (estado IN ('registrada', 'en_implementacion', 'implementada', 'verificada', 'cerrada', 'rechazada')),
    efectividad VARCHAR(20) CHECK (efectividad IN ('efectiva', 'parcial', 'no_efectiva', 'pendiente')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE seguimientos_capa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capa_id UUID NOT NULL REFERENCES capas(id) ON DELETE CASCADE,
    fecha_seguimiento DATE NOT NULL,
    avance DECIMAL(5,2) CHECK (avance BETWEEN 0 AND 100),
    observaciones TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id)
);

-- ============================================================
-- MÓDULO 6: GESTIÓN DE RIESGOS
-- ============================================================

CREATE TABLE riesgos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    proceso_id UUID REFERENCES procesos(id),
    categoria VARCHAR(50) CHECK (categoria IN ('estrategico', 'operativo', 'academico', 'financiero', 'legal', 'tecnologico', 'reputacional')),
    probabilidad INTEGER CHECK (probabilidad BETWEEN 1 AND 5),
    impacto INTEGER CHECK (impacto BETWEEN 1 AND 5),
    nivel_riesgo VARCHAR(20) GENERATED ALWAYS AS (
        CASE
            WHEN (probabilidad * impacto) <= 4 THEN 'bajo'
            WHEN (probabilidad * impacto) <= 9 THEN 'medio'
            WHEN (probabilidad * impacto) <= 14 THEN 'alto'
            ELSE 'critico'
        END
    ) STORED,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'mitigado', 'aceptado', 'eliminado')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE planes_mitigacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    riesgo_id UUID NOT NULL REFERENCES riesgos(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    acciones TEXT,
    responsable_id UUID REFERENCES usuarios(id),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(20) DEFAULT 'planificado' CHECK (estado IN ('planificado', 'en_ejecucion', 'completado')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id)
);

-- ============================================================
-- MÓDULO 7: INDICADORES DE GESTIÓN (DASHBOARDS)
-- ============================================================

CREATE TABLE indicadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    proceso_id UUID REFERENCES procesos(id),
    tipo VARCHAR(30) CHECK (tipo IN ('eficacia', 'eficiencia', 'impacto', 'satisfaccion')),
    formula_calculo TEXT,
    unidad_medida VARCHAR(50),
    meta DECIMAL(10,2),
    frecuencia_medicion VARCHAR(20) CHECK (frecuencia_medicion IN ('diaria', 'semanal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual')),
    fuente_datos TEXT,
    estado VARCHAR(20) DEFAULT 'activo',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE mediciones_indicador (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicador_id UUID NOT NULL REFERENCES indicadores(id) ON DELETE CASCADE,
    periodo VARCHAR(20) NOT NULL,
    fecha_medicion DATE DEFAULT CURRENT_DATE,
    valor_real DECIMAL(10,2),
    valor_esperado DECIMAL(10,2),
    cumplimiento DECIMAL(5,2), -- Porcentaje
    analisis_tendencia TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id)
);

-- ============================================================
-- PERIODOS ACADÉMICOS
-- ============================================================

CREATE TABLE periodos_academicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id)
);

-- ============================================================
-- MÓDULO 8: GESTIÓN DE LA SATISFACCIÓN (ENCUESTAS)
-- ============================================================

CREATE TABLE encuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    dirigido_a VARCHAR(30) CHECK (dirigido_a IN ('estudiantes', 'docentes', 'egresados', 'administrativos', 'todos')),
    fecha_inicio DATE,
    fecha_fin DATE,
    anonima BOOLEAN DEFAULT TRUE,
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicada', 'en_curso', 'cerrada', 'archivada')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    modificado_por UUID REFERENCES usuarios(id)
);

CREATE TABLE preguntas_encuesta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encuesta_id UUID NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    tipo VARCHAR(30) CHECK (tipo IN ('likert_5', 'likert_7', 'si_no', 'multiple', 'abierta', 'numerica')),
    orden INTEGER NOT NULL,
    obligatoria BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE respuestas_encuesta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    encuesta_id UUID NOT NULL REFERENCES encuestas(id),
    pregunta_id UUID NOT NULL REFERENCES preguntas_encuesta(id),
    usuario_id UUID REFERENCES usuarios(id), -- NULL si es anónima
    valor_texto TEXT,
    valor_numerico DECIMAL(10,2),
    enviado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_respuestas_encuesta ON respuestas_encuesta(encuesta_id, pregunta_id);

-- ============================================================
-- TABLA DE CONFIGURACIÓN Y PARÁMETROS
-- ============================================================

CREATE TABLE parametros_sistema (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modificado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MAPA DE PROCESOS: CLASIFICACIÓN Y VERSIONES
-- ============================================================

ALTER TABLE sgc.macroprocesos ADD COLUMN IF NOT EXISTS clasificacion_mapa VARCHAR(20)
    CHECK (clasificacion_mapa IN ('misional', 'soporte', 'estrategico'));

CREATE TABLE IF NOT EXISTS sgc.versiones_mapa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_version INTEGER NOT NULL,
    cambios_descripcion TEXT NOT NULL DEFAULT '',
    datos JSONB NOT NULL,
    activa BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES sgc.usuarios(id)
);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT INTO tipos_documento (codigo, nombre, descripcion, requiere_aprobacion) VALUES
('POL', 'Política', 'Documentos de política institucional', TRUE),
('MAN', 'Manual', 'Manuales de procedimiento y operación', TRUE),
('PRO', 'Procedimiento', 'Procedimientos específicos', TRUE),
('INS', 'Instructivo', 'Instructivos de trabajo', FALSE),
('FOR', 'Formato', 'Formatos y plantillas', FALSE);

INSERT INTO usuarios (codigo, nombres, apellidos, correo, contrasena_hash, rol, facultad, escuela, activo) VALUES
('ADM-001', 'Admin', 'SGC', 'admin@unitru.edu.pe', '$2a$10$WIJEFhvFbf5JcxVSHvevROXEIkk7EM6rFPfUIPQvyCoXfC.FxPjRm', 'admin', 'Ingeniería', 'Sistemas', TRUE),
('GES-001', 'Gestor', 'Calidad', 'gestor@unitru.edu.pe', '$2a$10$WIJEFhvFbf5JcxVSHvevROXEIkk7EM6rFPfUIPQvyCoXfC.FxPjRm', 'gestor_calidad', 'Ingeniería', 'Sistemas', TRUE),
('AUD-001', 'Auditor', 'Interno', 'auditor@unitru.edu.pe', '$2a$10$WIJEFhvFbf5JcxVSHvevROXEIkk7EM6rFPfUIPQvyCoXfC.FxPjRm', 'auditor', 'Ciencias', 'Contabilidad', TRUE),
('DOC-001', 'Docente', 'Principal', 'docente@unitru.edu.pe', '$2a$10$WIJEFhvFbf5JcxVSHvevROXEIkk7EM6rFPfUIPQvyCoXfC.FxPjRm', 'docente', 'Ingeniería', 'Sistemas', TRUE);

INSERT INTO parametros_sistema (clave, valor, descripcion) VALUES
('institucion_nombre', 'Universidad Nacional de Trujillo', 'Nombre de la institución'),
('version_sgc', '1.0.0', 'Versión actual del sistema'),
('version_mapa_actual', '1', 'Versión actual del mapa de procesos');

-- ============================================================
-- FUNCIONES DE AUDITORÍA
-- ============================================================

CREATE OR REPLACE FUNCTION actualizar_modificado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modificado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas principales
DO $$
DECLARE
    tabla TEXT;
    tablas TEXT[] := ARRAY['usuarios', 'documentos', 'procesos', 'actividades_proceso', 'autoevaluaciones', 'evaluaciones_criterio', 'planes_auditoria', 'hallazgos', 'capas', 'riesgos', 'indicadores', 'encuestas'];
BEGIN
    FOREACH tabla IN ARRAY tablas
    LOOP
        EXECUTE format('CREATE TRIGGER trg_%I_modificado BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION actualizar_modificado_en()', tabla, tabla);
    END LOOP;
END $$;
