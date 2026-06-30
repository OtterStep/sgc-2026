//backend/src/models/index.js
import { sequelize } from '../config/database.js';
import { DataTypes, UUIDV4 } from 'sequelize';

// ==========================================
// USUARIO
// ==========================================
export const Usuario = sequelize.define('usuarios', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  codigo: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  nombres: { type: DataTypes.STRING(100), allowNull: false },
  apellidos: { type: DataTypes.STRING(100), allowNull: false },
  correo: { type: DataTypes.STRING(150), unique: true, allowNull: false },
  contrasena_hash: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.STRING(50), allowNull: false },
  facultad: DataTypes.STRING(100),
  escuela: DataTypes.STRING(100),
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  ultimo_acceso: DataTypes.DATE,
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'usuarios', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// TIPO DOCUMENTO
// ==========================================
export const TipoDocumento = sequelize.define('tipos_documento', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  descripcion: DataTypes.TEXT,
  requiere_aprobacion: { type: DataTypes.BOOLEAN, defaultValue: true },
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'tipos_documento', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// DOCUMENTO
// ==========================================
export const Documento = sequelize.define('documentos', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  codigo: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  titulo: { type: DataTypes.STRING(255), allowNull: false },
  tipo_documento_id: { type: DataTypes.INTEGER, allowNull: false },
  proceso_id: DataTypes.UUID,
  version_actual: { type: DataTypes.INTEGER, defaultValue: 1 },
  estado: {
    type: DataTypes.ENUM(
      'borrador',
      'en_revision',
      'aprobado',
      'obsoleto',
      'archivado'
    ),
    defaultValue: 'borrador'
  },
  contenido: DataTypes.TEXT,
  archivo_url: DataTypes.STRING(500),
  fecha_vigencia: DataTypes.DATEONLY,
  fecha_revision: DataTypes.DATEONLY,
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'documentos', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// VERSION DOCUMENTO
// ==========================================
export const VersionDocumento = sequelize.define('versiones_documento', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  documento_id: { type: DataTypes.UUID, allowNull: false },
  numero_version: { type: DataTypes.INTEGER, allowNull: false },
  cambios_descripcion: { type: DataTypes.TEXT, allowNull: false },
  contenido: DataTypes.TEXT,
  archivo_url: DataTypes.STRING(500),
  estado: { type: DataTypes.STRING(20), defaultValue: 'borrador' },
  creado_por: DataTypes.UUID,
}, { tableName: 'versiones_documento', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: false });

// ==========================================
// APROBACION DOCUMENTO
// ==========================================
export const AprobacionDocumento = sequelize.define('aprobaciones_documento', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  documento_id: { type: DataTypes.UUID, allowNull: false },
  version_id: DataTypes.UUID,
  aprobador_id: { type: DataTypes.UUID, allowNull: false },
  accion: { type: DataTypes.STRING(20), allowNull: false },
  comentario: DataTypes.TEXT,
  fecha_aprobacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'aprobaciones_documento', schema: 'sgc', timestamps: false });

