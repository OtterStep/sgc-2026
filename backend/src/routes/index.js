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

const router = Router();

// Auth
router.post('/auth/registrar', authCtrl.registrar);
router.post('/auth/login', authCtrl.login);
router.get('/auth/perfil', verificarToken, authCtrl.perfil);

// Documentos
router.get('/documentos', verificarToken, docCtrl.listarDocumentos);
router.post('/documentos', verificarToken, verificarRol(['admin', 'gestor_calidad']), docCtrl.crearDocumento);
router.get('/documentos/reporte', verificarToken, docCtrl.generarReporteDocumentos);

// Procesos (Mapa de Procesos)
router.get('/macroprocesos', verificarToken, procCtrl.listarMacroprocesos);
router.post('/macroprocesos', verificarToken, verificarRol(['admin', 'gestor_calidad']), procCtrl.crearMacroproceso);
router.get('/procesos', verificarToken, procCtrl.listarProcesos);
router.post('/procesos', verificarToken, verificarRol(['admin', 'gestor_calidad']), procCtrl.crearProceso);
router.get('/procesos/:proceso_id/actividades', verificarToken, procCtrl.listarActividades);
router.post('/actividades', verificarToken, verificarRol(['admin', 'gestor_calidad']), procCtrl.crearActividad);
router.get('/procesos/reporte', verificarToken, procCtrl.reporteMapaProcesos);

// Acreditación
router.get('/estandares', verificarToken, acrCtrl.listarEstandares);
router.post('/estandares', verificarToken, verificarRol(['admin', 'gestor_calidad']), acrCtrl.crearEstandar);
router.get('/estandares/:estandar_id/factores', verificarToken, acrCtrl.listarFactores);
router.post('/factores', verificarToken, verificarRol(['admin', 'gestor_calidad']), acrCtrl.crearFactor);
router.get('/autoevaluaciones', verificarToken, acrCtrl.listarAutoevaluaciones);
router.post('/autoevaluaciones', verificarToken, verificarRol(['admin', 'gestor_calidad']), acrCtrl.crearAutoevaluacion);
router.post('/evaluaciones-criterio', verificarToken, acrCtrl.evaluarCriterio);
router.get('/acreditacion/reporte', verificarToken, acrCtrl.reporteAcreditacion);

// Auditorías
router.get('/planes-auditoria', verificarToken, audCtrl.listarPlanes);
router.post('/planes-auditoria', verificarToken, verificarRol(['admin', 'gestor_calidad', 'auditor']), audCtrl.crearPlan);
router.get('/hallazgos', verificarToken, audCtrl.listarHallazgos);
router.post('/hallazgos', verificarToken, verificarRol(['admin', 'auditor']), audCtrl.crearHallazgo);
router.patch('/hallazgos/:id', verificarToken, audCtrl.actualizarHallazgo);
router.get('/auditorias/reporte', verificarToken, audCtrl.reporteAuditoria);

// CAPA
router.get('/capas', verificarToken, capaCtrl.listarCapas);
router.post('/capas', verificarToken, verificarRol(['admin', 'gestor_calidad', 'auditor']), capaCtrl.crearCapa);
router.patch('/capas/:id/estado', verificarToken, capaCtrl.actualizarEstadoCapa);
router.get('/capas/reporte', verificarToken, capaCtrl.reporteCapa);

// Riesgos
router.get('/riesgos', verificarToken, riesgoCtrl.listarRiesgos);
router.post('/riesgos', verificarToken, verificarRol(['admin', 'gestor_calidad']), riesgoCtrl.crearRiesgo);
router.get('/riesgos/:riesgo_id/planes-mitigacion', verificarToken, riesgoCtrl.listarPlanesMitigacion);
router.post('/planes-mitigacion', verificarToken, riesgoCtrl.crearPlanMitigacion);
router.get('/riesgos/reporte', verificarToken, riesgoCtrl.reporteRiesgos);

// Indicadores
router.get('/indicadores', verificarToken, indCtrl.listarIndicadores);
router.post('/indicadores', verificarToken, verificarRol(['admin', 'gestor_calidad']), indCtrl.crearIndicador);
router.get('/indicadores/:indicador_id/mediciones', verificarToken, indCtrl.listarMediciones);
router.post('/mediciones', verificarToken, indCtrl.registrarMedicion);
router.get('/indicadores/reporte', verificarToken, indCtrl.reporteIndicadores);

// Encuestas
router.get('/encuestas', verificarToken, encCtrl.listarEncuestas);
router.post('/encuestas', verificarToken, verificarRol(['admin', 'gestor_calidad']), encCtrl.crearEncuesta);
router.post('/encuestas/responder', verificarToken, encCtrl.enviarRespuesta);
router.get('/encuestas/:id/resultados', verificarToken, encCtrl.obtenerResultados);

export default router;
