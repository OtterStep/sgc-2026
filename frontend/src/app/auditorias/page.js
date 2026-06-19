'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Download, AlertTriangle, CheckCircle, Eye, User, Edit, XCircle } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';

export default function AuditoriasPage() {
  const [planes, setPlanes] = useState([]);
  const [hallazgos, setHallazgos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [tab, setTab] = useState('planes');
  const [nuevoPlan, setNuevoPlan] = useState({ codigo: '', nombre: '', tipo: 'interna', fecha_programada: '', lider_id: '' });
  const [nuevoHallazgo, setNuevoHallazgo] = useState({ plan_id: '', tipo: 'no_conformidad', gravedad: 'media', descripcion: '' });
  const [mostrarModalVerPlan, setMostrarModalVerPlan] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [mostrarModalNuevoHallazgo, setMostrarModalNuevoHallazgo] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [p, h, u] = await Promise.all([
        axios.get('/api/v1/planes-auditoria'),
        axios.get('/api/v1/hallazgos'),
        axios.get('/api/v1/auth/usuarios'),
      ]);
      setPlanes(p.data);
      setHallazgos(h.data);
      setUsuarios(u.data);
    } catch (err) {
      setPlanes([
        { id: '1', codigo: 'AUD-2024-01', nombre: 'Auditoría Interna de Calidad', tipo: 'interna', fecha_programada: '2024-06-15', estado: 'planificado' },
      ]);
      setHallazgos([
        { id: '1', tipo: 'no_conformidad', descripcion: 'Falta de trazabilidad en sílabos', gravedad: 'alta', estado: 'abierto', plan: { codigo: 'AUD-2024-01' } },
      ]);
    }
  };

  const handleCrearPlan = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/planes-auditoria', nuevoPlan);
      setNuevoPlan({ codigo: '', nombre: '', tipo: 'interna', fecha_programada: '', lider_id: '' });
      swalSuccess('Plan de auditoría creado correctamente');
      cargarDatos();
    } catch (err) { swalError(err); }
  };

  const handleCrearHallazgo = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/hallazgos', nuevoHallazgo);
      setNuevoHallazgo({ plan_id: '', tipo: 'no_conformidad', gravedad: 'media', descripcion: '' });
      setMostrarModalNuevoHallazgo(false);
      swalSuccess('Hallazgo registrado correctamente');
      cargarDatos();
    } catch (err) { swalError(err); }
  };

  const handleCerrarHallazgo = async (hallazgo) => {
    const result = await swalConfirm('¿Está seguro de cerrar este hallazgo?');
    if (result.isConfirmed) {
      try {
        await axios.patch(`/api/v1/hallazgos/${hallazgo.id}/cerrar`);
        swalSuccess('Hallazgo cerrado correctamente');
        cargarDatos();
      } catch (err) { swalError(err); }
    }
  };

  const handleVerPlan = (plan) => {
    setPlanSeleccionado(plan);
    setMostrarModalVerPlan(true);
  };

  const hallazgosDelPlan = (planId) => hallazgos.filter(h => h.plan_id === planId);

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
    if (g === 'critica' || g === 'alta') return <AlertTriangle className="text-red-500" size={18} />;
    return <CheckCircle className="text-amber-500" size={18} />;
  };

  const getNombreLider = (lider_id) => {
    const u = usuarios.find(u => u.id === lider_id);
    return u ? `${u.nombres} ${u.apellidos}` : 'Sin asignar';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Search /> Auditorías e Inspecciones</h2>
          <button onClick={descargarReporte} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"><Download size={18} /> Reporte PDF</button>
        </div>

        <div className="flex gap-4 mb-6 border-b border-slate-200">
          {['planes', 'hallazgos'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium capitalize ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
              {t === 'planes' ? 'Planes de Auditoría' : 'Hallazgos'}
            </button>
          ))}
        </div>

        {tab === 'planes' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus size={18} /> Nuevo Plan</h3>
              <form onSubmit={handleCrearPlan} className="grid grid-cols-5 gap-4">
                <input placeholder="Código" className="px-3 py-2 border rounded-lg" value={nuevoPlan.codigo} onChange={e => setNuevoPlan({...nuevoPlan, codigo: e.target.value})} required />
                <input placeholder="Nombre" className="px-3 py-2 border rounded-lg" value={nuevoPlan.nombre} onChange={e => setNuevoPlan({...nuevoPlan, nombre: e.target.value})} required />
                <select className="px-3 py-2 border rounded-lg" value={nuevoPlan.tipo} onChange={e => setNuevoPlan({...nuevoPlan, tipo: e.target.value})}>
                  <option value="interna">Interna</option>
                  <option value="externa">Externa</option>
                  <option value="especial">Especial</option>
                </select>
                <input type="date" className="px-3 py-2 border rounded-lg" value={nuevoPlan.fecha_programada} onChange={e => setNuevoPlan({...nuevoPlan, fecha_programada: e.target.value})} required />
                <select className="px-3 py-2 border rounded-lg" value={nuevoPlan.lider_id} onChange={e => setNuevoPlan({...nuevoPlan, lider_id: e.target.value})}>
                  <option value="">Asignar Líder</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>)}
                </select>
                <button type="submit" className="col-span-5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Programar Auditoría</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Código</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipo</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Líder</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Fecha</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acciones</th></tr></thead>
                <tbody className="divide-y divide-slate-200">
                  {planes.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium">{p.codigo}</td>
                      <td className="px-6 py-4 text-sm">{p.nombre}</td>
                      <td className="px-6 py-4 text-sm capitalize">{p.tipo}</td>
                      <td className="px-6 py-4 text-sm flex items-center gap-1">
                        <User size={14} className="text-slate-500" />
                        {getNombreLider(p.lider_id)}
                      </td>
                      <td className="px-6 py-4 text-sm">{p.fecha_programada}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${p.estado === 'ejecutado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{p.estado}</span></td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleVerPlan(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver detalles">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'hallazgos' && (
          <div className="space-y-4">
            {hallazgos.map(h => (
              <div key={h.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
                {getIconoGravedad(h.gravedad)}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900">{h.tipo.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-slate-600 mt-1">{h.descripcion}</p>
                      <p className="text-xs text-slate-400 mt-1">Plan: {h.plan?.codigo}</p>
                      {h.fecha_cierre && (
                        <p className="text-xs text-slate-500 mt-1">Fecha de Cierre: {h.fecha_cierre}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${h.estado === 'cerrado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.estado}</span>
                      {h.estado === 'abierto' && (
                        <button onClick={() => handleCerrarHallazgo(h)} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
                          <CheckCircle size={14} /> Cerrar Hallazgo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Ver Plan */}
        {mostrarModalVerPlan && planSeleccionado && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <Search className="text-blue-600" size={20} /> 
                  Detalles del Plan de Auditoría
                </h3>
                <button onClick={() => setMostrarModalVerPlan(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none">
                  &times;
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Código</span>
                    <p className="text-slate-800 font-semibold">{planSeleccionado.codigo}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Tipo</span>
                    <p className="text-slate-800 capitalize">{planSeleccionado.tipo}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Líder</span>
                    <p className="text-slate-800">{getNombreLider(planSeleccionado.lider_id)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Fecha Programada</span>
                    <p className="text-slate-800">{planSeleccionado.fecha_programada}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-slate-500 font-medium">Estado</span>
                    <p className="text-slate-800 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${planSeleccionado.estado === 'ejecutado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {planSeleccionado.estado}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-slate-800">Hallazgos</h4>
                    <button 
                      onClick={() => { setNuevoHallazgo({ ...nuevoHallazgo, plan_id: planSeleccionado.id }); setMostrarModalNuevoHallazgo(true); }} 
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={16} /> Nuevo Hallazgo
                    </button>
                  </div>
                  <div className="space-y-3">
                    {hallazgosDelPlan(planSeleccionado.id).length === 0 ? (
                      <p className="text-slate-500 text-center py-6">No hay hallazgos registrados para este plan</p>
                    ) : (
                      hallazgosDelPlan(planSeleccionado.id).map(h => (
                        <div key={h.id} className="bg-slate-50 p-4 rounded-lg flex items-start gap-3">
                          {getIconoGravedad(h.gravedad)}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-slate-900">{h.tipo.replace('_', ' ').toUpperCase()} - <span className="text-xs text-slate-500">{h.gravedad.toUpperCase()}</span></p>
                                <p className="text-sm text-slate-600 mt-1">{h.descripcion}</p>
                                {h.fecha_cierre && (
                                  <p className="text-xs text-slate-500 mt-1">Fecha de Cierre: {h.fecha_cierre}</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${h.estado === 'cerrado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.estado}</span>
                                {h.estado === 'abierto' && (
                                  <button onClick={() => handleCerrarHallazgo(h)} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
                                    <CheckCircle size={14} /> Cerrar Hallazgo
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setMostrarModalVerPlan(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Nuevo Hallazgo */}
        {mostrarModalNuevoHallazgo && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <AlertTriangle className="text-amber-600" size={20} /> 
                  Nuevo Hallazgo
                </h3>
                <button onClick={() => setMostrarModalNuevoHallazgo(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none">
                  &times;
                </button>
              </div>
              <form onSubmit={handleCrearHallazgo} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan de Auditoría</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                    value={nuevoHallazgo.plan_id}
                    onChange={(e) => setNuevoHallazgo({ ...nuevoHallazgo, plan_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar Plan</option>
                    {planes.map(p => (
                      <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                      value={nuevoHallazgo.tipo}
                      onChange={(e) => setNuevoHallazgo({ ...nuevoHallazgo, tipo: e.target.value })}
                      required
                    >
                      <option value="no_conformidad">No Conformidad</option>
                      <option value="observacion">Observación</option>
                      <option value="oportunidad_mejora">Oportunidad de Mejora</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gravedad</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                      value={nuevoHallazgo.gravedad}
                      onChange={(e) => setNuevoHallazgo({ ...nuevoHallazgo, gravedad: e.target.value })}
                      required
                    >
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción de la Desviación</label>
                  <textarea
                    placeholder="Describa la desviación encontrada..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    value={nuevoHallazgo.descripcion}
                    onChange={(e) => setNuevoHallazgo({ ...nuevoHallazgo, descripcion: e.target.value })}
                    required
                  />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setMostrarModalNuevoHallazgo(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Guardar Hallazgo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
