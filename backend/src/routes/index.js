import { Router } from 'express';
import { body } from 'express-validator';
import { verificarToken, verificarRol } from '../middleware/auth.js';
import * as authCtrl from '../controllers/authController.js';
import * as docCtrl from '../controllers/documentoController.js';
import * as procCtrl from '../controllers/procesoController.js';
import * as acrCtrl from '../controllers/acreditacionController.js';
import * as audCtrl from '../controllers/auditoriaController.js';
import * as capaCtrl from '../controllers/capaController.js';
import * as riesgoCtrl from '../controllers/riesgoController.js';
import * as indCtrl from '../controllers/indicadorController.js';
import * as encCtrl from '../controllers/encuestaController.js';
import * as usrCtrl from '../controllers/usuarioController.js';

const router = Router();

// Auth
router.post('/auth/registrar', authCtrl.registrar);
router.post('/auth/login', authCtrl.login);
router.get('/auth/perfil', verificarToken, authCtrl.perfil);

// Usuarios (Gestión de Roles y Permisos)
router.get('/usuarios', verificarToken, verificarRol(['admin']), usrCtrl.listarUsuarios);
router.post('/usuarios', verificarToken, verificarRol(['admin']), usrCtrl.crearUsuario);
router.put('/usuarios/:id', verificarToken, verificarRol(['admin']), usrCtrl.actualizarUsuario);
router.patch('/usuarios/:id/desactivar', verificarToken, verificarRol(['admin']), usrCtrl.desactivarUsuario);

// Documentos
router.get('/documentos/reporte', verificarToken, docCtrl.generarReporteDocumentos);
router.get('/documentos', verificarToken, docCtrl.listarDocumentos);
router.get('/documentos/:id', verificarToken, docCtrl.obtenerDocumentoPorId);
router.post('/documentos', verificarToken, verificarRol(['admin', 'gestor_calidad']), docCtrl.crearDocumento);
router.put('/documentos/:id', verificarToken, verificarRol(['admin', 'gestor_calidad']), docCtrl.actualizarDocumento);
router.patch('/documentos/:id/archivar', verificarToken, verificarRol(['admin', 'gestor_calidad']), docCtrl.archivarDocumento);
router.get('/tipos-documento', verificarToken, docCtrl.listarTiposDocumento);

// Procesos (Mapa de Procesos)
router.get('/procesos/reporte', verificarToken, procCtrl.reporteMapaProcesos);
router.get('/macroprocesos', verificarToken, procCtrl.listarMacroprocesos);
router.get('/macroprocesos/:id', verificarToken, procCtrl.obtenerMacroprocesoPorId);
router.post('/macroprocesos', verificarToken, verificarRol(['admin', 'gestor_calidad']), procCtrl.crearMacroproceso);
router.put('/macroprocesos/:id', verificarToken, verificarRol(['admin', 'gestor_calidad']), procCtrl.actualizarMacroproceso);
router.patch('/macroprocesos/:id/desactivar', verificarToken, verificarRol(['admin', 'gestor_calidad']), procCtrl.desactivarMacroproceso);
router.get('/procesos', verificarToken, procCtrl.listarProcesos);
router.get('/procesos/:id', verificarToken, procCtrl.obtenerProcesoPorId);
router.post('/procesos', verificarToken, verificarRol(['admin', 'gestor_calidad']), procCtrl.crearProceso);
router.put('/procesos/:id', verificarToken, verificarRol(['admin', 'gestor_calidad']), procCtrl.actualizarProceso);
router.patch('/procesos/:id/desactivar', verificarToken, verificarRol(['admin', 'gestor_calidad']), procCtrl.desactivarProceso);
router.get('/procesos/:proceso_id/actividades', verificarToken, procCtrl.listarActividades);
router.post('/actividades', verificarToken, verificarRol(['admin', 'gestor_calidad']), procCtrl.crearActividad);

