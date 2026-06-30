'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Plus, Download, CheckCircle, Edit, Trash2, X, FileText, ChevronRight, ListChecks, Save } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';
import { useAuth } from '@/context/AuthContext';

export default function AcreditacionPage() {
  const { usuario } = useAuth();
  const esGestion = ['admin', 'gestor_calidad'].includes(usuario?.rol);
  const [estandares, setEstandares] = useState([]);
  const [autoevaluaciones, setAutoevaluaciones] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [tab, setTab] = useState('estandares');

  // Modal Estandar
  const [mostrarModalEstandar, setMostrarModalEstandar] = useState(false);
  const [estandarSeleccionado, setEstandarSeleccionado] = useState(null);
  const [formEstandar, setFormEstandar] = useState({ codigo: '', nombre: '', organizacion: '' });

  // Modal Factores
  const [mostrarModalFactores, setMostrarModalFactores] = useState(false);
  const [estandarFactores, setEstandarFactores] = useState(null);
  const [factores, setFactores] = useState([]);
  const [mostrarFormFactor, setMostrarFormFactor] = useState(false);
  const [editandoFactor, setEditandoFactor] = useState(null);
  const [formFactor, setFormFactor] = useState({ codigo: '', nombre: '', descripcion: '', peso: '' });

  // Modal Autoevaluacion
  const [mostrarModalAuto, setMostrarModalAuto] = useState(false);
  const [autoSeleccionada, setAutoSeleccionada] = useState(null);
  const [autoEditando, setAutoEditando] = useState(null);
  const [formAuto, setFormAuto] = useState({ periodo: '', estandar_id: '' });

  // Modal Detalle Autoevaluacion
  const [mostrarDetalleAuto, setMostrarDetalleAuto] = useState(false);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargandoEval, setCargandoEval] = useState(false);
  const [mostrarFormEval, setMostrarFormEval] = useState(false);
  const [editandoEval, setEditandoEval] = useState(null);
  const [formEval, setFormEval] = useState({ factor_id: '', cumplimiento: 'cumple', puntaje: '', evidencias: '', observaciones: '' });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [e, a, p] = await Promise.all([
        axios.get('/api/v1/estandares'),
        axios.get('/api/v1/autoevaluaciones'),
        axios.get('/api/v1/periodos-academicos'),
      ]);
      setEstandares(e.data);
      setAutoevaluaciones(a.data);
      setPeriodos(p.data);
    } catch (err) {
      setEstandares([]);
      setAutoevaluaciones([]);
    }
  };

  // ──────────────────────────────────────────────
  // Lógica Estándares
  // ──────────────────────────────────────────────
  const abrirModalNuevoEstandar = () => {
    setEstandarSeleccionado(null);
    setFormEstandar({ codigo: '', nombre: '', organizacion: '' });
    setMostrarModalEstandar(true);
  };

  const abrirModalEditarEstandar = (e) => {
    setEstandarSeleccionado(e);
    setFormEstandar({ codigo: e.codigo, nombre: e.nombre, organizacion: e.organizacion });
    setMostrarModalEstandar(true);
  };

  const guardarEstandar = async (e) => {
    e.preventDefault();
    try {
      if (estandarSeleccionado) {
        await axios.put(`/api/v1/estandares/${estandarSeleccionado.id}`, formEstandar);
        swalSuccess('Estándar actualizado correctamente');
      } else {
        await axios.post('/api/v1/estandares', formEstandar);
        swalSuccess('Estándar registrado correctamente');
      }
      setMostrarModalEstandar(false);
      cargarDatos();
    } catch (err) { swalError(err); }
  };

  const eliminarEstandar = async (id) => {
    const confirmado = await swalConfirm('¿Estás seguro de eliminar este estándar?', 'No podrás revertir esto');
    if (confirmado) {
      try {
        await axios.delete(`/api/v1/estandares/${id}`);
        swalSuccess('Estándar eliminado');
        cargarDatos();
      } catch (err) { swalError(err); }
    }
  };

  // ──────────────────────────────────────────────
  // Lógica Factores
  // ──────────────────────────────────────────────
  const abrirGestionFactores = async (estandar) => {
    setEstandarFactores(estandar);
    setMostrarFormFactor(false);
    setEditandoFactor(null);
    try {
      const { data } = await axios.get(`/api/v1/estandares/${estandar.id}/factores`);
      setFactores(data);
    } catch { setFactores([]); }
    setMostrarModalFactores(true);
  };

  const abrirNuevoFactor = () => {
    setEditandoFactor(null);
    setFormFactor({ codigo: '', nombre: '', descripcion: '', peso: '' });
    setMostrarFormFactor(true);
  };

  const abrirEditarFactor = (f) => {
    setEditandoFactor(f);
    setFormFactor({ codigo: f.codigo, nombre: f.nombre, descripcion: f.descripcion || '', peso: f.peso || '' });
    setMostrarFormFactor(true);
  };

  const guardarFactor = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formFactor, estandar_id: estandarFactores.id };
      if (editandoFactor) {
        await axios.put(`/api/v1/factores/${editandoFactor.id}`, payload);
        swalSuccess('Factor actualizado');
      } else {
        await axios.post('/api/v1/factores', payload);
        swalSuccess('Factor creado');
      }
      setMostrarFormFactor(false);
      setEditandoFactor(null);
      const { data } = await axios.get(`/api/v1/estandares/${estandarFactores.id}/factores`);
      setFactores(data);
    } catch (err) { swalError(err); }
  };

  const eliminarFactor = async (id) => {
    const confirmado = await swalConfirm('¿Eliminar este factor?', 'Se eliminarán también sus evaluaciones asociadas');
    if (!confirmado) return;
    try {
      await axios.delete(`/api/v1/factores/${id}`);
      swalSuccess('Factor eliminado');
      const { data } = await axios.get(`/api/v1/estandares/${estandarFactores.id}/factores`);
      setFactores(data);
    } catch (err) { swalError(err); }
  };

  // ──────────────────────────────────────────────
  // Lógica Autoevaluaciones
  // ──────────────────────────────────────────────
  const verDetalleAuto = async (auto) => {
    setAutoSeleccionada(auto);
    setMostrarDetalleAuto(true);
    setMostrarFormEval(false);
    setEditandoEval(null);
    setCargandoEval(true);
    setFactores([]);
    try {
      const [evalRes, facRes] = await Promise.all([
        axios.get(`/api/v1/evaluaciones-criterio?autoevaluacion_id=${auto.id}`),
        auto.estandar_id ? axios.get(`/api/v1/estandares/${auto.estandar_id}/factores`) : Promise.resolve({ data: [] }),
      ]);
      setEvaluaciones(evalRes.data);
      setFactores(facRes.data);
    } catch { setEvaluaciones([]); setFactores([]); }
    setCargandoEval(false);
  };

  const abrirModalNuevaAuto = () => {
    setAutoEditando(null);
    setFormAuto({ periodo: '', estandar_id: '' });
    setMostrarModalAuto(true);
  };

  const guardarAutoevaluacion = async (e) => {
    e.preventDefault();
    try {
      if (autoEditando) {
        swalError('Editar no soportado');
      } else {
        await axios.post('/api/v1/autoevaluaciones', formAuto);
        swalSuccess('Autoevaluación registrada correctamente');
      }
      setMostrarModalAuto(false);
      cargarDatos();
    } catch (err) { swalError(err); }
  };

  const eliminarAutoevaluacion = async (id) => {
    const confirmado = await swalConfirm('¿Estás seguro de eliminar esta autoevaluación?');
    if (confirmado) {
      try {
        await axios.delete(`/api/v1/autoevaluaciones/${id}`);
        swalSuccess('Autoevaluación eliminada');
        cargarDatos();
      } catch (err) { swalError(err); }
    }
  };

  // ──────────────────────────────────────────────
  // Lógica Evaluación de Criterios
  // ──────────────────────────────────────────────
  const abrirNuevaEval = (factor) => {
    setEditandoEval(null);
    setFormEval({ factor_id: factor.id, cumplimiento: 'cumple', puntaje: '', evidencias: '', observaciones: '' });
    setMostrarFormEval(true);
  };

  const abrirEditarEval = (ev) => {
    setEditandoEval(ev);
    setFormEval({
      factor_id: ev.factor_id,
      cumplimiento: ev.cumplimiento || 'cumple',
      puntaje: ev.puntaje || '',
      evidencias: ev.evidencias || '',
      observaciones: ev.observaciones || ''
    });
    setMostrarFormEval(true);
  };

  const guardarEvaluacion = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formEval, autoevaluacion_id: autoSeleccionada.id };
      if (editandoEval) {
        await axios.put(`/api/v1/evaluaciones-criterio/${editandoEval.id}`, payload);
        swalSuccess('Evaluación actualizada');
      } else {
        await axios.post('/api/v1/evaluaciones-criterio', payload);
        swalSuccess('Evaluación registrada');
      }
      setMostrarFormEval(false);
      setEditandoEval(null);
      const { data } = await axios.get(`/api/v1/evaluaciones-criterio?autoevaluacion_id=${autoSeleccionada.id}`);
      setEvaluaciones(data);
      cargarDatos();
    } catch (err) { swalError(err); }
  };

  const descargarReporte = async () => {
    try {
      const response = await axios.get('/api/v1/acreditacion/reporte', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'acreditacion.pdf');
      link.click();
    } catch (err) { swalError(err); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Award /> Acreditación y Autoevaluación</h2>
          <button onClick={descargarReporte} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"><Download size={18} /> Reporte PDF</button>
        </div>

        <div className="flex justify-between items-center mb-6 border-b border-slate-200">
          <div className="flex gap-4">
            {['estandares', 'autoevaluaciones'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 font-medium capitalize transition-all ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                {t === 'estandares' ? 'Estándares' : 'Autoevaluaciones'}
              </button>
            ))}
          </div>
          {tab === 'estandares' && esGestion && (
            <button onClick={abrirModalNuevoEstandar} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium mb-2">
              <Plus size={16} /> Nuevo Estándar
            </button>
          )}
          {tab === 'autoevaluaciones' && esGestion && (
            <button onClick={abrirModalNuevaAuto} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium mb-2">
              <Plus size={16} /> Nueva Autoevaluación
            </button>
          )}
        </div>

        {/* CONTENIDO ESTÁNDARES */}
        {tab === 'estandares' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {estandares.length === 0 ? (
               <p className="col-span-3 text-center text-slate-500 py-10">No hay estándares registrados</p>
            ) : (
              estandares.map(e => (
                <div key={e.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 flex-1">
                      <p className="text-sm font-mono text-slate-500">{e.codigo}</p>
                      <h3 className="font-semibold text-slate-900 text-lg mt-1 leading-snug">{e.nombre}</h3>
                      <div className="mt-3">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100">
                          {e.organizacion}
                        </span>
                      </div>
                    </div>
                    {esGestion && (
                      <div className="flex gap-2 pt-4 border-t border-slate-100">
                        <button onClick={() => abrirGestionFactores(e)} className="flex-1 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex justify-center items-center gap-2 text-sm font-medium transition-colors">
                          <ListChecks size={16} /> Factores
                        </button>
                        <button onClick={() => abrirModalEditarEstandar(e)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex justify-center items-center gap-2 text-sm font-medium transition-colors">
                          <Edit size={16} /> Editar
                        </button>
                        <button onClick={() => eliminarEstandar(e.id)} className="py-2 px-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CONTENIDO AUTOEVALUACIONES */}
        {tab === 'autoevaluaciones' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {autoevaluaciones.length === 0 ? (
               <p className="col-span-3 text-center text-slate-500 py-10">No hay autoevaluaciones registradas</p>
            ) : (
              autoevaluaciones.map(a => (
                <div key={a.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{a.periodo}</p>
                      <p className="font-semibold text-slate-900 mt-1">{a.estandar?.nombre}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${a.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {a.estado === 'completada' ? 'Completada' : 'En Proceso'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <CheckCircle size={24} className={a.estado === 'completada' ? 'text-emerald-500' : 'text-amber-500'} />
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-800">{a.puntaje_total || '0'}</span>
                        <span className="text-sm text-slate-500 font-medium">/ 100</span>
                      </div>
                      <p className="text-xs text-slate-400">Puntaje obtenido</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => verDetalleAuto(a)} className="flex-1 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                      <FileText size={16} /> Ver Detalle
                    </button>
                    {esGestion && (
                      <button onClick={() => eliminarAutoevaluacion(a.id)} className="py-2 px-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* MODAL CREAR/EDITAR ESTÁNDAR */}
      {mostrarModalEstandar && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">
                {estandarSeleccionado ? 'Editar Estándar' : 'Nuevo Estándar'}
              </h3>
              <button onClick={() => setMostrarModalEstandar(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={guardarEstandar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej. ISO-9001" value={formEstandar.codigo} onChange={e => setFormEstandar({...formEstandar, codigo: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej. Sistema de Gestión de Calidad" value={formEstandar.nombre} onChange={e => setFormEstandar({...formEstandar, nombre: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Organización</label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej. ISO, SUNEDU, SINEACE" value={formEstandar.organizacion} onChange={e => setFormEstandar({...formEstandar, organizacion: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setMostrarModalEstandar(false)} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium transition-colors">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GESTIONAR FACTORES */}
      {mostrarModalFactores && estandarFactores && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">Factores de Evaluación</h3>
                <p className="text-sm text-slate-500">{estandarFactores.codigo} — {estandarFactores.nombre}</p>
              </div>
              <button onClick={() => setMostrarModalFactores(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-end mb-4">
                {esGestion && (
                  <button onClick={abrirNuevoFactor} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <Plus size={16} /> Nuevo Factor
                  </button>
                )}
              </div>
              {factores.length === 0 ? (
                <p className="text-center text-slate-400 py-10">No hay factores registrados para este estándar.</p>
              ) : (
                <div className="space-y-3">
                  {factores.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-500">{f.codigo}</span>
                          <span className="font-medium text-slate-800">{f.nombre}</span>
                          {f.peso && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{f.peso}%</span>}
                        </div>
                        {f.descripcion && <p className="text-xs text-slate-500 mt-1">{f.descripcion}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0 ml-4">
                        {esGestion && <button onClick={() => abrirEditarFactor(f)} className="text-blue-600 hover:text-blue-800 text-sm font-medium"><Edit size={14} /></button>}
                        {esGestion && <button onClick={() => eliminarFactor(f.id)} className="text-red-600 hover:text-red-800 text-sm font-medium"><Trash2 size={14} /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button onClick={() => setMostrarModalFactores(false)} className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM FACTOR */}
      {mostrarFormFactor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">{editandoFactor ? 'Editar Factor' : 'Nuevo Factor'}</h3>
              <button onClick={() => { setMostrarFormFactor(false); setEditandoFactor(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={guardarFactor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ej. F-001" value={formFactor.codigo} onChange={e => setFormFactor({...formFactor, codigo: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ej. Misión y Visión" value={formFactor.nombre} onChange={e => setFormFactor({...formFactor, nombre: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Peso (%)</label>
                <input type="number" step="0.01" min="0" max="100" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ej. 15" value={formFactor.peso} onChange={e => setFormFactor({...formFactor, peso: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción <span className="text-slate-400 font-normal">(opcional)</span></label>
                <textarea rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Descripción del factor" value={formFactor.descripcion} onChange={e => setFormFactor({...formFactor, descripcion: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => { setMostrarFormFactor(false); setEditandoFactor(null); }} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium transition-colors">{editandoFactor ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR AUTOEVALUACION */}
      {mostrarModalAuto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">Nueva Autoevaluación</h3>
              <button onClick={() => setMostrarModalAuto(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={guardarAutoevaluacion} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Periodo Académico</label>
                <select required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formAuto.periodo} onChange={e => setFormAuto({...formAuto, periodo: e.target.value})}>
                  <option value="">Seleccionar periodo</option>
                  {periodos.map(p => <option key={p.id} value={p.codigo}>{p.codigo} — {p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estándar</label>
                <select required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formAuto.estandar_id} onChange={e => setFormAuto({...formAuto, estandar_id: e.target.value})}>
                  <option value="">Seleccionar estándar</option>
                  {estandares.map(e => <option key={e.id} value={e.id}>{e.codigo} - {e.nombre}</option>)}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setMostrarModalAuto(false)} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium transition-colors">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VER DETALLE AUTOEVALUACION */}
      {mostrarDetalleAuto && autoSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">Detalle de Autoevaluación</h3>
                <p className="text-sm text-slate-500">{autoSeleccionada.periodo} • {autoSeleccionada.estandar?.nombre}</p>
              </div>
              <button onClick={() => setMostrarDetalleAuto(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Puntaje Final</p>
                  <p className="text-3xl font-bold text-blue-800">{autoSeleccionada.puntaje_total || '0'} <span className="text-base font-normal text-blue-600">/ 100</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600 font-medium mb-1">Estado</p>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${autoSeleccionada.estado === 'completada' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
                    {autoSeleccionada.estado === 'completada' ? 'Completada' : 'En Proceso'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Award size={18} className="text-slate-400" /> Evaluación por Factores
                </h4>
              </div>

              {cargandoEval ? (
                <p className="text-center text-slate-400 py-6">Cargando evaluaciones...</p>
              ) : evaluaciones.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No hay evaluaciones registradas para esta autoevaluación.</p>
                  <p className="text-sm text-slate-400 mb-4">Selecciona un factor del estándar para comenzar a evaluar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {evaluaciones.map(ev => (
                    <div key={ev.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-700">{ev.factor?.codigo} — {ev.factor?.nombre}</span>
                          {ev.factor?.peso && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{ev.factor.peso}%</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${ev.cumplimiento === 'cumple' ? 'bg-emerald-100 text-emerald-700' : ev.cumplimiento === 'cumple_parcial' ? 'bg-amber-100 text-amber-700' : ev.cumplimiento === 'no_cumple' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                            {ev.cumplimiento === 'cumple' ? 'Cumple' : ev.cumplimiento === 'cumple_parcial' ? 'Cumple Parcial' : ev.cumplimiento === 'no_cumple' ? 'No Cumple' : 'N/A'}
                          </span>
                          {ev.puntaje && <span>Puntaje: <strong>{ev.puntaje}</strong></span>}
                        </div>
                        {ev.evidencias && <p className="text-xs text-slate-400 mt-1 truncate">Evidencias: {ev.evidencias}</p>}
                      </div>
                      {esGestion && (
                        <button onClick={() => abrirEditarEval(ev)} className="text-blue-600 hover:text-blue-800 shrink-0 ml-4">
                          <Edit size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {esGestion && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-600 mb-3">Agregar evaluación para un factor:</p>
                  <div className="flex flex-wrap gap-2">
                    {factores.filter(f => !evaluaciones.find(ev => ev.factor_id === f.id)).map(f => (
                      <button key={f.id} onClick={() => abrirNuevaEval(f)} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                        <Plus size={12} className="inline mr-1" />{f.codigo} — {f.nombre}
                      </button>
                    ))}
                    {factores.filter(f => !evaluaciones.find(ev => ev.factor_id === f.id)).length === 0 && (
                      <p className="text-xs text-slate-400">Todos los factores ya tienen evaluación.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button onClick={() => setMostrarDetalleAuto(false)} className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM EVALUACION */}
      {mostrarFormEval && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">{editandoEval ? 'Editar Evaluación' : 'Evaluar Factor'}</h3>
              <button onClick={() => { setMostrarFormEval(false); setEditandoEval(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={guardarEvaluacion} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Factor</label>
                <select required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formEval.factor_id} onChange={e => setFormEval({...formEval, factor_id: e.target.value})}>
                  <option value="">Seleccionar factor</option>
                  {factores.map(f => <option key={f.id} value={f.id}>{f.codigo} — {f.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cumplimiento</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formEval.cumplimiento} onChange={e => setFormEval({...formEval, cumplimiento: e.target.value})}>
                  <option value="cumple">Cumple</option>
                  <option value="cumple_parcial">Cumple Parcial</option>
                  <option value="no_cumple">No Cumple</option>
                  <option value="no_aplica">No Aplica</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Puntaje</label>
                <input type="number" step="0.01" min="0" max="100" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="0.00" value={formEval.puntaje} onChange={e => setFormEval({...formEval, puntaje: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Evidencias <span className="text-slate-400 font-normal">(opcional)</span></label>
                <textarea rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Descripción de evidencias o enlaces" value={formEval.evidencias} onChange={e => setFormEval({...formEval, evidencias: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones <span className="text-slate-400 font-normal">(opcional)</span></label>
                <textarea rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Observaciones adicionales" value={formEval.observaciones} onChange={e => setFormEval({...formEval, observaciones: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => { setMostrarFormEval(false); setEditandoEval(null); }} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 font-medium transition-colors flex items-center justify-center gap-2">
                  <Save size={16} /> {editandoEval ? 'Actualizar' : 'Guardar Evaluación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
