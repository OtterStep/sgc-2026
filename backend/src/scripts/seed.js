import { sequelize } from '../config/database.js';
import {
  Usuario,
  Macroproceso,
  Proceso,
  ActividadProceso,
  FlujoTrabajo,
  EstandarAcreditacion,
  FactorCriterio,
  Autoevaluacion,
  EvaluacionCriterio,
  PlanAuditoria,
  EquipoAuditoria,
  Hallazgo,
  Capa,
  SeguimientoCapa,
  Riesgo,
  PlanMitigacion,
  Indicador,
  MedicionIndicador,
  PeriodoAcademico,
  TipoDocumento,
  Documento,
  VersionDocumento,
  Encuesta,
  PreguntaEncuesta,
  RespuestaEncuesta,
} from '../models/index.js';

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado');

    const usuarios = await Usuario.findAll();
    const admin = usuarios.find(u => u.rol === 'admin');
    const gestor = usuarios.find(u => u.rol === 'gestor_calidad');
    const auditor = usuarios.find(u => u.rol === 'auditor');
    const docente = usuarios.find(u => u.rol === 'docente');
    const estudiante = usuarios.find(u => u.rol === 'estudiante');

    if (!admin || !gestor || !auditor) {
      console.error('❌ Faltan usuarios base (admin, gestor_calidad, auditor). Ejecuta init.sql primero.');
      process.exit(1);
    }

    // ==========================================
    // 1. PERIODOS ACADEMICOS
    // ==========================================
    const periodosData = [
      { codigo: '2024-I', nombre: 'Semestre 2024-I', fecha_inicio: '2024-03-01', fecha_fin: '2024-07-31', activo: false, creado_por: admin.id },
      { codigo: '2024-II', nombre: 'Semestre 2024-II', fecha_inicio: '2024-08-01', fecha_fin: '2024-12-31', activo: false, creado_por: admin.id },
      { codigo: '2025-I', nombre: 'Semestre 2025-I', fecha_inicio: '2025-03-01', fecha_fin: '2025-07-31', activo: true, creado_por: admin.id },
    ];
    for (const d of periodosData) {
      await PeriodoAcademico.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
    }
    console.log('✅ Periodos académicos creados');

    // ==========================================
    // 2. MACROPROCESOS (con clasificacion_mapa)
    // ==========================================
    const macrosData = [
      { codigo: 'MP-EST-01', nombre: 'Direccionamiento Estratégico', descripcion: 'Define el rumbo institucional y las políticas de calidad', responsable_id: admin.id, tipo: 'estrategico', clasificacion_mapa: 'estrategico', estado: true, creado_por: admin.id },
      { codigo: 'MP-EST-02', nombre: 'Planeación Institucional', descripcion: 'Planificación estratégica y operativa de la universidad', responsable_id: gestor.id, tipo: 'estrategico', clasificacion_mapa: 'estrategico', estado: true, creado_por: admin.id },
      { codigo: 'MP-MIS-01', nombre: 'Formación Profesional', descripcion: 'Gestión académica y formación de pregrado y posgrado', responsable_id: gestor.id, tipo: 'misional', clasificacion_mapa: 'misional', estado: true, creado_por: admin.id },
      { codigo: 'MP-MIS-02', nombre: 'Investigación e Innovación', descripcion: 'Fomento de la investigación científica y la innovación tecnológica', responsable_id: docente.id, tipo: 'misional', clasificacion_mapa: 'misional', estado: true, creado_por: admin.id },
      { codigo: 'MP-SOP-01', nombre: 'Gestión Administrativa', descripcion: 'Soporte administrativo, financiero y de recursos humanos', responsable_id: gestor.id, tipo: 'apoyo', clasificacion_mapa: 'soporte', estado: true, creado_por: admin.id },
      { codigo: 'MP-SOP-02', nombre: 'Gestión Documental y Calidad', descripcion: 'Administración del SGC y control documental', responsable_id: gestor.id, tipo: 'apoyo', clasificacion_mapa: 'soporte', estado: true, creado_por: admin.id },
    ];
    const macroMap = {};
    for (const d of macrosData) {
      const [m] = await Macroproceso.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
      macroMap[d.codigo] = m;
    }
    console.log('✅ Macroprocesos creados');

    // ==========================================
    // 3. PROCESOS
    // ==========================================
    const procesosData = [
      { codigo: 'P-001', nombre: 'Planificación Estratégica', objetivo: 'Elaborar y dar seguimiento al PEI', alcance: 'Institucional', macroproceso_id: macroMap['MP-EST-01'].id, responsable_id: admin.id, estado: 'activo', creado_por: admin.id },
      { codigo: 'P-002', nombre: 'Gestión de la Calidad', objetivo: 'Implementar y mantener el SGC', alcance: 'Toda la UNT', macroproceso_id: macroMap['MP-EST-01'].id, responsable_id: gestor.id, estado: 'activo', creado_por: admin.id },
      { codigo: 'P-003', nombre: 'Gestión Curricular', objetivo: 'Diseñar y actualizar planes de estudio', alcance: 'Facultades y Escuelas', macroproceso_id: macroMap['MP-MIS-01'].id, responsable_id: docente.id, estado: 'activo', creado_por: admin.id },
      { codigo: 'P-004', nombre: 'Admisión y Matrícula', objetivo: 'Gestionar el ingreso de estudiantes', alcance: 'Proceso de admisión', macroproceso_id: macroMap['MP-MIS-01'].id, responsable_id: gestor.id, estado: 'activo', creado_por: admin.id },
      { codigo: 'P-005', nombre: 'Gestión de la Docencia', objetivo: 'Ejecutar actividades académicas', alcance: 'Semestre académico', macroproceso_id: macroMap['MP-MIS-01'].id, responsable_id: docente.id, estado: 'activo', creado_por: admin.id },
      { codigo: 'P-006', nombre: 'Gestión de Proyectos de Investigación', objetivo: 'Fomentar y gestionar proyectos de investigación', alcance: 'Investigación', macroproceso_id: macroMap['MP-MIS-02'].id, responsable_id: docente.id, estado: 'activo', creado_por: admin.id },
      { codigo: 'P-007', nombre: 'Gestión de Recursos Humanos', objetivo: 'Administrar el personal', alcance: 'Administrativo y docente', macroproceso_id: macroMap['MP-SOP-01'].id, responsable_id: gestor.id, estado: 'activo', creado_por: admin.id },
      { codigo: 'P-008', nombre: 'Gestión Financiera', objetivo: 'Administrar recursos económicos', alcance: 'Presupuesto', macroproceso_id: macroMap['MP-SOP-01'].id, responsable_id: admin.id, estado: 'activo', creado_por: admin.id },
      { codigo: 'P-009', nombre: 'Control Documental', objetivo: 'Gestionar documentos del SGC', alcance: 'Documentos del sistema', macroproceso_id: macroMap['MP-SOP-02'].id, responsable_id: gestor.id, estado: 'activo', creado_por: admin.id },
      { codigo: 'P-010', nombre: 'Auditorías Internas', objetivo: 'Programar y ejecutar auditorías', alcance: 'Procesos del SGC', macroproceso_id: macroMap['MP-SOP-02'].id, responsable_id: auditor.id, estado: 'activo', creado_por: admin.id },
    ];
    const procMap = {};
    for (const d of procesosData) {
      const [p] = await Proceso.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
      procMap[d.codigo] = p;
    }
    console.log('✅ Procesos creados');

    // ==========================================
    // 4. ACTIVIDADES POR PROCESO
    // ==========================================
    const activData = [
      { proceso_id: procMap['P-001'].id, codigo: 'ACT-001', nombre: 'Elaboración del PEI', descripcion: 'Redactar el plan estratégico', secuencia: 1, responsable_id: admin.id },
      { proceso_id: procMap['P-001'].id, codigo: 'ACT-002', nombre: 'Seguimiento de indicadores', descripcion: 'Monitorear cumplimiento', secuencia: 2, responsable_id: gestor.id },
      { proceso_id: procMap['P-002'].id, codigo: 'ACT-003', nombre: 'Revisión del SGC', descripcion: 'Auditar el sistema', secuencia: 1, responsable_id: auditor.id },
      { proceso_id: procMap['P-002'].id, codigo: 'ACT-004', nombre: 'Actualización de documentos', descripcion: 'Revisar y aprobar documentos', secuencia: 2, responsable_id: gestor.id },
      { proceso_id: procMap['P-003'].id, codigo: 'ACT-005', nombre: 'Diseño curricular', descripcion: 'Elaborar mallas curriculares', secuencia: 1, responsable_id: docente.id },
      { proceso_id: procMap['P-003'].id, codigo: 'ACT-006', nombre: 'Evaluación curricular', descripcion: 'Evaluar planes de estudio', secuencia: 2, responsable_id: docente.id },
      { proceso_id: procMap['P-004'].id, codigo: 'ACT-007', nombre: 'Proceso de admisión', descripcion: 'Organizar examen de admisión', secuencia: 1, responsable_id: gestor.id },
      { proceso_id: procMap['P-004'].id, codigo: 'ACT-008', nombre: 'Matrícula académica', descripcion: 'Registrar estudiantes', secuencia: 2, responsable_id: gestor.id },
      { proceso_id: procMap['P-005'].id, codigo: 'ACT-009', nombre: 'Programación académica', descripcion: 'Asignar horarios y aulas', secuencia: 1, responsable_id: docente.id },
      { proceso_id: procMap['P-005'].id, codigo: 'ACT-010', nombre: 'Evaluación del aprendizaje', descripcion: 'Registrar notas', secuencia: 2, responsable_id: docente.id },
      { proceso_id: procMap['P-006'].id, codigo: 'ACT-011', nombre: 'Convocatoria de proyectos', descripcion: 'Publicar y recepcionar proyectos', secuencia: 1, responsable_id: docente.id },
      { proceso_id: procMap['P-006'].id, codigo: 'ACT-012', nombre: 'Seguimiento de proyectos', descripcion: 'Monitorear avances', secuencia: 2, responsable_id: docente.id },
      { proceso_id: procMap['P-007'].id, codigo: 'ACT-013', nombre: 'Contratación de personal', descripcion: 'Procesos de selección', secuencia: 1, responsable_id: gestor.id },
      { proceso_id: procMap['P-008'].id, codigo: 'ACT-014', nombre: 'Elaboración de presupuesto', descripcion: 'Formular presupuesto anual', secuencia: 1, responsable_id: admin.id },
      { proceso_id: procMap['P-009'].id, codigo: 'ACT-015', nombre: 'Control de documentos', descripcion: 'Codificar y archivar documentos', secuencia: 1, responsable_id: gestor.id },
      { proceso_id: procMap['P-010'].id, codigo: 'ACT-016', nombre: 'Programación de auditorías', descripcion: 'Planificar auditorías anuales', secuencia: 1, responsable_id: auditor.id },
      { proceso_id: procMap['P-010'].id, codigo: 'ACT-017', nombre: 'Ejecución de auditorías', descripcion: 'Realizar hallazgos y reportes', secuencia: 2, responsable_id: auditor.id },
    ];
    for (const d of activData) {
      await ActividadProceso.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
    }
    console.log('✅ Actividades creadas');

    // ==========================================
    // 5. FLUJOS DE TRABAJO
    // ==========================================
    const flujoData = [
      { proceso_id: procMap['P-002'].id, nombre: 'Flujo de Control Documental', definicion_json: { nodes: [{ id: '1', type: 'start', label: 'Inicio' }, { id: '2', type: 'task', label: 'Crear documento' }, { id: '3', type: 'task', label: 'Revisar' }, { id: '4', type: 'end', label: 'Aprobar' }], edges: [{ from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '4' }] }, activo: true, creado_por: gestor.id },
      { proceso_id: procMap['P-010'].id, nombre: 'Flujo de Auditoría', definicion_json: { nodes: [{ id: '1', type: 'start', label: 'Planificar' }, { id: '2', type: 'task', label: 'Ejecutar' }, { id: '3', type: 'task', label: 'Informar' }, { id: '4', type: 'end', label: 'Cerrar' }], edges: [{ from: '1', to: '2' }, { from: '2', to: '3' }, { from: '3', to: '4' }] }, activo: true, creado_por: auditor.id },
    ];
    for (const d of flujoData) {
      await FlujoTrabajo.findOrCreate({ where: { nombre: d.nombre }, defaults: d });
    }
    console.log('✅ Flujos de trabajo creados');

    // ==========================================
    // 6. ESTANDARES ACREDITACION
    // ==========================================
    const estData = [
      { codigo: 'ISO-21001', nombre: 'ISO 21001:2018 - Sistemas de Gestión para Organizaciones Educativas', organizacion: 'ISO', descripcion: 'Estándar internacional para gestión educativa', vigente_desde: '2023-01-01', creado_por: admin.id },
      { codigo: 'SUNEDU-MB', nombre: 'Modelo de Licenciamiento SUNEDU', organizacion: 'SUNEDU', descripcion: 'Condiciones básicas de calidad', vigente_desde: '2020-01-01', creado_por: admin.id },
      { codigo: 'SINEACE-MP', nombre: 'Modelo de Calidad SINEACE', organizacion: 'SINEACE', descripcion: 'Acreditación de programas de pregrado', vigente_desde: '2022-06-01', creado_por: admin.id },
    ];
    const estMap = {};
    for (const d of estData) {
      const [e] = await EstandarAcreditacion.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
      estMap[d.codigo] = e;
    }
    console.log('✅ Estándares de acreditación creados');

    // ==========================================
    // 7. FACTORES CRITERIO
    // ==========================================
    const factorData = [
      { estandar_id: estMap['ISO-21001'].id, codigo: 'F-ISO-01', nombre: 'Liderazgo y compromiso', descripcion: 'Alta dirección', peso: 15.00, creado_por: admin.id },
      { estandar_id: estMap['ISO-21001'].id, codigo: 'F-ISO-02', nombre: 'Planificación', descripcion: 'Objetivos y planificación', peso: 15.00, creado_por: admin.id },
      { estandar_id: estMap['ISO-21001'].id, codigo: 'F-ISO-03', nombre: 'Operación', descripcion: 'Ejecución de servicios educativos', peso: 30.00, creado_por: admin.id },
      { estandar_id: estMap['ISO-21001'].id, codigo: 'F-ISO-04', nombre: 'Evaluación del desempeño', descripcion: 'Seguimiento y medición', peso: 20.00, creado_por: admin.id },
      { estandar_id: estMap['SUNEDU-MB'].id, codigo: 'F-SUN-01', nombre: 'Infraestructura', descripcion: 'Instalaciones y equipamiento', peso: 25.00, creado_por: admin.id },
      { estandar_id: estMap['SUNEDU-MB'].id, codigo: 'F-SUN-02', nombre: 'Plan de estudios', descripcion: 'Malla curricular', peso: 30.00, creado_por: admin.id },
      { estandar_id: estMap['SUNEDU-MB'].id, codigo: 'F-SUN-03', nombre: 'Investigación', descripcion: 'Producción científica', peso: 20.00, creado_por: admin.id },
      { estandar_id: estMap['SINEACE-MP'].id, codigo: 'F-SIN-01', nombre: 'Gestión académica', descripcion: 'Procesos académicos', peso: 25.00, creado_por: admin.id },
      { estandar_id: estMap['SINEACE-MP'].id, codigo: 'F-SIN-02', nombre: 'Docentes', descripcion: 'Calificación y desempeño', peso: 25.00, creado_por: admin.id },
      { estandar_id: estMap['SINEACE-MP'].id, codigo: 'F-SIN-03', nombre: 'Graduados e inserción', descripcion: 'Seguimiento de egresados', peso: 15.00, creado_por: admin.id },
    ];
    const factorMap = {};
    for (const d of factorData) {
      const [f] = await FactorCriterio.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
      factorMap[d.codigo] = f;
    }
    console.log('✅ Factores criterio creados');

    // ==========================================
    // 8. AUTOEVALUACIONES
    // ==========================================
    const autoData = [
      { estandar_id: estMap['ISO-21001'].id, periodo: '2024-II', fecha_inicio: '2024-08-01', fecha_fin: '2024-11-30', estado: 'completada', puntaje_total: 82.50, creado_por: gestor.id },
      { estandar_id: estMap['SUNEDU-MB'].id, periodo: '2024-II', fecha_inicio: '2024-08-01', fecha_fin: '2024-10-30', estado: 'completada', puntaje_total: 91.00, creado_por: gestor.id },
      { estandar_id: estMap['SINEACE-MP'].id, periodo: '2024-II', fecha_inicio: '2024-09-01', fecha_fin: '2024-12-15', estado: 'completada', puntaje_total: 76.30, creado_por: gestor.id },
      { estandar_id: estMap['ISO-21001'].id, periodo: '2025-I', fecha_inicio: '2025-03-01', estado: 'en_proceso', creado_por: gestor.id },
    ];
    const autoMap = {};
    for (const d of autoData) {
      const [a] = await Autoevaluacion.findOrCreate({ where: { periodo: d.periodo, estandar_id: d.estandar_id }, defaults: d });
      autoMap[`${d.estandar_id}-${d.periodo}`] = a;
    }
    console.log('✅ Autoevaluaciones creadas');

    // ==========================================
    // 9. EVALUACIONES CRITERIO
    // ==========================================
    const evalData = [
      { autoevaluacion_id: autoMap[`${estMap['ISO-21001'].id}-2024-II`].id, factor_id: factorMap['F-ISO-01'].id, cumplimiento: 'cumple', puntaje: 14.00, evidencias: 'Documentos de liderazgo', creado_por: gestor.id },
      { autoevaluacion_id: autoMap[`${estMap['ISO-21001'].id}-2024-II`].id, factor_id: factorMap['F-ISO-02'].id, cumplimiento: 'cumple_parcial', puntaje: 11.00, evidencias: 'Plan operativo', creado_por: gestor.id },
      { autoevaluacion_id: autoMap[`${estMap['ISO-21001'].id}-2024-II`].id, factor_id: factorMap['F-ISO-03'].id, cumplimiento: 'cumple', puntaje: 28.00, evidencias: 'Registros académicos', creado_por: gestor.id },
      { autoevaluacion_id: autoMap[`${estMap['ISO-21001'].id}-2024-II`].id, factor_id: factorMap['F-ISO-04'].id, cumplimiento: 'cumple_parcial', puntaje: 15.00, evidencias: 'Indicadores', creado_por: gestor.id },
      { autoevaluacion_id: autoMap[`${estMap['SUNEDU-MB'].id}-2024-II`].id, factor_id: factorMap['F-SUN-01'].id, cumplimiento: 'cumple', puntaje: 24.00, evidencias: 'Infraestructura verificada', creado_por: gestor.id },
      { autoevaluacion_id: autoMap[`${estMap['SUNEDU-MB'].id}-2024-II`].id, factor_id: factorMap['F-SUN-02'].id, cumplimiento: 'cumple', puntaje: 30.00, evidencias: 'Plan de estudios vigente', creado_por: gestor.id },
      { autoevaluacion_id: autoMap[`${estMap['SUNEDU-MB'].id}-2024-II`].id, factor_id: factorMap['F-SUN-03'].id, cumplimiento: 'no_cumple', puntaje: 8.00, evidencias: 'Sin publicaciones', creado_por: gestor.id },
    ];
    for (const d of evalData) {
      await EvaluacionCriterio.findOrCreate({ where: { autoevaluacion_id: d.autoevaluacion_id, factor_id: d.factor_id }, defaults: d });
    }
    console.log('✅ Evaluaciones criterio creadas');

    // ==========================================
    // 10. PLANES AUDITORIA
    // ==========================================
    const planAudData = [
      { codigo: 'PA-2024-01', nombre: 'Auditoría Interna Anual 2024', tipo: 'interna', alcance: 'Todos los procesos del SGC', fecha_programada: '2024-06-10', fecha_ejecucion: '2024-06-15', estado: 'ejecutado', lider_id: auditor.id, creado_por: auditor.id },
      { codigo: 'PA-2025-01', nombre: 'Auditoría Interna 2025-I', tipo: 'interna', alcance: 'Procesos misionales', fecha_programada: '2025-04-15', estado: 'planificado', lider_id: auditor.id, creado_por: auditor.id },
      { codigo: 'PA-2025-02', nombre: 'Auditoría de Certificación', tipo: 'externa', alcance: 'SGC completo', fecha_programada: '2025-08-20', estado: 'planificado', lider_id: admin.id, creado_por: admin.id },
    ];
    const planAudMap = {};
    for (const d of planAudData) {
      const [p] = await PlanAuditoria.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
      planAudMap[d.codigo] = p;
    }
    console.log('✅ Planes de auditoría creados');

    // ==========================================
    // 11. EQUIPOS AUDITORIA
    // ==========================================
    await EquipoAuditoria.findOrCreate({ where: { plan_id: planAudMap['PA-2024-01'].id, auditor_id: auditor.id }, defaults: { plan_id: planAudMap['PA-2024-01'].id, auditor_id: auditor.id, rol_en_equipo: 'lider' } });
    await EquipoAuditoria.findOrCreate({ where: { plan_id: planAudMap['PA-2024-01'].id, auditor_id: gestor.id }, defaults: { plan_id: planAudMap['PA-2024-01'].id, auditor_id: gestor.id, rol_en_equipo: 'auditor' } });
    await EquipoAuditoria.findOrCreate({ where: { plan_id: planAudMap['PA-2025-01'].id, auditor_id: auditor.id }, defaults: { plan_id: planAudMap['PA-2025-01'].id, auditor_id: auditor.id, rol_en_equipo: 'lider' } });
    console.log('✅ Equipos de auditoría creados');

    // ==========================================
    // 12. HALLAZGOS
    // ==========================================
    const hallazgoData = [
      { plan_id: planAudMap['PA-2024-01'].id, tipo: 'no_conformidad', descripcion: 'El procedimiento de control documental no incluye la revisión periódica de documentos obsoletos', area_proceso_id: procMap['P-009'].id, gravedad: 'media', estado: 'cerrado', fecha_cierre: '2024-07-01', creado_por: auditor.id },
      { plan_id: planAudMap['PA-2024-01'].id, tipo: 'observacion', descripcion: 'No se evidencian las actas de reunión del comité de calidad del último semestre', area_proceso_id: procMap['P-002'].id, gravedad: 'baja', estado: 'cerrado', fecha_cierre: '2024-06-30', creado_por: auditor.id },
      { plan_id: planAudMap['PA-2024-01'].id, tipo: 'oportunidad_mejora', descripcion: 'Se recomienda automatizar el registro de notas para reducir errores manuales', area_proceso_id: procMap['P-005'].id, gravedad: 'baja', estado: 'abierto', creado_por: auditor.id },
      { plan_id: planAudMap['PA-2024-01'].id, tipo: 'no_conformidad', descripcion: 'Los sílabos de 3 asignaturas no están actualizados según el nuevo plan curricular', area_proceso_id: procMap['P-003'].id, gravedad: 'alta', estado: 'en_tratamiento', creado_por: auditor.id },
      { plan_id: planAudMap['PA-2024-01'].id, tipo: 'no_conformidad', descripcion: 'Falta implementar el plan de mitigación de riesgos académicos', area_proceso_id: procMap['P-002'].id, gravedad: 'critica', estado: 'en_tratamiento', creado_por: auditor.id },
      { plan_id: planAudMap['PA-2025-01'].id, tipo: 'observacion', descripcion: 'Personal administrativo sin capacitación en el SGC 2025', area_proceso_id: procMap['P-007'].id, gravedad: 'media', estado: 'abierto', creado_por: auditor.id },
    ];
    const hallazgoMap = {};
    for (const d of hallazgoData) {
      const [h] = await Hallazgo.findOrCreate({ where: { descripcion: d.descripcion }, defaults: d });
      hallazgoMap[d.descripcion] = h;
    }
    console.log('✅ Hallazgos creados');

    // ==========================================
    // 13. CAPAS
    // ==========================================
    const capaData = [
      { codigo: 'CAPA-2024-001', tipo: 'correctiva', hallazgo_id: hallazgoMap['El procedimiento de control documental no incluye la revisión periódica de documentos obsoletos'].id, descripcion: 'Actualizar el procedimiento de control documental', causa_raiz: 'Falta de procedimiento definido', accion_propuesta: 'Revisar y actualizar el procedimiento incluyendo revisión periódica', responsable_id: gestor.id, fecha_implementacion: '2024-06-20', fecha_verificacion: '2024-07-01', estado: 'verificada', efectividad: 'efectiva', creado_por: gestor.id },
      { codigo: 'CAPA-2024-002', tipo: 'correctiva', hallazgo_id: hallazgoMap['No se evidencian las actas de reunión del comité de calidad del último semestre'].id, descripcion: 'Regularizar actas del comité de calidad', causa_raiz: 'Falta de registro oportuno', accion_propuesta: 'Convocar reunión extraordinaria y elaborar actas pendientes', responsable_id: gestor.id, fecha_implementacion: '2024-06-25', estado: 'implementada', efectividad: 'pendiente', creado_por: gestor.id },
      { codigo: 'CAPA-2024-003', tipo: 'correctiva', hallazgo_id: hallazgoMap['Los sílabos de 3 asignaturas no están actualizados según el nuevo plan curricular'].id, descripcion: 'Actualizar sílabos desactualizados', causa_raiz: 'Docentes no informados del nuevo plan', accion_propuesta: 'Capacitar a docentes y actualizar los 3 sílabos', responsable_id: docente.id, fecha_implementacion: '2025-01-15', estado: 'en_implementacion', efectividad: 'pendiente', creado_por: gestor.id },
      { codigo: 'CAPA-2024-004', tipo: 'preventiva', hallazgo_id: hallazgoMap['Falta implementar el plan de mitigación de riesgos académicos'].id, descripcion: 'Implementar plan de mitigación', causa_raiz: 'Desconocimiento de la metodología', accion_propuesta: 'Contratar consultoría para diseño del plan de mitigación', responsable_id: admin.id, estado: 'registrada', creado_por: gestor.id },
    ];
    const capaMap = {};
    for (const d of capaData) {
      const [c] = await Capa.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
      capaMap[d.codigo] = c;
    }
    console.log('✅ CAPAs creadas');

    // ==========================================
    // 14. SEGUIMIENTOS CAPA
    // ==========================================
    const segData = [
      { capa_id: capaMap['CAPA-2024-001'].id, fecha_seguimiento: '2024-06-25', avance: 100.00, observaciones: 'Procedimiento actualizado y aprobado', creado_por: gestor.id },
      { capa_id: capaMap['CAPA-2024-002'].id, fecha_seguimiento: '2024-07-05', avance: 80.00, observaciones: 'Actas en elaboración', creado_por: gestor.id },
      { capa_id: capaMap['CAPA-2024-003'].id, fecha_seguimiento: '2025-02-01', avance: 50.00, observaciones: 'Capacitación realizada, sílabos en revisión', creado_por: gestor.id },
    ];
    for (const d of segData) {
      await SeguimientoCapa.findOrCreate({ where: { capa_id: d.capa_id, fecha_seguimiento: d.fecha_seguimiento }, defaults: d });
    }
    console.log('✅ Seguimientos CAPA creados');

    // ==========================================
    // 15. RIESGOS (variados para mapa de calor)
    // ==========================================
    const riesgoData = [
      { codigo: 'R-001', nombre: 'Pérdida de documentos del SGC', descripcion: 'Riesgo de pérdida de documentación crítica por falta de backup', proceso_id: procMap['P-009'].id, categoria: 'operativo', probabilidad: 3, impacto: 4, estado: 'activo', creado_por: gestor.id },
      { codigo: 'R-002', nombre: 'Deserción estudiantil', descripcion: 'Incremento en la tasa de deserción por factores económicos', proceso_id: procMap['P-005'].id, categoria: 'academico', probabilidad: 4, impacto: 5, estado: 'activo', creado_por: gestor.id },
      { codigo: 'R-003', nombre: 'Incumplimiento de metas de investigación', descripcion: 'Baja producción científica', proceso_id: procMap['P-006'].id, categoria: 'estrategico', probabilidad: 3, impacto: 3, estado: 'activo', creado_por: gestor.id },
      { codigo: 'R-004', nombre: 'Recorte presupuestal', descripcion: 'Reducción del presupuesto asignado por el gobierno', proceso_id: procMap['P-008'].id, categoria: 'financiero', probabilidad: 2, impacto: 5, estado: 'activo', creado_por: gestor.id },
      { codigo: 'R-005', nombre: 'Demanda legal por procesos administrativos', descripcion: 'Posibles demandas por procesos de contratación', proceso_id: procMap['P-007'].id, categoria: 'legal', probabilidad: 2, impacto: 4, estado: 'activo', creado_por: gestor.id },
      { codigo: 'R-006', nombre: 'Caída del sistema informático', descripcion: 'Falla del servidor que afecta matrícula y notas', proceso_id: procMap['P-004'].id, categoria: 'tecnologico', probabilidad: 3, impacto: 5, estado: 'activo', creado_por: gestor.id },
      { codigo: 'R-007', nombre: 'Daño a la reputación institucional', descripcion: 'Publicaciones negativas en medios', proceso_id: procMap['P-001'].id, categoria: 'reputacional', probabilidad: 2, impacto: 3, estado: 'activo', creado_por: gestor.id },
      { codigo: 'R-008', nombre: 'Baja calidad educativa', descripcion: 'Insatisfacción estudiantil con la enseñanza', proceso_id: procMap['P-005'].id, categoria: 'academico', probabilidad: 3, impacto: 4, estado: 'activo', creado_por: gestor.id },
      { codigo: 'R-009', nombre: 'Fuga de talento docente', descripcion: 'Pérdida de docentes calificados por mejores ofertas', proceso_id: procMap['P-007'].id, categoria: 'operativo', probabilidad: 4, impacto: 3, estado: 'activo', creado_por: gestor.id },
      { codigo: 'R-010', nombre: 'Falta de acreditación', descripcion: 'No lograr la acreditación SINEACE por incumplimiento', proceso_id: procMap['P-002'].id, categoria: 'estrategico', probabilidad: 2, impacto: 5, estado: 'activo', creado_por: gestor.id },
      { codigo: 'R-011', nombre: 'Ciberataque a datos académicos', descripcion: 'Vulneración de seguridad informática', proceso_id: procMap['P-004'].id, categoria: 'tecnologico', probabilidad: 4, impacto: 5, estado: 'activo', creado_por: gestor.id },
      { codigo: 'R-012', nombre: 'Plan de estudios desactualizado', descripcion: 'Malla curricular no alineada a demanda laboral', proceso_id: procMap['P-003'].id, categoria: 'academico', probabilidad: 5, impacto: 2, estado: 'activo', creado_por: gestor.id },
    ];
    const riesgoMap = {};
    for (const d of riesgoData) {
      const [r] = await Riesgo.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
      riesgoMap[d.codigo] = r;
    }
    console.log('✅ Riesgos creados');

    // ==========================================
    // 16. PLANES MITIGACION
    // ==========================================
    const planMitData = [
      { riesgo_id: riesgoMap['R-001'].id, descripcion: 'Implementar backup automático semanal', acciones: 'Configurar cron job; almacenar en nube', responsable_id: gestor.id, fecha_inicio: '2024-04-01', fecha_fin: '2024-05-15', estado: 'completado', creado_por: gestor.id },
      { riesgo_id: riesgoMap['R-002'].id, descripcion: 'Programa de retención estudiantil', acciones: 'Tutoría personalizada, becas de apoyo', responsable_id: docente.id, fecha_inicio: '2024-03-01', fecha_fin: '2024-12-31', estado: 'en_ejecucion', creado_por: gestor.id },
      { riesgo_id: riesgoMap['R-006'].id, descripcion: 'Plan de contingencia informática', acciones: 'Servidor espejo, UPS, respaldo diario', responsable_id: gestor.id, fecha_inicio: '2024-05-01', fecha_fin: '2024-08-30', estado: 'en_ejecucion', creado_por: gestor.id },
      { riesgo_id: riesgoMap['R-009'].id, descripcion: 'Plan de retención docente', acciones: 'Capacitaciones, incentivos, estabilidad', responsable_id: admin.id, fecha_inicio: '2025-01-01', estado: 'planificado', creado_por: gestor.id },
      { riesgo_id: riesgoMap['R-011'].id, descripcion: 'Auditoría de seguridad informática', acciones: 'Contratar ethical hacking; parchear vulnerabilidades', responsable_id: admin.id, fecha_inicio: '2025-02-01', estado: 'planificado', creado_por: gestor.id },
      { riesgo_id: riesgoMap['R-010'].id, descripcion: 'Plan de adecuación a SINEACE', acciones: 'Implementar brechas del autoevaluación', responsable_id: gestor.id, fecha_inicio: '2025-03-01', estado: 'planificado', creado_por: gestor.id },
    ];
    for (const d of planMitData) {
      await PlanMitigacion.findOrCreate({ where: { riesgo_id: d.riesgo_id, descripcion: d.descripcion }, defaults: d });
    }
    console.log('✅ Planes de mitigación creados');

    // ==========================================
    // 17. INDICADORES
    // ==========================================
    const indData = [
      { codigo: 'IND-001', nombre: '% Cumplimiento del PEI', descripcion: 'Porcentaje de metas del PEI alcanzadas', proceso_id: procMap['P-001'].id, tipo: 'eficacia', formula_calculo: '(Metas cumplidas / Total metas) * 100', unidad_medida: 'Porcentaje', meta: 90.00, frecuencia_medicion: 'semestral', estado: 'activo', creado_por: gestor.id },
      { codigo: 'IND-002', nombre: 'Tasa de graduación', descripcion: 'Estudiantes que culminan en el tiempo previsto', proceso_id: procMap['P-005'].id, tipo: 'eficacia', formula_calculo: '(Graduados / Ingresantes cohorte) * 100', unidad_medida: 'Porcentaje', meta: 75.00, frecuencia_medicion: 'anual', estado: 'activo', creado_por: gestor.id },
      { codigo: 'IND-003', nombre: 'Publicaciones indexadas', descripcion: 'Número de artículos Scopus/WoS por año', proceso_id: procMap['P-006'].id, tipo: 'impacto', formula_calculo: 'Conteo anual de publicaciones', unidad_medida: 'Número', meta: 50.00, frecuencia_medicion: 'anual', estado: 'activo', creado_por: gestor.id },
      { codigo: 'IND-004', nombre: '% Ejecución presupuestal', descripcion: 'Presupuesto ejecutado vs asignado', proceso_id: procMap['P-008'].id, tipo: 'eficiencia', formula_calculo: '(Ejecutado / Asignado) * 100', unidad_medida: 'Porcentaje', meta: 95.00, frecuencia_medicion: 'mensual', estado: 'activo', creado_por: gestor.id },
      { codigo: 'IND-005', nombre: 'Satisfacción estudiantil', descripcion: 'Nivel de satisfacción de estudiantes', proceso_id: procMap['P-005'].id, tipo: 'satisfaccion', formula_calculo: 'Promedio encuestas satisfacción', unidad_medida: 'Puntos (1-5)', meta: 4.00, frecuencia_medicion: 'semestral', estado: 'activo', creado_por: gestor.id },
      { codigo: 'IND-006', nombre: 'N° CAPAs cerradas', descripcion: 'CAPAs cerradas en el período', proceso_id: procMap['P-010'].id, tipo: 'eficacia', formula_calculo: 'Conteo de CAPAs cerradas', unidad_medida: 'Número', meta: 10.00, frecuencia_medicion: 'trimestral', estado: 'activo', creado_por: gestor.id },
      { codigo: 'IND-007', nombre: '% Documentos aprobados', descripcion: 'Documentos del SGC aprobados vs total', proceso_id: procMap['P-009'].id, tipo: 'eficiencia', formula_calculo: '(Aprobados / Total documentos) * 100', unidad_medida: 'Porcentaje', meta: 85.00, frecuencia_medicion: 'mensual', estado: 'activo', creado_por: gestor.id },
      { codigo: 'IND-008', nombre: 'Índice de riesgos críticos', descripcion: 'Riesgos en nivel alto o crítico', proceso_id: procMap['P-002'].id, tipo: 'eficacia', formula_calculo: 'Conteo de riesgos con nivel > 14', unidad_medida: 'Número', meta: 3.00, frecuencia_medicion: 'mensual', estado: 'activo', creado_por: gestor.id },
    ];
    const indMap = {};
    for (const d of indData) {
      const [i] = await Indicador.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
      indMap[d.codigo] = i;
    }
    console.log('✅ Indicadores creados');

    // ==========================================
    // 18. MEDICIONES
    // ==========================================
    const medData = [
      { indicador_id: indMap['IND-001'].id, periodo: '2024-I', fecha_medicion: '2024-08-15', valor_real: 82.00, valor_esperado: 90.00, cumplimiento: 91.11, creado_por: gestor.id },
      { indicador_id: indMap['IND-001'].id, periodo: '2024-II', fecha_medicion: '2025-01-15', valor_real: 87.00, valor_esperado: 90.00, cumplimiento: 96.67, creado_por: gestor.id },
      { indicador_id: indMap['IND-001'].id, periodo: '2025-I', fecha_medicion: new Date().toISOString().split('T')[0], valor_real: 85.00, valor_esperado: 92.00, cumplimiento: 92.39, creado_por: gestor.id },
      { indicador_id: indMap['IND-002'].id, periodo: '2023', fecha_medicion: '2024-03-01', valor_real: 68.00, valor_esperado: 75.00, cumplimiento: 90.67, creado_por: gestor.id },
      { indicador_id: indMap['IND-002'].id, periodo: '2024', fecha_medicion: '2025-03-01', valor_real: 71.00, valor_esperado: 75.00, cumplimiento: 94.67, creado_por: gestor.id },
      { indicador_id: indMap['IND-003'].id, periodo: '2023', fecha_medicion: '2024-01-15', valor_real: 32.00, valor_esperado: 50.00, cumplimiento: 64.00, creado_por: gestor.id },
      { indicador_id: indMap['IND-003'].id, periodo: '2024', fecha_medicion: '2025-01-15', valor_real: 45.00, valor_esperado: 50.00, cumplimiento: 90.00, creado_por: gestor.id },
      { indicador_id: indMap['IND-004'].id, periodo: '2024-I', fecha_medicion: '2024-08-01', valor_real: 88.00, valor_esperado: 95.00, cumplimiento: 92.63, creado_por: gestor.id },
      { indicador_id: indMap['IND-004'].id, periodo: '2024-II', fecha_medicion: '2025-01-01', valor_real: 92.00, valor_esperado: 95.00, cumplimiento: 96.84, creado_por: gestor.id },
      { indicador_id: indMap['IND-005'].id, periodo: '2024-I', fecha_medicion: '2024-08-01', valor_real: 3.50, valor_esperado: 4.00, cumplimiento: 87.50, creado_por: gestor.id },
      { indicador_id: indMap['IND-005'].id, periodo: '2024-II', fecha_medicion: '2025-01-01', valor_real: 3.80, valor_esperado: 4.00, cumplimiento: 95.00, creado_por: gestor.id },
      { indicador_id: indMap['IND-006'].id, periodo: '2024-III', fecha_medicion: '2024-10-01', valor_real: 3.00, valor_esperado: 10.00, cumplimiento: 30.00, creado_por: gestor.id },
      { indicador_id: indMap['IND-006'].id, periodo: '2024-IV', fecha_medicion: '2025-01-01', valor_real: 6.00, valor_esperado: 10.00, cumplimiento: 60.00, creado_por: gestor.id },
      { indicador_id: indMap['IND-007'].id, periodo: '2024-12', fecha_medicion: '2025-01-05', valor_real: 78.00, valor_esperado: 85.00, cumplimiento: 91.76, creado_por: gestor.id },
      { indicador_id: indMap['IND-008'].id, periodo: '2024-12', fecha_medicion: '2025-01-05', valor_real: 5.00, valor_esperado: 3.00, cumplimiento: 60.00, creado_por: gestor.id },
      { indicador_id: indMap['IND-003'].id, periodo: '2025-I', fecha_medicion: new Date().toISOString().split('T')[0], valor_real: 18.00, valor_esperado: 25.00, cumplimiento: 72.00, creado_por: gestor.id },
    ];
    for (const d of medData) {
      await MedicionIndicador.findOrCreate({ where: { indicador_id: d.indicador_id, periodo: d.periodo }, defaults: d });
    }
    console.log('✅ Mediciones de indicadores creadas');

    // ==========================================
    // 19. DOCUMENTOS
    // ==========================================
    const tiposDoc = await TipoDocumento.findAll();
    const tipoMap = {};
    tiposDoc.forEach(t => { tipoMap[t.codigo] = t; });

    const docData = [
      { codigo: 'POL-001', titulo: 'Política de Calidad Institucional', tipo_documento_id: tipoMap['POL'].id, proceso_id: procMap['P-001'].id, version_actual: 3, estado: 'aprobado', contenido: '# Política de Calidad\n\nLa UNT se compromete a...\n\n## Alcance\n\nAplica a todos los procesos.', fecha_vigencia: '2024-01-01', fecha_revision: '2024-06-15', creado_por: admin.id },
      { codigo: 'MAN-001', titulo: 'Manual de Gestión de Procesos', tipo_documento_id: tipoMap['MAN'].id, proceso_id: procMap['P-002'].id, version_actual: 2, estado: 'aprobado', contenido: '# Manual de Procesos\n\n## Estructura\n\nEl SGC de la UNT está compuesto por...', fecha_vigencia: '2024-03-01', fecha_revision: '2024-09-01', creado_por: gestor.id },
      { codigo: 'PRO-001', titulo: 'Procedimiento de Auditoría Interna', tipo_documento_id: tipoMap['PRO'].id, proceso_id: procMap['P-010'].id, version_actual: 1, estado: 'aprobado', contenido: '# Procedimiento\n\n## Objetivo\n\nEstablecer la metodología...', fecha_vigencia: '2024-05-01', creado_por: auditor.id },
      { codigo: 'INS-001', titulo: 'Instructivo para Elaboración de Sílabos', tipo_documento_id: tipoMap['INS'].id, proceso_id: procMap['P-003'].id, version_actual: 1, estado: 'borrador', contenido: '# Instructivo\n\nPaso a paso para elaborar sílabos...', creado_por: docente.id },
      { codigo: 'FOR-001', titulo: 'Formato de Acta de Reunión', tipo_documento_id: tipoMap['FOR'].id, proceso_id: procMap['P-007'].id, version_actual: 1, estado: 'aprobado', contenido: 'Formato estándar de acta', fecha_vigencia: '2024-01-01', creado_por: gestor.id },
      { codigo: 'POL-002', titulo: 'Política de Investigación', tipo_documento_id: tipoMap['POL'].id, proceso_id: procMap['P-006'].id, version_actual: 1, estado: 'en_revision', contenido: '# Política de Investigación\n\nLineamientos para la investigación...', creado_por: docente.id },
    ];
    const docMap = {};
    for (const d of docData) {
      const [doc] = await Documento.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
      docMap[d.codigo] = doc;
    }
    console.log('✅ Documentos creados');

    // ==========================================
    // 20. VERSIONES DOCUMENTO
    // ==========================================
    const versionData = [
      { documento_id: docMap['POL-001'].id, numero_version: 1, cambios_descripcion: 'Versión inicial de la política de calidad', contenido: '# Política de Calidad\nVersión 1', estado: 'aprobado', creado_por: admin.id },
      { documento_id: docMap['POL-001'].id, numero_version: 2, cambios_descripcion: 'Actualización de alcance y objetivos', contenido: '# Política de Calidad\nVersión 2', estado: 'aprobado', creado_por: admin.id },
      { documento_id: docMap['POL-001'].id, numero_version: 3, cambios_descripcion: 'Revisión anual del comité de calidad', contenido: '# Política de Calidad\nVersión actual', estado: 'aprobado', creado_por: gestor.id },
      { documento_id: docMap['MAN-001'].id, numero_version: 1, cambios_descripcion: 'Manual inicial', contenido: '# Manual v1', estado: 'aprobado', creado_por: gestor.id },
      { documento_id: docMap['MAN-001'].id, numero_version: 2, cambios_descripcion: 'Actualización de procesos según nuevo PEI', contenido: '# Manual v2', estado: 'aprobado', creado_por: gestor.id },
      { documento_id: docMap['PRO-001'].id, numero_version: 1, cambios_descripcion: 'Versión inicial del procedimiento', contenido: '# Procedimiento v1', estado: 'aprobado', creado_por: auditor.id },
      { documento_id: docMap['POL-002'].id, numero_version: 1, cambios_descripcion: 'Versión inicial', contenido: '# Política Investigación v1', estado: 'en_revision', creado_por: docente.id },
    ];
    for (const d of versionData) {
      await VersionDocumento.findOrCreate({ where: { documento_id: d.documento_id, numero_version: d.numero_version }, defaults: d });
    }
    console.log('✅ Versiones de documentos creadas');

    // ==========================================
    // 21. ENCUESTAS
    // ==========================================
    const encData = [
      { codigo: 'ENC-001', titulo: 'Encuesta de Satisfacción Estudiantil 2025-I', descripcion: 'Mide la satisfacción de los estudiantes con la calidad educativa', dirigido_a: 'estudiantes', fecha_inicio: '2025-04-01', fecha_fin: '2025-05-15', anonima: true, estado: 'publicada', creado_por: gestor.id },
      { codigo: 'ENC-002', titulo: 'Evaluación Docente 2025-I', descripcion: 'Evaluación del desempeño docente por parte de los estudiantes', dirigido_a: 'estudiantes', fecha_inicio: '2025-06-01', fecha_fin: '2025-07-15', anonima: true, estado: 'borrador', creado_por: gestor.id },
      { codigo: 'ENC-003', titulo: 'Encuesta a Egresados 2025', descripcion: 'Seguimiento a egresados sobre inserción laboral', dirigido_a: 'egresados', fecha_inicio: '2025-03-01', fecha_fin: '2025-06-30', anonima: true, estado: 'publicada', creado_por: gestor.id },
    ];
    const encMap = {};
    for (const d of encData) {
      const [e] = await Encuesta.findOrCreate({ where: { codigo: d.codigo }, defaults: d });
      encMap[d.codigo] = e;
    }
    console.log('✅ Encuestas creadas');

    // ==========================================
    // 22. PREGUNTAS ENCUESTA
    // ==========================================
    const pregData = [
      { encuesta_id: encMap['ENC-001'].id, texto: '¿Cómo califica la calidad de la enseñanza recibida?', tipo: 'likert_5', orden: 1, obligatoria: true },
      { encuesta_id: encMap['ENC-001'].id, texto: '¿Los docentes cumplen con el sílabo programado?', tipo: 'likert_5', orden: 2, obligatoria: true },
      { encuesta_id: encMap['ENC-001'].id, texto: '¿Cómo califica la infraestructura y equipamiento?', tipo: 'likert_5', orden: 3, obligatoria: true },
      { encuesta_id: encMap['ENC-001'].id, texto: '¿Recomendaría su programa de estudios?', tipo: 'likert_5', orden: 4, obligatoria: true },
      { encuesta_id: encMap['ENC-001'].id, texto: '¿Qué mejoras sugiere para el programa?', tipo: 'abierta', orden: 5, obligatoria: false },
      { encuesta_id: encMap['ENC-002'].id, texto: 'El docente domina los contenidos de la asignatura', tipo: 'likert_5', orden: 1, obligatoria: true },
      { encuesta_id: encMap['ENC-002'].id, texto: 'La metodología de enseñanza es adecuada', tipo: 'likert_5', orden: 2, obligatoria: true },
      { encuesta_id: encMap['ENC-002'].id, texto: 'El docente resuelve dudas y brinda retroalimentación', tipo: 'likert_5', orden: 3, obligatoria: true },
      { encuesta_id: encMap['ENC-002'].id, texto: 'La evaluación está alineada con lo enseñado', tipo: 'likert_5', orden: 4, obligatoria: true },
      { encuesta_id: encMap['ENC-002'].id, texto: 'Comentarios adicionales sobre el docente', tipo: 'abierta', orden: 5, obligatoria: false },
      { encuesta_id: encMap['ENC-003'].id, texto: '¿Está laborando actualmente en su campo profesional?', tipo: 'si_no', orden: 1, obligatoria: true },
      { encuesta_id: encMap['ENC-003'].id, texto: '¿Cuánto tiempo le tomó encontrar empleo después de egresar?', tipo: 'multiple', orden: 2, obligatoria: true },
      { encuesta_id: encMap['ENC-003'].id, texto: '¿Los conocimientos adquiridos en la universidad son útiles en su trabajo?', tipo: 'likert_5', orden: 3, obligatoria: true },
      { encuesta_id: encMap['ENC-003'].id, texto: '¿Estaría dispuesto a realizar cursos de actualización?', tipo: 'si_no', orden: 4, obligatoria: true },
      { encuesta_id: encMap['ENC-003'].id, texto: 'Sugerencias para mejorar la formación profesional', tipo: 'abierta', orden: 5, obligatoria: false },
    ];
    for (const d of pregData) {
      await PreguntaEncuesta.findOrCreate({ where: { encuesta_id: d.encuesta_id, texto: d.texto }, defaults: d });
    }
    console.log('✅ Preguntas de encuesta creadas');

    // ==========================================
    // 23. USUARIOS DE PRUEBA (estudiantes y egresados)
    // ==========================================
    const testUsuariosData = [
      { codigo: 'EST-001', nombres: 'Carlos', apellidos: 'García López', correo: 'cgarcia@unitru.edu.pe', rol: 'estudiante', facultad: 'Ingeniería', escuela: 'Sistemas', activo: true },
      { codigo: 'EST-002', nombres: 'María', apellidos: 'Torres Pérez', correo: 'mtorres@unitru.edu.pe', rol: 'estudiante', facultad: 'Ciencias', escuela: 'Matemáticas', activo: true },
      { codigo: 'EST-003', nombres: 'Luis', apellidos: 'Ramírez Díaz', correo: 'lramirez@unitru.edu.pe', rol: 'estudiante', facultad: 'Ingeniería', escuela: 'Industrial', activo: true },
      { codigo: 'EST-004', nombres: 'Ana', apellidos: 'Mendoza Ríos', correo: 'amendoza@unitru.edu.pe', rol: 'estudiante', facultad: 'Ciencias Sociales', escuela: 'Derecho', activo: true },
      { codigo: 'EST-005', nombres: 'Pedro', apellidos: 'Castro Silva', correo: 'pcastro@unitru.edu.pe', rol: 'estudiante', facultad: 'Ingeniería', escuela: 'Civil', activo: true },
      { codigo: 'EST-006', nombres: 'Rosa', apellidos: 'Huamán Quispe', correo: 'rhuaman@unitru.edu.pe', rol: 'egresado', facultad: 'Ingeniería', escuela: 'Sistemas', activo: true },
      { codigo: 'EST-007', nombres: 'José', apellidos: 'Vega Castillo', correo: 'jvega@unitru.edu.pe', rol: 'egresado', facultad: 'Ciencias', escuela: 'Contabilidad', activo: true },
      { codigo: 'EST-008', nombres: 'Lucía', apellidos: 'Flores Paredes', correo: 'lflores@unitru.edu.pe', rol: 'egresado', facultad: 'Ingeniería', escuela: 'Industrial', activo: true },
    ];
    const testUsuarios = {};
    for (const d of testUsuariosData) {
      const [u] = await Usuario.findOrCreate({ where: { codigo: d.codigo }, defaults: { ...d, contrasena_hash: '$2a$10$WIJEFhvFbf5JcxVSHvevROXEIkk7EM6rFPfUIPQvyCoXfC.FxPjRm' } });
      testUsuarios[d.codigo] = u;
    }
    console.log('✅ Usuarios de prueba creados');

    // ==========================================
    // 24. RESPUESTAS ENCUESTA — Satisfacción Estudiantil (ENC-001)
    // ==========================================
    const pregEnc1 = await PreguntaEncuesta.findAll({ where: { encuesta_id: encMap['ENC-001'].id }, order: [['orden', 'ASC']] });
    const estudiantesList = Object.values(testUsuarios).filter(u => u.rol === 'estudiante');
    if (pregEnc1.length > 0 && estudiantesList.length > 0) {
      const likertData = [
        { estudiante: estudiantesList[0], valores: [4, 3, 2, 4], texto: 'Mejorar los laboratorios de cómputo.' },
        { estudiante: estudiantesList[1], valores: [5, 4, 3, 5], texto: 'Incluir más prácticas preprofesionales.' },
        { estudiante: estudiantesList[2], valores: [3, 4, 4, 3], texto: 'Actualizar el plan de estudios.' },
        { estudiante: estudiantesList[3], valores: [4, 5, 2, 4], texto: 'Más becas y apoyo económico.' },
        { estudiante: estudiantesList[4], valores: [2, 3, 1, 3], texto: 'Falta mantenimiento en aulas.' },
      ];
      for (const entry of likertData) {
        const pregLikert = pregEnc1.filter(p => p.tipo === 'likert_5').sort((a, b) => a.orden - b.orden);
        for (let i = 0; i < pregLikert.length; i++) {
          await RespuestaEncuesta.findOrCreate({
            where: { encuesta_id: encMap['ENC-001'].id, pregunta_id: pregLikert[i].id, usuario_id: entry.estudiante.id },
            defaults: { encuesta_id: encMap['ENC-001'].id, pregunta_id: pregLikert[i].id, usuario_id: entry.estudiante.id, valor_numerico: entry.valores[i] },
          });
        }
        const pregAbierta = pregEnc1.find(p => p.tipo === 'abierta');
        if (pregAbierta) {
          await RespuestaEncuesta.findOrCreate({
            where: { encuesta_id: encMap['ENC-001'].id, pregunta_id: pregAbierta.id, usuario_id: entry.estudiante.id },
            defaults: { encuesta_id: encMap['ENC-001'].id, pregunta_id: pregAbierta.id, usuario_id: entry.estudiante.id, valor_texto: entry.texto },
          });
        }
      }
    }
    console.log('✅ Respuestas ENC-001 creadas');

    // ==========================================
    // 25. RESPUESTAS ENCUESTA — Egresados (ENC-003)
    // ==========================================
    const pregEnc3 = await PreguntaEncuesta.findAll({ where: { encuesta_id: encMap['ENC-003'].id }, order: [['orden', 'ASC']] });
    const egresadosList = Object.values(testUsuarios).filter(u => u.rol === 'egresado');
    if (pregEnc3.length > 0 && egresadosList.length > 0) {
      const egresadoData = [
        { egresado: egresadosList[0], si_no: [1, 1], likert: 4, tiempo: 'Menos de 3 meses', texto: 'Fortalecer convenios empresariales.' },
        { egresado: egresadosList[1], si_no: [0, 1], likert: 3, tiempo: 'De 6 a 12 meses', texto: 'Incluir certificaciones internacionales.' },
        { egresado: egresadosList[2], si_no: [1, 0], likert: 5, tiempo: 'De 3 a 6 meses', texto: 'Más enfoque en habilidades blandas.' },
      ];
      const pregSiNo = pregEnc3.filter(p => p.tipo === 'si_no').sort((a, b) => a.orden - b.orden);
      const pregLikert = pregEnc3.find(p => p.tipo === 'likert_5');
      const pregMultiple = pregEnc3.find(p => p.tipo === 'multiple');
      const pregAbierta = pregEnc3.find(p => p.tipo === 'abierta');
      for (const entry of egresadoData) {
        for (let i = 0; i < pregSiNo.length; i++) {
          await RespuestaEncuesta.findOrCreate({
            where: { encuesta_id: encMap['ENC-003'].id, pregunta_id: pregSiNo[i].id, usuario_id: entry.egresado.id },
            defaults: { encuesta_id: encMap['ENC-003'].id, pregunta_id: pregSiNo[i].id, usuario_id: entry.egresado.id, valor_numerico: entry.si_no[i] },
          });
        }
        if (pregLikert) {
          await RespuestaEncuesta.findOrCreate({
            where: { encuesta_id: encMap['ENC-003'].id, pregunta_id: pregLikert.id, usuario_id: entry.egresado.id },
            defaults: { encuesta_id: encMap['ENC-003'].id, pregunta_id: pregLikert.id, usuario_id: entry.egresado.id, valor_numerico: entry.likert },
          });
        }
        if (pregMultiple) {
          await RespuestaEncuesta.findOrCreate({
            where: { encuesta_id: encMap['ENC-003'].id, pregunta_id: pregMultiple.id, usuario_id: entry.egresado.id },
            defaults: { encuesta_id: encMap['ENC-003'].id, pregunta_id: pregMultiple.id, usuario_id: entry.egresado.id, valor_texto: entry.tiempo },
          });
        }
        if (pregAbierta) {
          await RespuestaEncuesta.findOrCreate({
            where: { encuesta_id: encMap['ENC-003'].id, pregunta_id: pregAbierta.id, usuario_id: entry.egresado.id },
            defaults: { encuesta_id: encMap['ENC-003'].id, pregunta_id: pregAbierta.id, usuario_id: entry.egresado.id, valor_texto: entry.texto },
          });
        }
      }
    }
    console.log('✅ Respuestas ENC-003 creadas');

    console.log('');
    console.log('🎉 SEED COMPLETADO SATISFACTORIAMENTE');
    console.log('   📊 6 macroprocesos · 10 procesos · 17 actividades · 12 riesgos');
    console.log('   📊 8 indicadores · 6 documentos · 3 encuestas · 6 hallazgos');
    console.log('   📊 4 CAPAs · 3 estándares · 4 autoevaluaciones · 3 planes auditoría');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seeder:', error);
    process.exit(1);
  }
};

seed();
