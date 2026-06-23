'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, ShieldAlert, CheckCircle, XCircle, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

export default function UsuariosPage() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    codigo: '', nombres: '', apellidos: '', correo: '', contrasena: '',
    rol: 'estudiante', facultad: '', escuela: ''
  });
  const [resetUser, setResetUser] = useState(null);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [resetCargando, setResetCargando] = useState(false);

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

  const handleRestablecer = async (e) => {
    e.preventDefault();
    if (nuevaContrasena.length < 6) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'La contraseña debe tener al menos 6 caracteres', confirmButtonColor: '#1e40af' });
      return;
    }
    setResetCargando(true);
    try {
      const { data } = await axios.post('/api/v1/auth/restablecer-password', {
        usuario_id: resetUser.id,
        nueva_contrasena: nuevaContrasena,
      });
      Swal.fire({ icon: 'success', title: 'Correcto', text: data.mensaje, timer: 2000, showConfirmButton: false });
      setResetUser(null);
      setNuevaContrasena('');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Error al restablecer contraseña', confirmButtonColor: '#1e40af' });
    } finally {
      setResetCargando(false);
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

        {/* Modal restablecer contraseña */}
        {resetUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md mx-4">
              <h3 className="font-semibold text-lg mb-2">Restablecer Contraseña</h3>
              <p className="text-sm text-slate-500 mb-4">
                Nueva contraseña para <strong>{resetUser.nombres} {resetUser.apellidos}</strong> ({resetUser.correo})
              </p>
              <form onSubmit={handleRestablecer} className="space-y-4">
                <input
                  type="password"
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setResetUser(null); setNuevaContrasena(''); }}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetCargando}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    {resetCargando ? 'Guardando...' : 'Restablecer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                      <button onClick={() => { setResetUser(u); setNuevaContrasena(''); }} className="text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center gap-1"><Key size={14}/> Restablecer</button>
                    )}
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
