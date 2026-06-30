'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, Edit, X, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

export default function PeriodosPage() {
  const { usuario } = useAuth();
  const esGestion = ['admin', 'gestor_calidad'].includes(usuario?.rol);
  const [periodos, setPeriodos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ codigo: '', nombre: '', fecha_inicio: '', fecha_fin: '' });

  useEffect(() => {
    if (usuario) cargarPeriodos();
  }, [usuario]);

  const cargarPeriodos = async () => {
    try {
      const { data } = await axios.get('/api/v1/periodos-academicos');
      setPeriodos(data);
    } catch { setPeriodos([]); }
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm({ codigo: '', nombre: '', fecha_inicio: '', fecha_fin: '' });
    setMostrarForm(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setForm({ codigo: p.codigo, nombre: p.nombre, fecha_inicio: p.fecha_inicio, fecha_fin: p.fecha_fin });
    setMostrarForm(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await axios.put(`/api/v1/periodos-academicos/${editando.id}`, form);
        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Periodo actualizado', timer: 1500, showConfirmButton: false });
      } else {
        await axios.post('/api/v1/periodos-academicos', form);
        Swal.fire({ icon: 'success', title: 'Creado', text: 'Periodo creado correctamente', timer: 1500, showConfirmButton: false });
      }
      setMostrarForm(false);
      setEditando(null);
      cargarPeriodos();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Error al guardar', confirmButtonColor: '#1e40af' });
    }
  };

  const desactivarPeriodo = async (id) => {
    const confirm = await Swal.fire({
      icon: 'question', title: '¿Desactivar periodo?',
      text: 'El periodo quedará inactivo y no aparecerá en los selectores.',
      showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desactivar', cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.patch(`/api/v1/periodos-academicos/${id}/desactivar`);
      Swal.fire({ icon: 'success', title: 'Desactivado', text: 'Periodo desactivado', timer: 1500, showConfirmButton: false });
      cargarPeriodos();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Error al desactivar', confirmButtonColor: '#1e40af' });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar /> Periodos Académicos
          </h2>
          {esGestion && (
            <button onClick={abrirNuevo} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              <Plus size={18} /> Nuevo Periodo
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Código</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Fecha Inicio</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Fecha Fin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                {esGestion && <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periodos.length === 0 ? (
                <tr><td colSpan={esGestion ? 6 : 5} className="px-6 py-12 text-center text-slate-400">No hay periodos registrados.</td></tr>
              ) : (
                periodos.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">{p.codigo}</td>
                    <td className="px-6 py-4 text-slate-700">{p.nombre}</td>
                    <td className="px-6 py-4 text-slate-600">{p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-PE') : '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString('es-PE') : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium ${p.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.activo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {esGestion && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => abrirEditar(p)} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                            <Edit size={14} /> Editar
                          </button>
                          {p.activo && (
                            <button onClick={() => desactivarPeriodo(p.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                              Desactivar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {mostrarForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg">
                {editando ? 'Editar Periodo' : 'Nuevo Periodo'}
              </h3>
              <button onClick={() => { setMostrarForm(false); setEditando(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={guardar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej. 2026-I" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej. Primer Semestre 2026" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
                  <input required type="date" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={form.fecha_inicio} onChange={e => setForm({...form, fecha_inicio: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Fin</label>
                  <input required type="date" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={form.fecha_fin} onChange={e => setForm({...form, fecha_fin: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => { setMostrarForm(false); setEditando(null); }} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 font-medium transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium transition-colors">
                  {editando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