// ==========================================
// MACROPROCESO
// ==========================================
export const Macroproceso = sequelize.define('macroprocesos', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  codigo: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: DataTypes.TEXT,
  responsable_id: DataTypes.UUID,
  tipo: DataTypes.STRING(30),
  clasificacion_mapa: DataTypes.STRING(20),
  estado: { type: DataTypes.BOOLEAN, defaultValue: true },
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'macroprocesos', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// PROCESO
// ==========================================
export const Proceso = sequelize.define('procesos', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  macroproceso_id: DataTypes.UUID,
  codigo: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  objetivo: DataTypes.TEXT,
  alcance: DataTypes.TEXT,
  responsable_id: DataTypes.UUID,
  estado: { type: DataTypes.STRING(20), defaultValue: 'activo' },
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'procesos', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// ACTIVIDAD PROCESO
// ==========================================
export const ActividadProceso = sequelize.define('actividades_proceso', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  proceso_id: { type: DataTypes.UUID, allowNull: false },
  codigo: { type: DataTypes.STRING(20), allowNull: false },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  descripcion: DataTypes.TEXT,
  secuencia: { type: DataTypes.INTEGER, allowNull: false },
  responsable_id: DataTypes.UUID,
  entradas: DataTypes.TEXT,
  salidas: DataTypes.TEXT,
  indicadores: DataTypes.TEXT,
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'actividades_proceso', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// FLUJO TRABAJO
// ==========================================
export const FlujoTrabajo = sequelize.define('flujos_trabajo', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  proceso_id: { type: DataTypes.UUID, allowNull: false },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  definicion_json: { type: DataTypes.JSONB, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  creado_por: DataTypes.UUID,
}, { tableName: 'flujos_trabajo', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: false });

// ==========================================
// VERSION MAPA DE PROCESOS
// ==========================================
export const VersionMapa = sequelize.define('versiones_mapa', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  numero_version: { type: DataTypes.INTEGER, allowNull: false },
  cambios_descripcion: { type: DataTypes.TEXT, allowNull: false },
  datos: { type: DataTypes.JSONB, allowNull: false },
  activa: { type: DataTypes.BOOLEAN, defaultValue: false },
  creado_por: DataTypes.UUID,
}, { tableName: 'versiones_mapa', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: false });

// ==========================================
// ESTANDAR ACREDITACION
// ==========================================
export const EstandarAcreditacion = sequelize.define('estandares_acreditacion', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  codigo: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  organizacion: DataTypes.STRING(100),
  descripcion: DataTypes.TEXT,
  vigente_desde: DataTypes.DATEONLY,
  vigente_hasta: DataTypes.DATEONLY,
  creado_por: DataTypes.UUID,
}, { tableName: 'estandares_acreditacion', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// FACTOR CRITERIO
// ==========================================
export const FactorCriterio = sequelize.define('factores_criterio', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  estandar_id: { type: DataTypes.UUID, allowNull: false },
  codigo: { type: DataTypes.STRING(20), allowNull: false },
  nombre: { type: DataTypes.STRING(255), allowNull: false },
  descripcion: DataTypes.TEXT,
  peso: DataTypes.DECIMAL(5, 2),
  creado_por: DataTypes.UUID,
}, { tableName: 'factores_criterio', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// AUTOEVALUACION
// ==========================================
export const Autoevaluacion = sequelize.define('autoevaluaciones', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  estandar_id: { type: DataTypes.UUID, allowNull: false },
  periodo: { type: DataTypes.STRING(20), allowNull: false },
  fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_fin: DataTypes.DATEONLY,
  estado: { type: DataTypes.STRING(20), defaultValue: 'en_proceso' },
  puntaje_total: DataTypes.DECIMAL(5, 2),
  creado_por: DataTypes.UUID,
}, { tableName: 'autoevaluaciones', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// EVALUACION CRITERIO
// ==========================================
export const EvaluacionCriterio = sequelize.define('evaluaciones_criterio', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  autoevaluacion_id: { type: DataTypes.UUID, allowNull: false },
  factor_id: { type: DataTypes.UUID, allowNull: false },
  cumplimiento: DataTypes.STRING(20),
  puntaje: DataTypes.DECIMAL(5, 2),
  evidencias: DataTypes.TEXT,
  observaciones: DataTypes.TEXT,
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'evaluaciones_criterio', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// PLAN AUDITORIA
// ==========================================
export const PlanAuditoria = sequelize.define('planes_auditoria', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  codigo: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  tipo: DataTypes.STRING(30),
  alcance: DataTypes.TEXT,
  fecha_programada: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_ejecucion: DataTypes.DATEONLY,
  estado: { type: DataTypes.STRING(20), defaultValue: 'planificado' },
  lider_id: DataTypes.UUID,
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'planes_auditoria', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// EQUIPO AUDITORIA
// ==========================================
export const EquipoAuditoria = sequelize.define('equipos_auditoria', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  plan_id: { type: DataTypes.UUID, allowNull: false },
  auditor_id: { type: DataTypes.UUID, allowNull: false },
  rol_en_equipo: DataTypes.STRING(30),
}, { tableName: 'equipos_auditoria', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: false });

// ==========================================
// HALLAZGO
// ==========================================
export const Hallazgo = sequelize.define('hallazgos', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  plan_id: { type: DataTypes.UUID, allowNull: false },
  tipo: DataTypes.STRING(30),
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  area_proceso_id: DataTypes.UUID,
  gravedad: DataTypes.STRING(20),
  estado: { type: DataTypes.STRING(20), defaultValue: 'abierto' },
  fecha_cierre: DataTypes.DATEONLY,
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'hallazgos', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// CAPA
// ==========================================
export const Capa = sequelize.define('capas', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  codigo: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  tipo: { type: DataTypes.STRING(20), allowNull: false },
  hallazgo_id: DataTypes.UUID,
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  causa_raiz: DataTypes.TEXT,
  accion_propuesta: { type: DataTypes.TEXT, allowNull: false },
  responsable_id: DataTypes.UUID,
  fecha_implementacion: DataTypes.DATEONLY,
  fecha_verificacion: DataTypes.DATEONLY,
  evidencia_url: DataTypes.STRING(500),
  estado: { type: DataTypes.STRING(20), defaultValue: 'registrada' },
  efectividad: DataTypes.STRING(20),
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'capas', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// SEGUIMIENTO CAPA
// ==========================================
export const SeguimientoCapa = sequelize.define('seguimientos_capa', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  capa_id: { type: DataTypes.UUID, allowNull: false },
  fecha_seguimiento: { type: DataTypes.DATEONLY, allowNull: false },
  avance: { type: DataTypes.DECIMAL(5, 2), validate: { min: 0, max: 100 } },
  observaciones: DataTypes.TEXT,
  creado_por: DataTypes.UUID,
}, { tableName: 'seguimientos_capa', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: false });

// ==========================================
// RIESGO
// ==========================================
export const Riesgo = sequelize.define('riesgos', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  codigo: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  descripcion: DataTypes.TEXT,
  proceso_id: DataTypes.UUID,
  categoria: DataTypes.STRING(50),
  probabilidad: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  impacto: { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  nivel_riesgo: {
    type: DataTypes.VIRTUAL(DataTypes.STRING(20)),
    get() {
      const prob = this.getDataValue('probabilidad') || 0;
      const imp = this.getDataValue('impacto') || 0;
      const prod = prob * imp;
      if (prod <= 4) return 'bajo';
      if (prod <= 9) return 'medio';
      if (prod <= 14) return 'alto';
      return 'critico';
    }
  },
  estado: { type: DataTypes.STRING(20), defaultValue: 'activo' },
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'riesgos', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// PLAN MITIGACION
// ==========================================
export const PlanMitigacion = sequelize.define('planes_mitigacion', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  riesgo_id: { type: DataTypes.UUID, allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  acciones: DataTypes.TEXT,
  responsable_id: DataTypes.UUID,
  fecha_inicio: DataTypes.DATEONLY,
  fecha_fin: DataTypes.DATEONLY,
  estado: { type: DataTypes.STRING(20), defaultValue: 'planificado' },
  creado_por: DataTypes.UUID,
}, { tableName: 'planes_mitigacion', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: false });

// ==========================================
// INDICADOR
// ==========================================
export const Indicador = sequelize.define('indicadores', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  codigo: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  descripcion: DataTypes.TEXT,
  proceso_id: DataTypes.UUID,
  tipo: DataTypes.STRING(30),
  formula_calculo: DataTypes.TEXT,
  unidad_medida: DataTypes.STRING(50),
  meta: DataTypes.DECIMAL(10, 2),
  frecuencia_medicion: DataTypes.STRING(20),
  estado: { type: DataTypes.STRING(20), defaultValue: 'activo' },
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'indicadores', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// MEDICION INDICADOR
// ==========================================
export const MedicionIndicador = sequelize.define('mediciones_indicador', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  indicador_id: { type: DataTypes.UUID, allowNull: false },
  periodo: { type: DataTypes.STRING(20), allowNull: false },
  fecha_medicion: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  valor_real: DataTypes.DECIMAL(10, 2),
  valor_esperado: DataTypes.DECIMAL(10, 2),
  cumplimiento: DataTypes.DECIMAL(5, 2),
  analisis_tendencia: DataTypes.TEXT,
  creado_por: DataTypes.UUID,
}, { tableName: 'mediciones_indicador', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: false });

// ==========================================
// PERIODO ACADEMICO
// ==========================================
export const PeriodoAcademico = sequelize.define('periodos_academicos', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  codigo: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false },
  fecha_fin: { type: DataTypes.DATEONLY, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  creado_por: DataTypes.UUID,
}, { tableName: 'periodos_academicos', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: false });

// ==========================================
// ENCUESTA
// ==========================================
export const Encuesta = sequelize.define('encuestas', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  codigo: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  titulo: { type: DataTypes.STRING(255), allowNull: false },
  descripcion: DataTypes.TEXT,
  dirigido_a: DataTypes.STRING(30),
  fecha_inicio: DataTypes.DATEONLY,
  fecha_fin: DataTypes.DATEONLY,
  anonima: { type: DataTypes.BOOLEAN, defaultValue: true },
  estado: { type: DataTypes.STRING(20), defaultValue: 'borrador' },
  creado_por: DataTypes.UUID,
  modificado_por: DataTypes.UUID,
}, { tableName: 'encuestas', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// PREGUNTA ENCUESTA
// ==========================================
export const PreguntaEncuesta = sequelize.define('preguntas_encuesta', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  encuesta_id: { type: DataTypes.UUID, allowNull: false },
  texto: { type: DataTypes.TEXT, allowNull: false },
  tipo: DataTypes.STRING(30),
  orden: { type: DataTypes.INTEGER, allowNull: false },
  obligatoria: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'preguntas_encuesta', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: false });

// ==========================================
// RESPUESTA ENCUESTA
// ==========================================
export const RespuestaEncuesta = sequelize.define('respuestas_encuesta', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: UUIDV4 },
  encuesta_id: { type: DataTypes.UUID, allowNull: false },
  pregunta_id: { type: DataTypes.UUID, allowNull: false },
  usuario_id: DataTypes.UUID,
  valor_texto: DataTypes.TEXT,
  valor_numerico: DataTypes.DECIMAL(10, 2),
}, { tableName: 'respuestas_encuesta', schema: 'sgc', timestamps: true, createdAt: 'enviado_en', updatedAt: false });

// ==========================================
// PARAMETRO SISTEMA
// ==========================================
export const ParametroSistema = sequelize.define('parametros_sistema', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  clave: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  valor: { type: DataTypes.TEXT, allowNull: false },
  descripcion: DataTypes.TEXT,
}, { tableName: 'parametros_sistema', schema: 'sgc', timestamps: true, createdAt: 'creado_en', updatedAt: 'modificado_en' });

// ==========================================
// RELACIONES
// ==========================================
Macroproceso.belongsTo(Usuario, { as: 'responsable', foreignKey: 'responsable_id' });
Proceso.belongsTo(Macroproceso, { foreignKey: 'macroproceso_id', as: 'macroproceso' });
Proceso.belongsTo(Usuario, { as: 'responsable', foreignKey: 'responsable_id' });
Macroproceso.hasMany(Proceso, { foreignKey: 'macroproceso_id', as: 'procesos' });
Proceso.hasMany(ActividadProceso, { foreignKey: 'proceso_id', as: 'actividades' });
Documento.belongsTo(Proceso, { foreignKey: 'proceso_id', as: 'proceso' });
Documento.belongsTo(TipoDocumento, { foreignKey: 'tipo_documento_id', as: 'tipo' });
ActividadProceso.belongsTo(Proceso, { foreignKey: 'proceso_id', as: 'proceso' });

// Relaciones Documento
Documento.hasMany(VersionDocumento, { foreignKey: 'documento_id', as: 'versiones' });
VersionDocumento.belongsTo(Documento, { foreignKey: 'documento_id', as: 'documento' });
Documento.hasMany(AprobacionDocumento, { foreignKey: 'documento_id', as: 'aprobaciones' });
AprobacionDocumento.belongsTo(Documento, { foreignKey: 'documento_id', as: 'documento' });
AprobacionDocumento.belongsTo(Usuario, { as: 'aprobador', foreignKey: 'aprobador_id' });
// agregar en models/index.js, junto a las demás relaciones de Documento
VersionDocumento.belongsTo(Usuario, { as: 'creadoPor', foreignKey: 'creado_por' });

// Relaciones VersionMapa
VersionMapa.belongsTo(Usuario, { as: 'creadoPor', foreignKey: 'creado_por' });

// Relaciones Flujo Trabajo
FlujoTrabajo.belongsTo(Proceso, { foreignKey: 'proceso_id', as: 'proceso' });
Proceso.hasMany(FlujoTrabajo, { foreignKey: 'proceso_id', as: 'flujos' });

PlanAuditoria.belongsTo(Usuario, { as: 'lider', foreignKey: 'lider_id' });
PlanAuditoria.hasMany(Hallazgo, { foreignKey: 'plan_id', as: 'hallazgos' });
Hallazgo.belongsTo(PlanAuditoria, { foreignKey: 'plan_id', as: 'plan' });
Hallazgo.belongsTo(Proceso, { as: 'area_proceso', foreignKey: 'area_proceso_id' });

// Relaciones Equipo Auditoria
EquipoAuditoria.belongsTo(PlanAuditoria, { foreignKey: 'plan_id', as: 'plan' });
EquipoAuditoria.belongsTo(Usuario, { as: 'auditor', foreignKey: 'auditor_id' });
PlanAuditoria.hasMany(EquipoAuditoria, { foreignKey: 'plan_id', as: 'equipo' });

Capa.belongsTo(Hallazgo, { foreignKey: 'hallazgo_id', as: 'hallazgo' });
Capa.belongsTo(Usuario, { as: 'responsable', foreignKey: 'responsable_id' });

// Relaciones Seguimiento CAPA
Capa.hasMany(SeguimientoCapa, { foreignKey: 'capa_id', as: 'seguimientos' });
SeguimientoCapa.belongsTo(Capa, { foreignKey: 'capa_id', as: 'capa' });
SeguimientoCapa.belongsTo(Usuario, { as: 'creadoPor', foreignKey: 'creado_por' });

// Relaciones Riesgo y Plan Mitigacion
Riesgo.belongsTo(Proceso, { foreignKey: 'proceso_id', as: 'proceso' });
Riesgo.hasMany(PlanMitigacion, { foreignKey: 'riesgo_id', as: 'planesMitigacion' });
PlanMitigacion.belongsTo(Riesgo, { foreignKey: 'riesgo_id', as: 'riesgo' });
PlanMitigacion.belongsTo(Usuario, { as: 'responsable', foreignKey: 'responsable_id' });

Indicador.belongsTo(Proceso, { foreignKey: 'proceso_id', as: 'proceso' });
Indicador.hasMany(MedicionIndicador, { foreignKey: 'indicador_id', as: 'mediciones' });
MedicionIndicador.belongsTo(Indicador, { foreignKey: 'indicador_id', as: 'indicador' });
PeriodoAcademico.belongsTo(Usuario, { as: 'creadoPor', foreignKey: 'creado_por' });

Autoevaluacion.belongsTo(EstandarAcreditacion, { foreignKey: 'estandar_id', as: 'estandar' });
EvaluacionCriterio.belongsTo(Autoevaluacion, { foreignKey: 'autoevaluacion_id', as: 'autoevaluacion' });
EvaluacionCriterio.belongsTo(FactorCriterio, { foreignKey: 'factor_id', as: 'factor' });

PreguntaEncuesta.belongsTo(Encuesta, { foreignKey: 'encuesta_id', as: 'encuesta' });
RespuestaEncuesta.belongsTo(Encuesta, { foreignKey: 'encuesta_id', as: 'encuesta' });
RespuestaEncuesta.belongsTo(PreguntaEncuesta, { foreignKey: 'pregunta_id', as: 'pregunta' });
RespuestaEncuesta.belongsTo(Usuario, { as: 'usuario', foreignKey: 'usuario_id' });

// Relaciones adicionales requeridas por controladores
Documento.belongsTo(Usuario, { as: 'creadoPor', foreignKey: 'creado_por' });
Hallazgo.belongsTo(Usuario, { as: 'creadoPor', foreignKey: 'creado_por' });
Autoevaluacion.hasMany(EvaluacionCriterio, { foreignKey: 'autoevaluacion_id', as: 'evaluaciones' });
ActividadProceso.belongsTo(Usuario, { as: 'responsable', foreignKey: 'responsable_id' });
Encuesta.hasMany(PreguntaEncuesta, { foreignKey: 'encuesta_id', as: 'preguntas' });
