'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Download, AlertTriangle, CheckCircle, Eye, User, Edit, Trash2, X } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';
import { useAuth } from '@/context/AuthContext';

export default function AuditoriasPage() {
  const { usuario: usuarioActual } = useAuth();
  const [planes, setPlanes] = useState([]);
  const [hallazgos, setHallazgos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tab, setTab] = useState('planes');
  
  // Modal Plan
  const [mostrarModalPlan, setMostrarModalPlan] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [formPlan, setFormPlan] = useState({ codigo: '', nombre: '', tipo: 'interna', fecha_programada: '', lider_id: '' });

  // Modal Hallazgo
  const [mostrarModalHallazgo, setMostrarModalHallazgo] = useState(false);
  const [hallazgoSeleccionado, setHallazgoSeleccionado] = useState(null);
  const [formHallazgo, setFormHallazgo] = useState({ plan_id: '', tipo: 'no_conformidad', gravedad: 'media', descripcion: '' });

  // Modal Ver Plan
  const [mostrarModalVerPlan, setMostrarModalVerPlan] = useState(false);
  const [planParaVer, setPlanParaVer] = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [p, h, u] = await Promise.all([
        axios.get('/api/v1/planes-auditoria'),
        axios.get('/api/v1/hallazgos'),
        axios.get('/api/v1/usuarios'),
      ]);
      setPlanes(p.data);
      setHallazgos(h.data);
      setUsuarios(u.data);
    } catch (err) {
      console.error('Error cargando datos de auditorías', err);
    }
  };

  // --------------------------------------------------------------------------
  // LÓGICA PLANES DE AUDITORÍA
  // --------------------------------------------------------------------------
  const abrirModalNuevoPlan = () => {
    setPlanSeleccionado(null);
    setFormPlan({ codigo: '', nombre: '', tipo: 'interna', fecha_programada: '', lider_id: '' });
    setMostrarModalPlan(true);
  };

  const abrirModalEditarPlan = (plan) => {
    setPlanSeleccionado(plan);
    setFormPlan({
      codigo: plan.codigo,
      nombre: plan.nombre,
      tipo: plan.tipo,
      fecha_programada: plan.fecha_programada,
      lider_id: plan.lider_id || ''
    });
    setMostrarModalPlan(true);
  };

  const guardarPlan = async (e) => {
    e.preventDefault();
    try {
      if (planSeleccionado) {
        await axios.put(`/api/v1/planes-auditoria/${planSeleccionado.id}`, formPlan);
        swalSuccess('Plan de auditoría actualizado');
      } else {
        await axios.post('/api/v1/planes-auditoria', formPlan);
        swalSuccess('Plan de auditoría creado correctamente');
      }
      setMostrarModalPlan(false);
      cargarDatos();
    } catch (err) { swalError(err); }
  };

  const eliminarPlan = async (id) => {
    const result = await swalConfirm('¿Estás seguro de eliminar este Plan de Auditoría?');
    if (result.isConfirmed) {                          // <-- Usar result.isConfirmed
      try {
        await axios.delete(`/api/v1/planes-auditoria/${id}`);
        swalSuccess('Plan eliminado correctamente');
        cargarDatos();
      } catch (err) { swalError(err); }
    }
  };

  // --------------------------------------------------------------------------
  // LÓGICA HALLAZGOS
  // --------------------------------------------------------------------------
  const abrirModalNuevoHallazgo = (planIdDefault = '') => {
    setHallazgoSeleccionado(null);
    setFormHallazgo({ plan_id: planIdDefault, tipo: 'no_conformidad', gravedad: 'media', descripcion: '' });
    setMostrarModalHallazgo(true);
  };

  const abrirModalEditarHallazgo = (hallazgo) => {
    setHallazgoSeleccionado(hallazgo);
    setFormHallazgo({
      plan_id: hallazgo.plan_id || '',
      tipo: hallazgo.tipo,
      gravedad: hallazgo.gravedad,
      descripcion: hallazgo.descripcion
    });
    setMostrarModalHallazgo(true);
  };

  const guardarHallazgo = async (e) => {
    e.preventDefault();
    try {
      if (hallazgoSeleccionado) {
        await axios.patch(`/api/v1/hallazgos/${hallazgoSeleccionado.id}`, formHallazgo);
        swalSuccess('Hallazgo actualizado');
      } else {
        await axios.post('/api/v1/hallazgos', formHallazgo);
        swalSuccess('Hallazgo registrado correctamente');
      }
      setMostrarModalHallazgo(false);
      cargarDatos();
    } catch (err) { swalError(err); }
  };

  const cerrarHallazgo = async (hallazgo) => {
    const result = await swalConfirm('¿Está seguro de cerrar este hallazgo?');
    if (result.isConfirmed) {
      try {
        await axios.patch(`/api/v1/hallazgos/${hallazgo.id}/cerrar`);
        swalSuccess('Hallazgo cerrado correctamente');
        cargarDatos();
      } catch (err) { swalError(err); }
    }
  };

  const eliminarHallazgo = async (id) => {
    const result = await swalConfirm('¿Estás seguro de eliminar este Hallazgo?');
    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/v1/hallazgos/${id}`);
        swalSuccess('Hallazgo eliminado');
        cargarDatos();
      } catch (err) { swalError(err); }
    }
  };

  // --------------------------------------------------------------------------
  // UTILIDADES
  // --------------------------------------------------------------------------
  const descargarReporte = async () => {
    try {
      const response = await axios.get('/api/v1/auditorias/reporte', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'auditorias.pdf');
      link.click();
    } catch (err) { swalError(err); }
  };

  const getIconoGravedad = (g) => {
    if (g === 'critica' || g === 'alta') return <AlertTriangle className="text-red-500" size={20} />;
    return <AlertTriangle className="text-amber-500" size={20} />;
  };

  const getNombreLider = (lider_id) => {
    const u = usuarios.find(u => u.id === lider_id);
    return u ? `${u.nombres} ${u.apellidos}` : 'Sin asignar';
  };

  const hallazgosDelPlan = (planId) => hallazgos.filter(h => h.plan_id === planId);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Search /> Auditorías e Inspecciones
          </h2>
          <button onClick={descargarReporte} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
            <Download size={18} /> Reporte PDF
          </button>
        </div>

        <div className="flex justify-between items-center mb-6 border-b border-slate-200">
          <div className="flex gap-4">
            {['planes', 'hallazgos'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 font-medium capitalize transition-all ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                {t === 'planes' ? 'Planes de Auditoría' : 'Hallazgos'}
              </button>
            ))}
          </div>
          <div className="mb-2">
            {tab === 'planes' && (
              <button onClick={abrirModalNuevoPlan} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Plus size={16} /> Nuevo Plan
              </button>
            )}
            {tab === 'hallazgos' && (
              <button onClick={() => abrirModalNuevoHallazgo()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Plus size={16} /> Nuevo Hallazgo
              </button>
            )}
          </div>
        </div>

        {/* TABLA PLANES */}
        {tab === 'planes' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Líder</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {planes.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{p.codigo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.nombre}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">{p.tipo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center"><User size={12} className="text-slate-500"/></div>
                      {getNombreLider(p.lider_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.fecha_programada}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${p.estado === 'ejecutado' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{p.estado}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setPlanParaVer(p); setMostrarModalVerPlan(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles"><Eye size={18} /></button>
                        {['admin', 'gestor_calidad', 'auditor'].includes(usuarioActual?.rol) && (
                          <>
                            <button onClick={() => abrirModalEditarPlan(p)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar"><Edit size={18} /></button>
                            <button onClick={() => eliminarPlan(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {planes.length === 0 && (
                  <tr><td colSpan="7" className="px-6 py-10 text-center text-slate-500">No hay planes de auditoría registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* LISTA HALLAZGOS */}
        {tab === 'hallazgos' && (
          <div className="space-y-4">
            {hallazgos.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No hay hallazgos registrados</p>
            ) : (
              hallazgos.map(h => (
                <div key={h.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className={`p-3 rounded-xl ${h.gravedad === 'critica' || h.gravedad === 'alta' ? 'bg-red-50' : 'bg-amber-50'}`}>
                    {getIconoGravedad(h.gravedad)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{h.tipo.replace('_', ' ').toUpperCase()}</h4>
                        <p className="text-sm font-medium text-slate-500">
                          Auditoría: <span className="text-slate-700">{h.plan?.codigo || 'N/A'}</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${h.estado === 'cerrado' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {h.estado}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-3">{h.descripcion}</p>
                    
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="text-xs text-slate-400">
                        {h.fecha_cierre && <span>Cerrado el: {h.fecha_cierre}</span>}
                      </div>
                      <div className="flex gap-2">
                        {h.estado === 'abierto' && (
                          <button onClick={() => cerrarHallazgo(h)} className="px-3 py-1.5 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-semibold transition-colors">
                            <CheckCircle size={14} /> Marcar como Cerrado
                          </button>
                        )}
                        {['admin', 'auditor'].includes(usuarioActual?.rol) && (
                          <>
                            <button onClick={() => abrirModalEditarHallazgo(h)} className="px-3 py-1.5 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg font-semibold transition-colors">
                              <Edit size={14} /> Editar
                            </button>
                            <button onClick={() => eliminarHallazgo(h.id)} className="px-3 py-1.5 flex items-center gap-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 rounded-lg font-semibold transition-colors">
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* MODAL CREAR / EDITAR PLAN */}
      {mostrarModalPlan && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <Search className="text-blue-600" size={20} />
                {planSeleccionado ? 'Editar Plan de Auditoría' : 'Nuevo Plan de Auditoría'}
              </h3>
              <button onClick={() => setMostrarModalPlan(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={guardarPlan} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                  <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej. AUD-2024-01" value={formPlan.codigo} onChange={e => setFormPlan({...formPlan, codigo: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Programada</label>
                  <input required type="date" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formPlan.fecha_programada} onChange={e => setFormPlan({...formPlan, fecha_programada: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Auditoría</label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. Auditoría Interna Semestral" value={formPlan.nombre} onChange={e => setFormPlan({...formPlan, nombre: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Auditoría</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formPlan.tipo} onChange={e => setFormPlan({...formPlan, tipo: e.target.value})}>
                    <option value="interna">Interna</option>
                    <option value="externa">Externa</option>
                    <option value="especial">Especial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Auditor Líder</label>
                  <select required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formPlan.lider_id} onChange={e => setFormPlan({...formPlan, lider_id: e.target.value})}>
                    <option value="">Seleccionar responsable...</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setMostrarModalPlan(false)} className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium">
                  {planSeleccionado ? 'Guardar Cambios' : 'Crear Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR HALLAZGO */}
      {mostrarModalHallazgo && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                {hallazgoSeleccionado ? 'Editar Hallazgo' : 'Registrar Hallazgo'}
              </h3>
              <button onClick={() => setMostrarModalHallazgo(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={guardarHallazgo} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan de Auditoría Asociado</label>
                <select required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                  value={formHallazgo.plan_id} onChange={e => setFormHallazgo({...formHallazgo, plan_id: e.target.value})}>
                  <option value="">Seleccionar plan...</option>
                  {planes.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Hallazgo</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formHallazgo.tipo} onChange={e => setFormHallazgo({...formHallazgo, tipo: e.target.value})}>
                    <option value="no_conformidad">No Conformidad</option>
                    <option value="observacion">Observación</option>
                    <option value="oportunidad_mejora">Oportunidad de Mejora</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gravedad</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formHallazgo.gravedad} onChange={e => setFormHallazgo({...formHallazgo, gravedad: e.target.value})}>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción Detallada</label>
                <textarea required rows="4" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Describe la evidencia, el criterio inclumplido, etc." value={formHallazgo.descripcion} onChange={e => setFormHallazgo({...formHallazgo, descripcion: e.target.value})} />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setMostrarModalHallazgo(false)} className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium">
                  {hallazgoSeleccionado ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VER DETALLES DEL PLAN */}
      {mostrarModalVerPlan && planParaVer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                  <Search className="text-blue-600" size={24} /> {planParaVer.codigo}
                </h3>
                <p className="text-slate-500 font-medium">{planParaVer.nombre}</p>
              </div>
              <button onClick={() => setMostrarModalVerPlan(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div><span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Tipo</span><span className="text-slate-800 font-medium capitalize">{planParaVer.tipo}</span></div>
                <div><span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Fecha</span><span className="text-slate-800 font-medium">{planParaVer.fecha_programada}</span></div>
                <div><span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Auditor Líder</span><span className="text-slate-800 font-medium flex items-center gap-2"><User size={14}/> {getNombreLider(planParaVer.lider_id)}</span></div>
                <div><span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Estado</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${planParaVer.estado === 'ejecutado' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{planParaVer.estado}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-800 text-lg">Hallazgos Registrados</h4>
                {['admin', 'auditor'].includes(usuarioActual?.rol) && (
                  <button onClick={() => abrirModalNuevoHallazgo(planParaVer.id)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-bold transition-colors">
                    <Plus size={16} /> Añadir Hallazgo a este Plan
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {hallazgosDelPlan(planParaVer.id).length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-xl border-dashed">
                    <CheckCircle className="mx-auto text-emerald-400 mb-2" size={32} />
                    <p className="text-slate-500 font-medium">Auditoría limpia. No se registraron hallazgos.</p>
                  </div>
                ) : (
                  hallazgosDelPlan(planParaVer.id).map(h => (
                    <div key={h.id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-start gap-3">
                      {getIconoGravedad(h.gravedad)}
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800 uppercase text-sm">{h.tipo.replace('_', ' ')}</span>
                          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${h.estado === 'cerrado' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{h.estado}</span>
                        </div>
                        <p className="text-sm text-slate-600">{h.descripcion}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button onClick={() => setMostrarModalVerPlan(false)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium">
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
