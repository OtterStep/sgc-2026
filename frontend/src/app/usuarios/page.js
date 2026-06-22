'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UsuariosPage() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    codigo: '', nombres: '', apellidos: '', correo: '', contrasena: '',
    rol: 'estudiante', facultad: '', escuela: ''
  });

  useEffect(() => { 
    if (usuario?.rol === 'admin') cargarUsuarios(); 
  }, [usuario]);

  const cargarUsuarios = async () => {
    try {
      const { data } = await axios.get('/api/v1/usuarios');
      setUsuarios(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await axios.put(`/api/v1/usuarios/${editando.id}`, nuevoUsuario);
      } else {
        await axios.post('/api/v1/usuarios', nuevoUsuario);
      }
      setMostrarForm(false);
      setEditando(null);
      setNuevoUsuario({ codigo: '', nombres: '', apellidos: '', correo: '', contrasena: '', rol: 'estudiante', facultad: '', escuela: '' });
      cargarUsuarios();
    } catch (err) { 
      alert(err.response?.data?.error || 'Error al guardar'); 
    }
  };

  const editarUsuario = (u) => {
    setEditando(u);
    setNuevoUsuario({ ...u, contrasena: '' }); // no enviamos la contraseña original
    setMostrarForm(true);
  };

  const desactivarUsuario = async (id) => {
    if (!confirm('¿Seguro que desea desactivar este usuario?')) return;
    try {
      await axios.patch(`/api/v1/usuarios/${id}/desactivar`);
      cargarUsuarios();
    } catch (err) {
      console.error(err);
    }
  };

  if (usuario?.rol !== 'admin') {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-slate-800">Acceso Denegado</h2>
            <p className="text-slate-500 mt-2">No tienes permisos para ver esta página.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Users /> Gestión de Usuarios y Roles</h2>
          <button onClick={() => { setMostrarForm(true); setEditando(null); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={18} /> Nuevo Usuario</button>
        </div>

        {mostrarForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <h3 className="font-semibold mb-4">{editando ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h3>
            <form onSubmit={handleGuardar} className="grid grid-cols-3 gap-4">
              <input placeholder="Código" className="px-3 py-2 border rounded-lg" value={nuevoUsuario.codigo} onChange={e => setNuevoUsuario({...nuevoUsuario, codigo: e.target.value})} required />
              <input placeholder="Nombres" className="px-3 py-2 border rounded-lg" value={nuevoUsuario.nombres} onChange={e => setNuevoUsuario({...nuevoUsuario, nombres: e.target.value})} required />
              <input placeholder="Apellidos" className="px-3 py-2 border rounded-lg" value={nuevoUsuario.apellidos} onChange={e => setNuevoUsuario({...nuevoUsuario, apellidos: e.target.value})} required />
              
              <input type="email" placeholder="Correo" className="px-3 py-2 border rounded-lg" value={nuevoUsuario.correo} onChange={e => setNuevoUsuario({...nuevoUsuario, correo: e.target.value})} required disabled={!!editando} />
              
              {!editando && (
                <input type="password" placeholder="Contraseña" className="px-3 py-2 border rounded-lg" value={nuevoUsuario.contrasena} onChange={e => setNuevoUsuario({...nuevoUsuario, contrasena: e.target.value})} required />
              )}
              
              <select className="px-3 py-2 border rounded-lg" value={nuevoUsuario.rol} onChange={e => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}>
                <option value="admin">Administrador</option>
                <option value="gestor_calidad">Gestor de Calidad</option>
                <option value="auditor">Auditor</option>
                <option value="docente">Docente</option>
                <option value="estudiante">Estudiante</option>
                <option value="egresado">Egresado</option>
                <option value="invitado">Invitado</option>
              </select>

              <div className="col-span-3 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setMostrarForm(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{u.nombres} {u.apellidos}</p>
                    <p className="text-xs text-slate-500">{u.correo} | {u.codigo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      u.rol === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.rol === 'gestor_calidad' ? 'bg-blue-100 text-blue-700' :
                      u.rol === 'auditor' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{u.rol.replace('_', ' ').toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    {u.activo ? 
                      <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle size={16}/> Activo</span> : 
                      <span className="flex items-center gap-1 text-sm text-red-600"><XCircle size={16}/> Inactivo</span>
                    }
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button onClick={() => editarUsuario(u)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                    {u.activo && (
                      <button onClick={() => desactivarUsuario(u.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Desactivar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
