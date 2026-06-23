'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Plus, Download, AlertTriangle, Edit, Trash2, X } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';

export default function RiesgosPage() {
  const [riesgos, setRiesgos] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [riesgoSeleccionado, setRiesgoSeleccionado] = useState(null);
  const [nuevoRiesgo, setNuevoRiesgo] = useState({ 
    codigo: '', nombre: '', descripcion: '', categoria: 'operativo', probabilidad: 3, impacto: 3, proceso_id: '' 
  });

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
    if (val <= 4) return { label: 'Bajo', color: 'bg-emerald-100 text-emerald-700' };
    if (val <= 9) return { label: 'Medio', color: 'bg-amber-100 text-amber-700' };
    if (val <= 14) return { label: 'Alto', color: 'bg-orange-100 text-orange-700' };
    return { label: 'Crítico', color: 'bg-red-100 text-red-700' };
  };

  const abrirModalNuevo = () => {
    setRiesgoSeleccionado(null);
    setNuevoRiesgo({ codigo: '', nombre: '', descripcion: '', categoria: 'operativo', probabilidad: 3, impacto: 3, proceso_id: '' });
    setMostrarForm(true);
  };

  const abrirModalEditar = (r) => {
    setRiesgoSeleccionado(r);
    setNuevoRiesgo({
      codigo: r.codigo,
      nombre: r.nombre,
      descripcion: r.descripcion || '',
      categoria: r.categoria,
      probabilidad: r.probabilidad,
      impacto: r.impacto,
      proceso_id: r.proceso_id || ''
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
    } catch (err) {
      swalError(err);
    }
  };

  const handleEliminar = async (id) => {
    const confirmado = await swalConfirm('¿Estás seguro de eliminar este riesgo?', 'Esta acción no se puede deshacer');
    if (confirmado) {
      try {
        await axios.delete(`/api/v1/riesgos/${id}`);
        swalSuccess('Riesgo eliminado');
        cargarDatos();
      } catch (err) {
        swalError(err);
      }
    }
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
            <button onClick={abrirModalNuevo} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              <Plus size={18} /> Nuevo Riesgo
            </button>
          </div>
        </div>

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
                    <button onClick={() => abrirModalEditar(r)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex justify-center items-center gap-2 text-sm font-medium transition-colors">
                      <Edit size={16} /> Editar
                    </button>
                    <button onClick={() => handleEliminar(r.id)} className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex justify-center items-center gap-2 text-sm font-medium transition-colors">
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODAL CREAR / EDITAR RIESGO */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                {riesgoSeleccionado ? 'Editar Riesgo' : 'Nuevo Riesgo'}
              </h3>
              <button onClick={() => setMostrarForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleGuardar} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                  <input required type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ej. R-2024-01" value={nuevoRiesgo.codigo} onChange={e => setNuevoRiesgo({...nuevoRiesgo, codigo: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all capitalize"
                    value={nuevoRiesgo.categoria} onChange={e => setNuevoRiesgo({...nuevoRiesgo, categoria: e.target.value})}>
                    {['estrategico', 'operativo', 'academico', 'financiero', 'legal', 'tecnologico', 'reputacional'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Riesgo</label>
                <input required type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Título corto del riesgo" value={nuevoRiesgo.nombre} onChange={e => setNuevoRiesgo({...nuevoRiesgo, nombre: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea rows="2" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Detalla las posibles causas y consecuencias" value={nuevoRiesgo.descripcion} onChange={e => setNuevoRiesgo({...nuevoRiesgo, descripcion: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Proceso Afectado (Opcional)</label>
                <select className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={nuevoRiesgo.proceso_id} onChange={e => setNuevoRiesgo({...nuevoRiesgo, proceso_id: e.target.value})}>
                  <option value="">Seleccione un proceso...</option>
                  {procesos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">Probabilidad</label>
                    <span className="text-lg font-bold text-blue-600">{nuevoRiesgo.probabilidad}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" className="w-full accent-blue-600"
                    value={nuevoRiesgo.probabilidad} onChange={e => setNuevoRiesgo({...nuevoRiesgo, probabilidad: parseInt(e.target.value)})} />
                  <div className="flex justify-between text-xs text-slate-400 mt-1"><span>Muy Baja (1)</span><span>Muy Alta (5)</span></div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-700">Impacto</label>
                    <span className="text-lg font-bold text-red-600">{nuevoRiesgo.impacto}</span>
                  </div>
                  <input type="range" min="1" max="5" step="1" className="w-full accent-red-500"
                    value={nuevoRiesgo.impacto} onChange={e => setNuevoRiesgo({...nuevoRiesgo, impacto: parseInt(e.target.value)})} />
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
    </div>
  );
}