// Acreditación
router.get('/acreditacion/reporte', verificarToken, acrCtrl.reporteAcreditacion);
router.get('/estandares', verificarToken, acrCtrl.listarEstandares);
router.post('/estandares', verificarToken, verificarRol(['admin', 'gestor_calidad']), acrCtrl.crearEstandar);
router.get('/estandares/:estandar_id/factores', verificarToken, acrCtrl.listarFactores);
router.post('/factores', verificarToken, verificarRol(['admin', 'gestor_calidad']), acrCtrl.crearFactor);
router.get('/autoevaluaciones', verificarToken, acrCtrl.listarAutoevaluaciones);
router.post('/autoevaluaciones', verificarToken, verificarRol(['admin', 'gestor_calidad']), acrCtrl.crearAutoevaluacion);
router.post('/evaluaciones-criterio', verificarToken, acrCtrl.evaluarCriterio);

// Auditorías
router.get('/auditorias/reporte', verificarToken, audCtrl.reporteAuditoria);
router.get('/planes-auditoria', verificarToken, audCtrl.listarPlanes);
router.post('/planes-auditoria', verificarToken, verificarRol(['admin', 'gestor_calidad', 'auditor']), audCtrl.crearPlan);
router.get('/hallazgos', verificarToken, audCtrl.listarHallazgos);
router.post('/hallazgos', verificarToken, verificarRol(['admin', 'auditor']), audCtrl.crearHallazgo);
router.patch('/hallazgos/:id', verificarToken, audCtrl.actualizarHallazgo);
router.patch('/hallazgos/:id/cerrar', verificarToken, audCtrl.cerrarHallazgo);

// CAPA
router.get('/capas/reporte', verificarToken, capaCtrl.reporteCapa);
router.get('/capas', verificarToken, capaCtrl.listarCapas);
router.get('/capas/:id', verificarToken, capaCtrl.obtenerCapa);
router.post('/capas', verificarToken, verificarRol(['admin', 'gestor_calidad', 'auditor']), capaCtrl.crearCapa);
router.put('/capas/:id', verificarToken, verificarRol(['admin', 'gestor_calidad']), capaCtrl.actualizarCapa);
router.patch('/capas/:id/estado', verificarToken, capaCtrl.actualizarEstadoCapa);
router.delete('/capas/:id', verificarToken, verificarRol(['admin', 'gestor_calidad']), capaCtrl.eliminarCapa);

// Riesgos
router.get('/riesgos/reporte', verificarToken, riesgoCtrl.reporteRiesgos);
router.get('/riesgos', verificarToken, riesgoCtrl.listarRiesgos);
router.post('/riesgos', verificarToken, verificarRol(['admin', 'gestor_calidad']), riesgoCtrl.crearRiesgo);
router.get('/riesgos/:riesgo_id/planes-mitigacion', verificarToken, riesgoCtrl.listarPlanesMitigacion);
router.post('/planes-mitigacion', verificarToken, riesgoCtrl.crearPlanMitigacion);

// Indicadores
router.get('/indicadores/reporte', verificarToken, indCtrl.reporteIndicadores);
router.get('/indicadores', verificarToken, indCtrl.listarIndicadores);
router.post('/indicadores', verificarToken, verificarRol(['admin', 'gestor_calidad']), indCtrl.crearIndicador);
router.get('/indicadores/:indicador_id/mediciones', verificarToken, indCtrl.listarMediciones);
router.post('/mediciones', verificarToken, indCtrl.registrarMedicion);

// Encuestas
router.get('/encuestas', verificarToken, encCtrl.listarEncuestas);
router.post('/encuestas', verificarToken, verificarRol(['admin', 'gestor_calidad']), encCtrl.crearEncuesta);
router.post('/encuestas/responder', verificarToken, encCtrl.enviarRespuesta);
router.get('/encuestas/:id/resultados', verificarToken, encCtrl.obtenerResultados);

export default router;
