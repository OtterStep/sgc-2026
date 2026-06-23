import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import {
  Usuario,
  Macroproceso,
  Proceso,
  EstandarAcreditacion,
  Autoevaluacion,
  Indicador,
  Encuesta,
  PreguntaEncuesta,
  TipoDocumento,
  Documento,
  PlanAuditoria,
  Hallazgo,
  Capa,
  Riesgo
} from '../models/index.js';

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✅ PostgreSQL conectado y sincronizado para el master seed');

    const defaultPassword = await bcrypt.hash('UntSgc2026!', 10);

    const usuariosData = [
      { codigo: 'ADM-002', nombres: 'Admin', apellidos: 'Principal', correo: 'admin2@unitru.edu.pe', contrasena_hash: defaultPassword, rol: 'admin', activo: true },
      { codigo: 'GC-001', nombres: 'Gestor', apellidos: 'Calidad', correo: 'gestor_calidad@unitru.edu.pe', contrasena_hash: defaultPassword, rol: 'gestor_calidad', activo: true },
      { codigo: 'AUD-001', nombres: 'Auditor', apellidos: 'Interno', correo: 'auditor@unitru.edu.pe', contrasena_hash: defaultPassword, rol: 'auditor', activo: true },
      { codigo: 'DOC-001', nombres: 'Juan', apellidos: 'Pérez', correo: 'docente@unitru.edu.pe', contrasena_hash: defaultPassword, rol: 'docente', activo: true },
      { codigo: 'EST-001', nombres: 'Ana', apellidos: 'García', correo: 'estudiante@unitru.edu.pe', contrasena_hash: defaultPassword, rol: 'estudiante', activo: true },
      { codigo: 'EGR-001', nombres: 'Carlos', apellidos: 'López', correo: 'egresado@unitru.edu.pe', contrasena_hash: defaultPassword, rol: 'egresado', activo: true },
      { codigo: 'INV-001', nombres: 'Invitado', apellidos: 'Externo', correo: 'invitado@unitru.edu.pe', contrasena_hash: defaultPassword, rol: 'invitado', activo: true }
    ];

    for (const u of usuariosData) {
      await Usuario.findOrCreate({ where: { correo: u.correo }, defaults: u });
    }
    const admin = await Usuario.findOne({ where: { rol: 'admin' } });
    const gestor = await Usuario.findOne({ where: { rol: 'gestor_calidad' } });
    const auditor = await Usuario.findOne({ where: { rol: 'auditor' } });

    console.log('✅ Usuarios creados');

    const [macro1] = await Macroproceso.findOrCreate({
      where: { codigo: 'MP-01' },
      defaults: { nombre: 'Gestión Estratégica', descripcion: 'Macroproceso de dirección', responsable_id: gestor.id, tipo: 'Estratégico' }
    });

    const [macro2] = await Macroproceso.findOrCreate({
      where: { codigo: 'MP-02' },
      defaults: { nombre: 'Gestión de la Calidad', descripcion: 'Aseguramiento', responsable_id: gestor.id, tipo: 'Misional' }
    });
    console.log('✅ Macroprocesos creados');

    const [proceso1] = await Proceso.findOrCreate({
      where: { codigo: 'PR-01' },
      defaults: { macroproceso_id: macro1.id, nombre: 'Planeamiento', objetivo: 'Definir rumbo', alcance: 'Toda la UNT', responsable_id: admin.id }
    });

    const [proceso2] = await Proceso.findOrCreate({
      where: { codigo: 'PR-02' },
      defaults: { macroproceso_id: macro2.id, nombre: 'Acreditación', objetivo: 'Lograr acreditación', alcance: 'Programas', responsable_id: gestor.id }
    });
    console.log('✅ Procesos creados');

    const [estandar1] = await EstandarAcreditacion.findOrCreate({
      where: { codigo: 'ISO-21001' },
      defaults: { nombre: 'ISO 21001:2018', organizacion: 'ISO', creado_por: admin.id }
    });

    const [estandar2] = await EstandarAcreditacion.findOrCreate({
      where: { codigo: 'SUNEDU-01' },
      defaults: { nombre: 'Modelo SUNEDU', organizacion: 'SUNEDU', creado_por: admin.id }
    });

    await Autoevaluacion.findOrCreate({
      where: { periodo: '2024-I', estandar_id: estandar1.id },
      defaults: { fecha_inicio: '2024-01-01', estado: 'en_proceso', puntaje_total: 78.5, creado_por: gestor.id }
    });
    
    await Autoevaluacion.findOrCreate({
      where: { periodo: '2024-I', estandar_id: estandar2.id },
      defaults: { fecha_inicio: '2024-01-01', estado: 'completada', puntaje_total: 92.0, creado_por: gestor.id }
    });
    console.log('✅ Acreditación creada');

    const [plan] = await PlanAuditoria.findOrCreate({
      where: { codigo: 'PA-2024-01' },
      defaults: { nombre: 'Auditoría Anual', tipo: 'Interna', fecha_programada: '2024-05-10', lider_id: auditor.id }
    });

    const [hallazgo1] = await Hallazgo.findOrCreate({
      where: { descripcion: 'Falta evidencia' },
      defaults: { plan_id: plan.id, tipo: 'No Conformidad', area_proceso_id: proceso1.id, gravedad: 'Baja', creado_por: auditor.id }
    });

    await Capa.findOrCreate({
      where: { codigo: 'CAPA-001' },
      defaults: { tipo: 'Correctiva', hallazgo_id: hallazgo1.id, descripcion: 'Capacitar', accion_propuesta: 'Curso', responsable_id: gestor.id, creado_por: gestor.id, estado: 'registrada' }
    });
    console.log('✅ Auditoria y CAPA creados');

    await Riesgo.findOrCreate({
      where: { codigo: 'R-01' },
      defaults: { nombre: 'Desactualización', descripcion: 'Manual viejo', proceso_id: proceso2.id, categoria: 'Operativo', probabilidad: 3, impacto: 4 }
    });

    await Indicador.findOrCreate({
      where: { codigo: 'IND-01' },
      defaults: { nombre: 'Cumplimiento Acreditación', descripcion: 'Avance', proceso_id: proceso2.id, tipo: 'Eficacia', formula_calculo: 'Logros/Total', unidad_medida: 'Porcentaje', meta: 90, frecuencia_medicion: 'Semestral' }
    });
    console.log('✅ Riesgos e Indicadores creados');

    const [encuesta1] = await Encuesta.findOrCreate({
      where: { codigo: 'ENC-01' },
      defaults: { titulo: 'Satisfacción 2024', descripcion: 'Evaluación', dirigido_a: 'Estudiantes', estado: 'publicada', creado_por: gestor.id }
    });
    
    await PreguntaEncuesta.findOrCreate({
      where: { texto: '¿Calidad docente?' },
      defaults: { encuesta_id: encuesta1.id, tipo: 'opcion_multiple', orden: 1 }
    });
    console.log('✅ Encuestas creadas');

    const [tipoDoc] = await TipoDocumento.findOrCreate({
      where: { codigo: 'MAN' },
      defaults: { nombre: 'Manual', descripcion: 'Manuales' }
    });

    await Documento.findOrCreate({
      where: { codigo: 'DOC-01' },
      defaults: { titulo: 'Manual de Calidad', tipo_documento_id: tipoDoc.id, proceso_id: proceso1.id, estado: 'aprobado', creado_por: gestor.id }
    });
    console.log('✅ Documentos creados');

    console.log('🎉 MASTER SEED COMPLETADO SATISFACTORIAMENTE');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seeder:', error);
    process.exit(1);
  }
};

seed();
