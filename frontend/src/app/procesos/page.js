'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { GitBranch, Plus, Download, Search, Edit, Eye, EyeOff } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';

export default function ProcesosPage() {
  const [macroprocesos, setMacroprocesos] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [nuevoProceso, setNuevoProceso] = useState({ codigo: '', nombre: '', objetivo: '', alcance: '', macroproceso_id: '', responsable_id: '', estado: 'activo' });
  const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [mp, pr, us] = await Promise.all([
        axios.get('/api/v1/macroprocesos'),
        axios.get('/api/v1/procesos'),
        axios.get('/api/v1/usuarios'),
      ]);
      setMacroprocesos(mp.data);
      setProcesos(pr.data);
      setUsuarios(us.data);
    } catch (err) {
      // Demo data
      setMacroprocesos([
        { id: '1', codigo: 'MP-01', nombre: 'Direccionamiento Estratégico', tipo: 'estrategico' },
        { id: '2', codigo: 'MP-02', nombre: 'Formación Profesional', tipo: 'misional' },
      ]);
      setProcesos([
        { id: '1', codigo: 'P-01', nombre: 'Planificación Curricular', objetivo: 'Diseñar planes de estudio', macroproceso_id: '2', estado: 'activo', macroproceso: { nombre: 'Formación Profesional' }, responsable: { nombres: 'Juan', apellidos: 'Pérez' } },
        { id: '2', codigo: 'P-02', nombre: 'Gestión de Docencia', objetivo: 'Ejecutar actividades académicas', macroproceso_id: '2', estado: 'activo', macroproceso: { nombre: 'Formación Profesional' }, responsable: { nombres: 'María', apellidos: 'Gómez' } },
      ]);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion && procesoSeleccionado) {
        await axios.put(`/api/v1/procesos/${procesoSeleccionado.id}`, nuevoProceso);
        swalSuccess('Proceso actualizado correctamente');
      } else {
        await axios.post('/api/v1/procesos', nuevoProceso);
        swalSuccess('Proceso registrado correctamente');
      }
      setMostrarModal(false);
      resetFormulario();
      cargarDatos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleEditar = (p) => {
    setProcesoSeleccionado(p);
    setNuevoProceso({
      codigo: p.codigo,
      nombre: p.nombre,
      objetivo: p.objetivo || '',
      alcance: p.alcance || '',
      macroproceso_id: p.macroproceso_id?.toString() || '',
      responsable_id: p.responsable_id?.toString() || '',
      estado: p.estado || 'activo'
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleVer = (p) => {
    setProcesoSeleccionado(p);
    setMostrarModalVer(true);
  };

  const handleDesactivar = async (p) => {
    const confirmado = await swalConfirm('¿Estás seguro de desactivar este proceso?');
    if (confirmado) {
      try {
        await axios.patch(`/api/v1/procesos/${p.id}/desactivar`);
        swalSuccess('Proceso desactivado correctamente');
        cargarDatos();
      } catch (err) {
        swalError(err);
      }
    }
  };

  const resetFormulario = () => {
    setNuevoProceso({ codigo: '', nombre: '', objetivo: '', alcance: '', macroproceso_id: '', responsable_id: '', estado: 'activo' });
    setProcesoSeleccionado(null);
    setModoEdicion(false);
  };

  const abrirModalNuevo = () => {
    resetFormulario();
    setMostrarModal(true);
  };

  const descargarReporte = async () => {
    try {
      const response = await axios.get('/api/v1/procesos/reporte', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mapa-procesos.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      swalError(err);
    }
  };

  const filtrados = procesos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    p.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><GitBranch /> Mapa de Procesos</h2>
          <div className="flex gap-3">
            <button onClick={descargarReporte} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"><Download size={18} /> Reporte PDF</button>
            <button onClick={abrirModalNuevo} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={18} /> Nuevo Proceso</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Macroproceso</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtrados.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{p.codigo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.nombre}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.macroproceso?.nombre || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.responsable?.nombres} {p.responsable?.apellidos || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        p.estado === 'activo' ? 'bg-green-100 text-green-700' :
                        p.estado === 'inactivo' ? 'bg-slate-200 text-slate-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleVer(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver detalles">
                          <Eye size={16} />
                        </button>
                        {p.estado === 'activo' && (
                          <button onClick={() => handleEditar(p)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Editar">
                            <Edit size={16} />
                          </button>
                        )}
                        {p.estado === 'activo' && (
                          <button onClick={() => handleDesactivar(p)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Desactivar">
                            <EyeOff size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Crear/Editar */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <GitBranch className="text-blue-600" size={20} /> 
                  {modoEdicion ? 'Editar Proceso' : 'Registrar Proceso'}
                </h3>
                <button onClick={() => setMostrarModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none">
                  &times;
                </button>
              </div>
              <form onSubmit={handleGuardar} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                    <input
                      type="text"
                      placeholder="Ej. P-001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      value={nuevoProceso.codigo}
                      onChange={(e) => setNuevoProceso({ ...nuevoProceso, codigo: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Macroproceso</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                      value={nuevoProceso.macroproceso_id}
                      onChange={(e) => setNuevoProceso({ ...nuevoProceso, macroproceso_id: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar Macroproceso</option>
                      {macroprocesos.map((mp) => (
                        <option key={mp.id} value={mp.id}>{mp.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del proceso"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    value={nuevoProceso.nombre}
                    onChange={(e) => setNuevoProceso({ ...nuevoProceso, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                      value={nuevoProceso.responsable_id}
                      onChange={(e) => setNuevoProceso({ ...nuevoProceso, responsable_id: e.target.value })}
                    >
                      <option value="">Sin responsable</option>
                      {usuarios.map((u) => (
                        <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo</label>
                  <textarea
                    placeholder="Objetivo del proceso..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    value={nuevoProceso.objetivo}
                    onChange={(e) => setNuevoProceso({ ...nuevoProceso, objetivo: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alcance</label>
                  <textarea
                    placeholder="Alcance del proceso..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    value={nuevoProceso.alcance}
                    onChange={(e) => setNuevoProceso({ ...nuevoProceso, alcance: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {modoEdicion ? 'Guardar Cambios' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Ver */}
        {mostrarModalVer && procesoSeleccionado && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <GitBranch className="text-blue-600" size={20} /> 
                  Detalles del Proceso
                </h3>
                <button onClick={() => setMostrarModalVer(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none">
                  &times;
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Código</span>
                    <p className="text-slate-800 font-semibold">{procesoSeleccionado.codigo}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Macroproceso</span>
                    <p className="text-slate-800">{procesoSeleccionado.macroproceso?.nombre || '-'}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-slate-500 font-medium">Nombre</span>
                  <p className="text-slate-800">{procesoSeleccionado.nombre}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Responsable</span>
                    <p className="text-slate-800">{procesoSeleccionado.responsable?.nombres} {procesoSeleccionado.responsable?.apellidos || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Estado</span>
                    <p className="text-slate-800">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        procesoSeleccionado.estado === 'activo' ? 'bg-green-100 text-green-700' :
                        procesoSeleccionado.estado === 'inactivo' ? 'bg-slate-200 text-slate-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {procesoSeleccionado.estado}
                      </span>
                    </p>
                  </div>
                </div>
                {procesoSeleccionado.objetivo && (
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Objetivo</span>
                    <div className="mt-1 p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap">
                      {procesoSeleccionado.objetivo}
                    </div>
                  </div>
                )}
                {procesoSeleccionado.alcance && (
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Alcance</span>
                    <div className="mt-1 p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap">
                      {procesoSeleccionado.alcance}
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setMostrarModalVer(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
