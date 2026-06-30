'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Plus, Download, CheckCircle, Edit, Trash2, X, FileText, ChevronRight } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';
import { useAuth } from '@/context/AuthContext';

export default function AcreditacionPage() {
  const { usuario } = useAuth();
  const [estandares, setEstandares] = useState([]);
  const [autoevaluaciones, setAutoevaluaciones] = useState([]);
  const [tab, setTab] = useState('estandares');

  // Modal Estandar
  const [mostrarModalEstandar, setMostrarModalEstandar] = useState(false);
  const [estandarSeleccionado, setEstandarSeleccionado] = useState(null);
  const [formEstandar, setFormEstandar] = useState({ codigo: '', nombre: '', organizacion: '' });

  // Modal Autoevaluacion
  const [mostrarModalAuto, setMostrarModalAuto] = useState(false);
  const [autoSeleccionada, setAutoSeleccionada] = useState(null);
  const [autoEditando, setAutoEditando] = useState(null);
  const [formAuto, setFormAuto] = useState({ periodo: '', estandar_id: '' });

  // Modal Detalle Autoevaluacion
  const [mostrarDetalleAuto, setMostrarDetalleAuto] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [e, a] = await Promise.all([
        axios.get('/api/v1/estandares'),
        axios.get('/api/v1/autoevaluaciones'),
      ]);
      setEstandares(e.data);
      setAutoevaluaciones(a.data);
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
  // Lógica Autoevaluaciones
  // ──────────────────────────────────────────────
  const verDetalleAuto = (auto) => {
    setAutoSeleccionada(auto);
    setMostrarDetalleAuto(true);
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
        // No hay endpoint PUT para autoevaluaciones, solo soportamos crear
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
          {tab === 'estandares' && ['admin', 'gestor_calidad'].includes(usuario?.rol) && (
            <button onClick={abrirModalNuevoEstandar} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium mb-2">
              <Plus size={16} /> Nuevo Estándar
            </button>
          )}
          {tab === 'autoevaluaciones' && ['admin', 'gestor_calidad'].includes(usuario?.rol) && (
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
                    {['admin', 'gestor_calidad'].includes(usuario?.rol) && (
                      <div className="flex gap-2 pt-4 border-t border-slate-100">
                        <button onClick={() => abrirModalEditarEstandar(e)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex justify-center items-center gap-2 text-sm font-medium transition-colors">
                          <Edit size={16} /> Editar
                        </button>
                        <button onClick={() => eliminarEstandar(e.id)} className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex justify-center items-center gap-2 text-sm font-medium transition-colors">
                          <Trash2 size={16} /> Eliminar
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
                    {['admin', 'gestor_calidad'].includes(usuario?.rol) && (
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Periodo</label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej. 2026-I" value={formAuto.periodo} onChange={e => setFormAuto({...formAuto, periodo: e.target.value})} />
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
            <div className="p-6 overflow-y-auto">
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

              <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Award size={18} className="text-slate-400" /> Resumen de Evaluación
              </h4>
              <div className="space-y-3">
                {/* Mock data for details since we don't have full evaluation fetching built in the API yet */}
                {[
                  { factor: 'Liderazgo y Gobernanza', puntaje: 18, max: 20 },
                  { factor: 'Gestión de Recursos', puntaje: 15, max: 20 },
                  { factor: 'Procesos Misionales', puntaje: 25, max: 30 },
                  { factor: 'Resultados e Impacto', puntaje: autoSeleccionada.puntaje_total > 58 ? Math.round(autoSeleccionada.puntaje_total - 58) : 0, max: 30 }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 font-medium border border-slate-200 shadow-sm">
                        {i + 1}
                      </div>
                      <span className="font-medium text-slate-700">{item.factor}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.puntaje / item.max > 0.8 ? 'bg-emerald-500' : item.puntaje / item.max > 0.5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${(item.puntaje / item.max) * 100}%` }}></div>
                      </div>
                      <span className="font-mono text-sm font-semibold text-slate-700 w-12 text-right">
                        {item.puntaje}/{item.max}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button onClick={() => setMostrarDetalleAuto(false)} className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
