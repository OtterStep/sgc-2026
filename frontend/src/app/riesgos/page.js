'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Plus, Download, AlertTriangle, Edit, Trash2, X, Grid3X3, List, Thermometer, Shield } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';
import { useAuth } from '@/context/AuthContext';

const CATEGORIAS = ['estrategico', 'operativo', 'academico', 'financiero', 'legal', 'tecnologico', 'reputacional'];

const NIVEL_COLORS = {
  bajo: { bg: 'bg-emerald-500', text: 'text-emerald-700', cell: 'bg-emerald-100' },
  medio: { bg: 'bg-amber-500', text: 'text-amber-700', cell: 'bg-amber-100' },
  alto: { bg: 'bg-orange-500', text: 'text-orange-700', cell: 'bg-orange-100' },
  critico: { bg: 'bg-red-600', text: 'text-red-700', cell: 'bg-red-100' },
};

export default function RiesgosPage() {
  const { usuario } = useAuth();
  const esGestion = ['admin', 'gestor_calidad'].includes(usuario?.rol);
  const [riesgos, setRiesgos] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [riesgoSeleccionado, setRiesgoSeleccionado] = useState(null);
  const [vista, setVista] = useState('lista');
  const [nuevoRiesgo, setNuevoRiesgo] = useState({
    codigo: '', nombre: '', descripcion: '', categoria: 'operativo', probabilidad: 3, impacto: 3, proceso_id: ''
  });

  // Planes de Mitigación
  const [mostrarModalPlanes, setMostrarModalPlanes] = useState(false);
  const [riesgoPlan, setRiesgoPlan] = useState(null);
  const [planes, setPlanes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFormPlan, setMostrarFormPlan] = useState(false);
  const [editandoPlan, setEditandoPlan] = useState(null);
  const [formPlan, setFormPlan] = useState({ descripcion: '', responsable_id: '', fecha_inicio: '', fecha_fin: '', estado: 'planificado' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [riesgosRes, procesosRes] = await Promise.all([
        axios.get('/api/v1/riesgos'),
        axios.get('/api/v1/procesos')
      ]);
      setRiesgos(riesgosRes.data);
      setProcesos(procesosRes.data);
    } catch (err) {
      console.error('Error cargando datos de riesgos', err);
      setRiesgos([]);
      setProcesos([]);
    }
  };

  const calcularNivel = (p, i) => {
    const val = p * i;
    if (val <= 4) return { label: 'Bajo', color: 'bg-emerald-100 text-emerald-700', key: 'bajo' };
    if (val <= 9) return { label: 'Medio', color: 'bg-amber-100 text-amber-700', key: 'medio' };
    if (val <= 14) return { label: 'Alto', color: 'bg-orange-100 text-orange-700', key: 'alto' };
    return { label: 'Crítico', color: 'bg-red-100 text-red-700', key: 'critico' };
  };

  const abrirModalNuevo = () => {
    setRiesgoSeleccionado(null);
    setNuevoRiesgo({ codigo: '', nombre: '', descripcion: '', categoria: 'operativo', probabilidad: 3, impacto: 3, proceso_id: '' });
    setMostrarForm(true);
  };

  const abrirModalEditar = (r) => {
    setRiesgoSeleccionado(r);
    setNuevoRiesgo({
      codigo: r.codigo, nombre: r.nombre, descripcion: r.descripcion || '',
      categoria: r.categoria, probabilidad: r.probabilidad, impacto: r.impacto, proceso_id: r.proceso_id || ''
    });
    setMostrarForm(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (riesgoSeleccionado) {
        await axios.put(`/api/v1/riesgos/${riesgoSeleccionado.id}`, nuevoRiesgo);
        swalSuccess('Riesgo actualizado correctamente');
      } else {
        await axios.post('/api/v1/riesgos', nuevoRiesgo);
        swalSuccess('Riesgo registrado correctamente');
      }
      setMostrarForm(false);
      cargarDatos();
    } catch (err) { swalError(err); }
  };

  const handleEliminar = async (id) => {
    const confirmado = await swalConfirm('¿Eliminar este riesgo?', 'Esta acción no se puede deshacer');
    if (confirmado) {
      try {
        await axios.delete(`/api/v1/riesgos/${id}`);
        swalSuccess('Riesgo eliminado');
        cargarDatos();
      } catch (err) { swalError(err); }
    }
  };

  // ──────────────────────────────────────────────
  // Lógica Planes de Mitigación
  // ──────────────────────────────────────────────
  const abrirGestionPlanes = async (riesgo) => {
    setRiesgoPlan(riesgo);
    setMostrarFormPlan(false);
    setEditandoPlan(null);
    try {
      const [planesRes, usrRes] = await Promise.all([
        axios.get(`/api/v1/riesgos/${riesgo.id}/planes-mitigacion`),
        axios.get('/api/v1/usuarios'),
      ]);
      setPlanes(planesRes.data);
      setUsuarios(usrRes.data);
    } catch { setPlanes([]); setUsuarios([]); }
    setMostrarModalPlanes(true);
  };

  const abrirNuevoPlan = () => {
    setEditandoPlan(null);
    setFormPlan({ descripcion: '', responsable_id: '', fecha_inicio: '', fecha_fin: '', estado: 'planificado' });
    setMostrarFormPlan(true);
  };

  const abrirEditarPlan = (p) => {
    setEditandoPlan(p);
    setFormPlan({
      descripcion: p.descripcion,
      responsable_id: p.responsable_id || '',
      fecha_inicio: p.fecha_inicio ? p.fecha_inicio.split('T')[0] : '',
      fecha_fin: p.fecha_fin ? p.fecha_fin.split('T')[0] : '',
      estado: p.estado || 'planificado'
    });
    setMostrarFormPlan(true);
  };

  const guardarPlan = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formPlan, riesgo_id: riesgoPlan.id };
      if (editandoPlan) {
        await axios.put(`/api/v1/planes-mitigacion/${editandoPlan.id}`, payload);
        swalSuccess('Plan de mitigación actualizado');
      } else {
        await axios.post('/api/v1/planes-mitigacion', payload);
        swalSuccess('Plan de mitigación registrado');
      }
      setMostrarFormPlan(false);
      setEditandoPlan(null);
      const { data } = await axios.get(`/api/v1/riesgos/${riesgoPlan.id}/planes-mitigacion`);
      setPlanes(data);
    } catch (err) { swalError(err); }
  };

  const eliminarPlan = async (id) => {
    const confirmado = await swalConfirm('¿Eliminar este plan de mitigación?', 'Esta acción no se puede deshacer');
    if (!confirmado) return;
    try {
      await axios.delete(`/api/v1/planes-mitigacion/${id}`);
      swalSuccess('Plan eliminado');
      const { data } = await axios.get(`/api/v1/riesgos/${riesgoPlan.id}/planes-mitigacion`);
      setPlanes(data);
    } catch (err) { swalError(err); }
  };

  const descargarReporte = async () => {
    try {
      const response = await axios.get('/api/v1/riesgos/reporte', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'riesgos.pdf');
      link.click();
    } catch (err) { swalError(err); }
  };

  const buildHeatMap = () => {
    const map = {};
    riesgos.forEach(r => {
      const procId = r.proceso_id || 'sin_proceso';
      const procNombre = r.proceso ? r.proceso.nombre : 'Sin proceso';
      if (!map[procId]) map[procId] = { nombre: procNombre, categorias: {}, total: 0, suma: 0 };
      const cat = r.categoria || 'sin_categoria';
      if (!map[procId].categorias[cat]) map[procId].categorias[cat] = { count: 0, sumaNivel: 0 };
      map[procId].categorias[cat].count += 1;
      map[procId].categorias[cat].sumaNivel += (r.probabilidad || 1) * (r.impacto || 1);
      map[procId].total += 1;
      map[procId].suma += (r.probabilidad || 1) * (r.impacto || 1);
    });
    return map;
  };

  const getCellColor = (promedio) => {
    if (promedio === null || promedio === undefined) return 'bg-slate-100';
    if (promedio <= 4) return 'bg-emerald-200 text-emerald-900';
    if (promedio <= 9) return 'bg-amber-200 text-amber-900';
    if (promedio <= 14) return 'bg-orange-200 text-orange-900';
    return 'bg-red-300 text-red-900';
  };

  const getCellIntensity = (promedio) => {
    if (promedio === null || promedio === undefined) return '';
    if (promedio <= 4) return 'bg-emerald-500';
    if (promedio <= 9) return 'bg-amber-500';
    if (promedio <= 14) return 'bg-orange-500';
    return 'bg-red-600';
  };

  const renderHeatMap = () => {
    const heatData = buildHeatMap();
    const procKeys = Object.keys(heatData).sort();

    if (procKeys.length === 0) {
      return <p className="text-center text-slate-500 py-16">No hay datos suficientes para generar el mapa de calor.</p>;
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Thermometer size={18} className="text-slate-500" />
          <span className="text-sm text-slate-500">
            Intensidad del color según nivel de riesgo promedio (Probabilidad × Impacto)
          </span>
          <div className="flex items-center gap-2 ml-auto text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200 inline-block"></span> Bajo</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200 inline-block"></span> Medio</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-200 inline-block"></span> Alto</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-300 inline-block"></span> Crítico</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-100 border inline-block"></span> Sin datos</span>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase bg-slate-50 sticky left-0">Proceso / Área</th>
              {CATEGORIAS.map(cat => (
                <th key={cat} className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase bg-slate-50 capitalize">{cat}</th>
              ))}
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase bg-slate-50">General</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {procKeys.map(pid => {
              const area = heatData[pid];
              return (
                <tr key={pid} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 sticky left-0 bg-white whitespace-nowrap">{area.nombre}</td>
                  {CATEGORIAS.map(cat => {
                    const cell = area.categorias[cat];
                    const promedio = cell ? (cell.sumaNivel / cell.count) : null;
                    return (
                      <td key={cat} className={`px-3 py-3 text-center text-xs font-medium ${getCellColor(promedio)}`}>
                        {cell ? (
                          <div className="flex flex-col items-center">
                            <span>{promedio.toFixed(1)}</span>
                            <span className="text-xs text-slate-500 mt-0.5">({cell.count})</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className={`px-3 py-3 text-center text-xs font-bold ${getCellColor(area.total > 0 ? area.suma / area.total : null)}`}>
                    {area.total > 0 ? (area.suma / area.total).toFixed(1) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity /> Gestión de Riesgos
          </h2>
          <div className="flex gap-3">
            <button onClick={descargarReporte} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
              <Download size={18} /> Reporte PDF
            </button>
            {esGestion && (
              <button onClick={abrirModalNuevo} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                <Plus size={18} /> Nuevo Riesgo
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setVista('lista')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'lista' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <List size={16} /> Lista
          </button>
          <button onClick={() => setVista('calor')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'calor' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <Grid3X3 size={16} /> Mapa de Calor
          </button>
        </div>

        {vista === 'calor' && renderHeatMap()}

        {vista === 'lista' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riesgos.length === 0 ? (
              <p className="col-span-3 text-center text-slate-500 py-10">No hay riesgos registrados en el sistema.</p>
            ) : (
              riesgos.map(r => {
                const nivel = calcularNivel(r.probabilidad, r.impacto);
                return (
                  <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-slate-500 font-mono font-medium">{r.codigo}</p>
                        <h3 className="font-semibold text-slate-900 mt-1 text-lg leading-snug">{r.nombre}</h3>
                      </div>
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${nivel.color}`}>{nivel.label}</span>
                    </div>
                    {r.descripcion && <p className="text-sm text-slate-600 mb-4 flex-1">{r.descripcion}</p>}

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-medium">Proceso:</span>
                        <span className="text-slate-800">{r.proceso ? r.proceso.nombre : 'General'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Categoría:</span>
                        <span className="text-slate-800 capitalize">{r.categoria}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Probabilidad</span>
                            <span className="font-semibold text-slate-700">{r.probabilidad}/5</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${(r.probabilidad / 5) * 100}%` }}></div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Impacto</span>
                            <span className="font-semibold text-slate-700">{r.impacto}/5</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${(r.impacto / 5) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {esGestion && (
                        <button onClick={() => abrirGestionPlanes(r)} className="flex-1 py-2 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 flex justify-center items-center gap-2 text-sm font-medium transition-colors">
                          <Shield size={16} /> Mitigación
                        </button>
                      )}
                      {esGestion && (
                        <button onClick={() => abrirModalEditar(r)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex justify-center items-center gap-2 text-sm font-medium transition-colors">
                          <Edit size={16} /> Editar
                        </button>
                      )}
                      {esGestion && (
                        <button onClick={() => handleEliminar(r.id)} className="py-2 px-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {mostrarForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                {riesgoSeleccionado ? 'Editar Riesgo' : 'Nuevo Riesgo'}
              </h3>
              <button onClick={() => setMostrarForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleGuardar} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                  <input required type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ej. R-2024-01" value={nuevoRiesgo.codigo} onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, codigo: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all capitalize"
                    value={nuevoRiesgo.categoria} onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, categoria: e.target.value })}>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Riesgo</label>
                <input required type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Título corto del riesgo" value={nuevoRiesgo.nombre} onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, nombre: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea rows="2" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Detalla las posibles causas y consecuencias" value={nuevoRiesgo.descripcion} onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, descripcion: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Proceso Afectado (Opcional)</label>
                <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={nuevoRiesgo.proceso_id} onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, proceso_id: e.target.value })}>
                  <option value="">Seleccione un proceso...</option>
                  {procesos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">Probabilidad</label>
                    <span className="text-lg font-bold text-blue-600">{nuevoRiesgo.probabilidad}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" className="w-full accent-blue-600"
                    value={nuevoRiesgo.probabilidad} onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, probabilidad: parseInt(e.target.value) })} />
                  <div className="flex justify-between text-xs text-slate-400 mt-1"><span>Muy Baja (1)</span><span>Muy Alta (5)</span></div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">Impacto</label>
                    <span className="text-lg font-bold text-red-600">{nuevoRiesgo.impacto}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" className="w-full accent-red-500"
                    value={nuevoRiesgo.impacto} onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, impacto: parseInt(e.target.value) })} />
                  <div className="flex justify-between text-xs text-slate-400 mt-1"><span>Leve (1)</span><span>Desastroso (5)</span></div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setMostrarForm(false)} className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium transition-colors">
                  {riesgoSeleccionado ? 'Guardar Cambios' : 'Registrar Riesgo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PLANES DE MITIGACIÓN */}
      {mostrarModalPlanes && riesgoPlan && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">Planes de Mitigación</h3>
                <p className="text-sm text-slate-500">{riesgoPlan.codigo} — {riesgoPlan.nombre}</p>
              </div>
              <button onClick={() => setMostrarModalPlanes(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-end mb-4">
                {esGestion && (
                  <button onClick={abrirNuevoPlan} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <Plus size={16} /> Nuevo Plan
                  </button>
                )}
              </div>
              {planes.length === 0 ? (
                <p className="text-center text-slate-400 py-10">No hay planes de mitigación para este riesgo.</p>
              ) : (
                <div className="space-y-3">
                  {planes.map(p => (
                    <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{p.descripcion}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            {p.responsable && <span>Responsable: <strong>{p.responsable.nombres} {p.responsable.apellidos}</strong></span>}
                            {p.fecha_inicio && <span>Inicio: {new Date(p.fecha_inicio).toLocaleDateString('es-PE')}</span>}
                            {p.fecha_fin && <span>Fin: {new Date(p.fecha_fin).toLocaleDateString('es-PE')}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                            p.estado === 'completado' ? 'bg-emerald-100 text-emerald-700' :
                            p.estado === 'en_ejecucion' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {p.estado === 'en_ejecucion' ? 'En Ejecución' : p.estado}
                          </span>
                          {esGestion && <button onClick={() => abrirEditarPlan(p)} className="text-blue-600 hover:text-blue-800"><Edit size={14} /></button>}
                          {esGestion && <button onClick={() => eliminarPlan(p.id)} className="text-red-600 hover:text-red-800"><Trash2 size={14} /></button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <button onClick={() => setMostrarModalPlanes(false)} className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-medium transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM PLAN */}
      {mostrarFormPlan && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">{editandoPlan ? 'Editar Plan' : 'Nuevo Plan de Mitigación'}</h3>
              <button onClick={() => { setMostrarFormPlan(false); setEditandoPlan(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={guardarPlan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Acción</label>
                <textarea required rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Describa la acción de mitigación" value={formPlan.descripcion} onChange={e => setFormPlan({...formPlan, descripcion: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formPlan.responsable_id} onChange={e => setFormPlan({...formPlan, responsable_id: e.target.value})}>
                  <option value="">Seleccionar responsable</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombres} {u.apellidos} — {u.correo}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formPlan.fecha_inicio} onChange={e => setFormPlan({...formPlan, fecha_inicio: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin</label>
                  <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formPlan.fecha_fin} onChange={e => setFormPlan({...formPlan, fecha_fin: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formPlan.estado} onChange={e => setFormPlan({...formPlan, estado: e.target.value})}>
                  <option value="planificado">Planificado</option>
                  <option value="en_ejecucion">En Ejecución</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => { setMostrarFormPlan(false); setEditandoPlan(null); }} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium transition-colors">
                  {editandoPlan ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
