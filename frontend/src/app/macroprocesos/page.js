'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { GitBranch, Plus, Search, Edit, Eye, EyeOff } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';

export default function MacroprocesosPage() {
  const [macroprocesos, setMacroprocesos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [nuevoMP, setNuevoMP] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo: '',
    responsable_id: ''
  });
  const [mpSeleccionado, setMpSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    cargarMacroprocesos();
    cargarUsuarios();
  }, []);

  const cargarMacroprocesos = async () => {
    try {
      const { data } = await axios.get('/api/v1/macroprocesos');
      setMacroprocesos(data);
    } catch (err) {
      // Datos de demostración
      setMacroprocesos([
        { id: '1', codigo: 'MP-001', nombre: 'Gestión Académica', tipo: 'misional', estado: 'activo', descripcion: 'Gestión de procesos académicos de la universidad', creado_en: '2024-01-15' },
        { id: '2', codigo: 'MP-002', nombre: 'Gestión Administrativa', tipo: 'apoyo', estado: 'activo', descripcion: 'Gestión de procesos administrativos', creado_en: '2024-02-20' },
      ]);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const { data } = await axios.get('/api/v1/auth/usuarios');
      setUsuarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion && mpSeleccionado) {
        await axios.put(`/api/v1/macroprocesos/${mpSeleccionado.id}`, nuevoMP);
        swalSuccess('Macroproceso actualizado correctamente');
      } else {
        await axios.post('/api/v1/macroprocesos', nuevoMP);
        swalSuccess('Macroproceso registrado correctamente');
      }
      setMostrarModal(false);
      resetFormulario();
      cargarMacroprocesos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleEditar = (mp) => {
    setMpSeleccionado(mp);
    setNuevoMP({
      codigo: mp.codigo,
      nombre: mp.nombre,
      descripcion: mp.descripcion || '',
      tipo: mp.tipo || '',
      responsable_id: mp.responsable_id?.toString() || ''
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleVer = (mp) => {
    setMpSeleccionado(mp);
    setMostrarModalVer(true);
  };

  const handleDesactivar = async (mp) => {
    const confirmado = await swalConfirm('¿Estás seguro de desactivar este macroproceso?');
    if (confirmado) {
      try {
        await axios.patch(`/api/v1/macroprocesos/${mp.id}/desactivar`);
        swalSuccess('Macroproceso desactivado correctamente');
        cargarMacroprocesos();
      } catch (err) {
        swalError(err);
      }
    }
  };

  const resetFormulario = () => {
    setNuevoMP({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: '',
      responsable_id: ''
    });
    setMpSeleccionado(null);
    setModoEdicion(false);
  };

  const abrirModalNuevo = () => {
    resetFormulario();
    setMostrarModal(true);
  };

  const filtrados = macroprocesos.filter(mp =>
    mp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    mp.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Macroprocesos</h2>
          <button 
            onClick={abrirModalNuevo}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} /> Nuevo Macroproceso
          </button>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtrados.map((mp) => (
                  <tr key={mp.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{mp.codigo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{mp.nombre}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">{mp.tipo}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{mp.responsable?.nombres} {mp.responsable?.apellidos || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        mp.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {mp.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleVer(mp)} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        {mp.estado === 'activo' && (
                          <button 
                            onClick={() => handleEditar(mp)} 
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {mp.estado === 'activo' && (
                          <button 
                            onClick={() => handleDesactivar(mp)} 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Desactivar"
                          >
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
                  {modoEdicion ? 'Editar Macroproceso' : 'Registrar Macroproceso'}
                </h3>
                <button 
                  onClick={() => setMostrarModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleGuardar} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                    <input
                      type="text"
                      placeholder="Ej. MP-001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      value={nuevoMP.codigo}
                      onChange={(e) => setNuevoMP({ ...nuevoMP, codigo: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                      value={nuevoMP.tipo}
                      onChange={(e) => setNuevoMP({ ...nuevoMP, tipo: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="estrategico">Estratégico</option>
                      <option value="misional">Misional</option>
                      <option value="apoyo">Apoyo</option>
                      <option value="evaluacion">Evaluación</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del macroproceso"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    value={nuevoMP.nombre}
                    onChange={(e) => setNuevoMP({ ...nuevoMP, nombre: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                    value={nuevoMP.responsable_id}
                    onChange={(e) => setNuevoMP({ ...nuevoMP, responsable_id: e.target.value })}
                  >
                    <option value="">Sin responsable</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea
                    placeholder="Descripción del macroproceso..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    value={nuevoMP.descripcion}
                    onChange={(e) => setNuevoMP({ ...nuevoMP, descripcion: e.target.value })}
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
        {mostrarModalVer && mpSeleccionado && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <GitBranch className="text-blue-600" size={20} /> 
                  Detalles del Macroproceso
                </h3>
                <button 
                  onClick={() => setMostrarModalVer(false)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Código</span>
                    <p className="text-slate-800 font-semibold">{mpSeleccionado.codigo}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Tipo</span>
                    <p className="text-slate-800 capitalize">{mpSeleccionado.tipo}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-slate-500 font-medium">Nombre</span>
                  <p className="text-slate-800">{mpSeleccionado.nombre}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Responsable</span>
                    <p className="text-slate-800">{mpSeleccionado.responsable?.nombres} {mpSeleccionado.responsable?.apellidos || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Estado</span>
                    <p className="text-slate-800">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        mpSeleccionado.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {mpSeleccionado.estado}
                      </span>
                    </p>
                  </div>
                </div>
                {mpSeleccionado.descripcion && (
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Descripción</span>
                    <div className="mt-1 p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap">
                      {mpSeleccionado.descripcion}
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
