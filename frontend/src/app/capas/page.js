'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle, Clock, AlertTriangle, Plus, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';

const ESTADOS_CAPA = ['registrada', 'en_implementacion', 'implementada', 'verificada', 'cerrada'];
const EFECTIVIDADES = ['efectiva', 'parcial', 'no_efectiva'];

export default function CapasPage() {
  const [capas, setCapas] = useState([]);
  const [hallazgos, setHallazgos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [capaSeleccionada, setCapaSeleccionada] = useState(null);
  const [nuevaCapa, setNuevaCapa] = useState({
    codigo: '',
    tipo: 'correctiva',
    hallazgo_id: '',
    descripcion: '',
    causa_raiz: '',
    accion_propuesta: '',
    responsable_id: '',
    fecha_implementacion: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [capasRes, hallazgosRes, usuariosRes] = await Promise.all([
        axios.get('/api/v1/capas'),
        axios.get('/api/v1/hallazgos'),
        axios.get('/api/v1/usuarios'),
      ]);
      setCapas(capasRes.data);
      setHallazgos(hallazgosRes.data);
      setUsuarios(usuariosRes.data);
    } catch (err) {
      swalError(err);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/capas', nuevaCapa);
      swalSuccess('CAPA registrada correctamente');
      setModalNuevo(false);
      resetForm();
      cargarDatos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/v1/capas/${capaSeleccionada.id}`, nuevaCapa);
      swalSuccess('CAPA actualizada correctamente');
      setModalEditar(false);
      resetForm();
      cargarDatos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleActualizarEstado = async (capa, nuevoEstado) => {
    try {
      await axios.patch(`/api/v1/capas/${capa.id}/estado`, { estado: nuevoEstado });
      swalSuccess('Estado actualizado correctamente');
      cargarDatos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleEliminar = async (capa) => {
    const result = await swalConfirm('¿Está seguro de eliminar esta CAPA?');
    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/v1/capas/${capa.id}`);
        swalSuccess('CAPA eliminada correctamente');
        cargarDatos();
      } catch (err) {
        swalError(err);
      }
    }
  };

  const handleCalificarEfectividad = async (capa, efectividad) => {
    const result = await swalConfirm(`¿Está seguro de calificar la efectividad como ${efectividad}?`);
    if (result.isConfirmed) {
      try {
        await axios.patch(`/api/v1/capas/${capa.id}/estado`, { estado: 'cerrada', efectividad });
        swalSuccess('CAPA cerrada correctamente');
        cargarDatos();
      } catch (err) {
        swalError(err);
      }
    }
  };

  const abrirModalVer = (capa) => {
    setCapaSeleccionada(capa);
    setModalVer(true);
  };

  const abrirModalEditar = (capa) => {
    setCapaSeleccionada(capa);
    setNuevaCapa({
      codigo: capa.codigo,
      tipo: capa.tipo,
      hallazgo_id: capa.hallazgo_id || '',
      descripcion: capa.descripcion,
      causa_raiz: capa.causa_raiz || '',
      accion_propuesta: capa.accion_propuesta,
      responsable_id: capa.responsable_id || '',
      fecha_implementacion: capa.fecha_implementacion || '',
    });
    setModalEditar(true);
  };

  const resetForm = () => {
    setNuevaCapa({
      codigo: '',
      tipo: 'correctiva',
      hallazgo_id: '',
      descripcion: '',
      causa_raiz: '',
      accion_propuesta: '',
      responsable_id: '',
      fecha_implementacion: '',
    });
    setCapaSeleccionada(null);
  };

  const descargarReporte = async () => {
    try {
      const response = await axios.get('/api/v1/capas/reporte', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte-capas.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      swalError(err);
    }
  };

  const getNombreResponsable = (id) => {
    const u = usuarios.find(u => u.id === id);
    return u ? `${u.nombres} ${u.apellidos}` : 'Sin asignar';
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'cerrada':
        return 'bg-green-100 text-green-700';
      case 'verificada':
        return 'bg-blue-100 text-blue-700';
      case 'implementada':
        return 'bg-cyan-100 text-cyan-700';
      case 'en_implementacion':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getEfectividadBadgeClass = (efectividad) => {
    switch (efectividad) {
      case 'efectiva':
        return 'bg-green-100 text-green-700';
      case 'parcial':
        return 'bg-amber-100 text-amber-700';
      case 'no_efectiva':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getSiguienteEstado = (estadoActual) => {
    const idx = ESTADOS_CAPA.indexOf(estadoActual);
    return idx < ESTADOS_CAPA.length - 1 ? ESTADOS_CAPA[idx + 1] : null;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert /> Acciones Correctivas y Preventivas (CAPA)
          </h2>
          <div className="flex gap-3">
            <button onClick={descargarReporte} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
              <Download size={18} /> Reporte PDF
            </button>
            <button onClick={() => setModalNuevo(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus size={18} /> Nueva CAPA
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Efectividad</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {capas.map((capa) => (
                  <tr key={capa.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{capa.codigo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">{capa.tipo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{capa.descripcion}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {capa.responsable ? `${capa.responsable.nombres} ${capa.responsable.apellidos}` : 'Sin asignar'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadgeClass(capa.estado)}`}>
                          {capa.estado}
                        </span>
                        {capa.estado !== 'cerrada' && (
                          <select
                            className="px-2 py-1 text-xs border border-slate-300 rounded"
                            value={capa.estado}
                            onChange={(e) => handleActualizarEstado(capa, e.target.value)}
                          >
                            {ESTADOS_CAPA.map(est => (
                              <option key={est} value={est}>{est}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {capa.efectividad ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${getEfectividadBadgeClass(capa.efectividad)}`}>
                          {capa.efectividad}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Pendiente</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => abrirModalVer(capa)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver detalles">
                          <Eye size={16} />
                        </button>
                        {capa.estado !== 'cerrada' && (
                          <button onClick={() => abrirModalEditar(capa)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Editar">
                            <Edit size={16} />
                          </button>
                        )}
                        {capa.estado === 'verificada' && (
                          <div className="flex gap-1">
                            {EFECTIVIDADES.map(ef => (
                              <button
                                key={ef}
                                onClick={() => handleCalificarEfectividad(capa, ef)}
                                className={`px-2 py-1 text-xs rounded ${
                                  ef === 'efectiva' ? 'bg-green-600 text-white' :
                                  ef === 'parcial' ? 'bg-amber-600 text-white' :
                                  'bg-red-600 text-white'
                                } hover:opacity-80`}
                              >
                                {ef}
                              </button>
                            ))}
                          </div>
                        )}
                        <button onClick={() => handleEliminar(capa)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Nueva CAPA */}
        {modalNuevo && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg">Nueva CAPA</h3>
                <button onClick={() => setModalNuevo(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold">
                  &times;
                </button>
              </div>
              <form onSubmit={handleCrear} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={nuevaCapa.codigo} onChange={(e) => setNuevaCapa({ ...nuevaCapa, codigo: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={nuevaCapa.tipo} onChange={(e) => setNuevaCapa({ ...nuevaCapa, tipo: e.target.value })}>
                      <option value="correctiva">Correctiva</option>
                      <option value="preventiva">Preventiva</option>
                      <option value="mejora">Mejora</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hallazgo Origen (opcional)</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={nuevaCapa.hallazgo_id} onChange={(e) => setNuevaCapa({ ...nuevaCapa, hallazgo_id: e.target.value })}>
                    <option value="">Sin hallazgo</option>
                    {hallazgos.filter(h => h.estado === 'abierto').map(h => (
                      <option key={h.id} value={h.id}>{h.descripcion.substring(0, 50)}...</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2} value={nuevaCapa.descripcion} onChange={(e) => setNuevaCapa({ ...nuevaCapa, descripcion: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Causa Raíz</label>
                  <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2} value={nuevaCapa.causa_raiz} onChange={(e) => setNuevaCapa({ ...nuevaCapa, causa_raiz: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Acción Propuesta</label>
                  <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2} value={nuevaCapa.accion_propuesta} onChange={(e) => setNuevaCapa({ ...nuevaCapa, accion_propuesta: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={nuevaCapa.responsable_id} onChange={(e) => setNuevaCapa({ ...nuevaCapa, responsable_id: e.target.value })}>
                      <option value="">Seleccionar responsable</option>
                      {usuarios.map(u => (
                        <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>
                      ))}
                    </select>
                    {!nuevaCapa.responsable_id && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} /> Esta CAPA no tiene responsable asignado
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Implementación</label>
                    <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={nuevaCapa.fecha_implementacion} onChange={(e) => setNuevaCapa({ ...nuevaCapa, fecha_implementacion: e.target.value })} />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalNuevo(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Registrar CAPA
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Ver CAPA */}
        {modalVer && capaSeleccionada && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg">Detalles de la CAPA</h3>
                <button onClick={() => setModalVer(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold">
                  &times;
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-sm text-slate-500 font-medium">Código</span><p className="text-slate-800 font-semibold">{capaSeleccionada.codigo}</p></div>
                  <div><span className="text-sm text-slate-500 font-medium">Tipo</span><p className="text-slate-800 capitalize">{capaSeleccionada.tipo}</p></div>
                  <div><span className="text-sm text-slate-500 font-medium">Estado</span>
                    <p className="mt-1"><span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadgeClass(capaSeleccionada.estado)}`}>{capaSeleccionada.estado}</span></p>
                  </div>
                  {capaSeleccionada.efectividad && <div><span className="text-sm text-slate-500 font-medium">Efectividad</span>
                    <p className="mt-1"><span className={`px-2 py-1 text-xs rounded-full ${getEfectividadBadgeClass(capaSeleccionada.efectividad)}`}>{capaSeleccionada.efectividad}</span></p>
                  </div>}
                </div>
                <div><span className="text-sm text-slate-500 font-medium">Descripción</span><p className="text-slate-800 mt-1">{capaSeleccionada.descripcion}</p></div>
                {capaSeleccionada.causa_raiz && <div><span className="text-sm text-slate-500 font-medium">Causa Raíz</span><p className="text-slate-800 mt-1">{capaSeleccionada.causa_raiz}</p></div>}
                {capaSeleccionada.accion_propuesta && <div><span className="text-sm text-slate-500 font-medium">Acción Propuesta</span><p className="text-slate-800 mt-1">{capaSeleccionada.accion_propuesta}</p></div>}
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-sm text-slate-500 font-medium">Responsable</span><p className="text-slate-800 mt-1">
                    {capaSeleccionada.responsable ? `${capaSeleccionada.responsable.nombres} ${capaSeleccionada.responsable.apellidos}` : 'Sin asignar'}
                  </p></div>
                  {capaSeleccionada.fecha_implementacion && <div><span className="text-sm text-slate-500 font-medium">Fecha Implementación</span><p className="text-slate-800 mt-1">{capaSeleccionada.fecha_implementacion}</p></div>}
                </div>
                {capaSeleccionada.hallazgo && <div><span className="text-sm text-slate-500 font-medium">Hallazgo Origen</span><p className="text-slate-800 mt-1">{capaSeleccionada.hallazgo.descripcion}</p></div>}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button onClick={() => setModalVer(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50">
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar CAPA */}
        {modalEditar && capaSeleccionada && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg">Editar CAPA</h3>
                <button onClick={() => setModalEditar(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold">
                  &times;
                </button>
              </div>
              <form onSubmit={handleEditar} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={nuevaCapa.codigo} onChange={(e) => setNuevaCapa({ ...nuevaCapa, codigo: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={nuevaCapa.tipo} onChange={(e) => setNuevaCapa({ ...nuevaCapa, tipo: e.target.value })}>
                      <option value="correctiva">Correctiva</option>
                      <option value="preventiva">Preventiva</option>
                      <option value="mejora">Mejora</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hallazgo Origen (opcional)</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={nuevaCapa.hallazgo_id} onChange={(e) => setNuevaCapa({ ...nuevaCapa, hallazgo_id: e.target.value })}>
                    <option value="">Sin hallazgo</option>
                    {hallazgos.filter(h => h.estado === 'abierto').map(h => (
                      <option key={h.id} value={h.id}>{h.descripcion.substring(0, 50)}...</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2} value={nuevaCapa.descripcion} onChange={(e) => setNuevaCapa({ ...nuevaCapa, descripcion: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Causa Raíz</label>
                  <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2} value={nuevaCapa.causa_raiz} onChange={(e) => setNuevaCapa({ ...nuevaCapa, causa_raiz: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Acción Propuesta</label>
                  <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2} value={nuevaCapa.accion_propuesta} onChange={(e) => setNuevaCapa({ ...nuevaCapa, accion_propuesta: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={nuevaCapa.responsable_id} onChange={(e) => setNuevaCapa({ ...nuevaCapa, responsable_id: e.target.value })}>
                      <option value="">Seleccionar responsable</option>
                      {usuarios.map(u => (
                        <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>
                      ))}
                    </select>
                    {!nuevaCapa.responsable_id && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} /> Esta CAPA no tiene responsable asignado
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Implementación</label>
                    <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={nuevaCapa.fecha_implementacion} onChange={(e) => setNuevaCapa({ ...nuevaCapa, fecha_implementacion: e.target.value })} />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalEditar(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Guardar Cambios
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
