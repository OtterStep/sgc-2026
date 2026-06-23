'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { User, Shield, Mail, Key, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PerfilPage() {
  const { usuario, logout } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (usuario) {
      axios.get('/api/v1/auth/perfil')
        .then(({ data }) => setPerfil(data))
        .catch(() => { logout(); })
        .finally(() => setCargando(false));
    }
  }, [usuario]);

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (nuevaContrasena !== confirmarContrasena) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas nuevas no coinciden', confirmButtonColor: '#1e40af' });
      return;
    }
    if (nuevaContrasena.length < 6) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'La nueva contraseña debe tener al menos 6 caracteres', confirmButtonColor: '#1e40af' });
      return;
    }
    setGuardando(true);
    try {
      await axios.post('/api/v1/auth/cambiar-password', {
        contrasena_actual: contrasenaActual,
        nueva_contrasena: nuevaContrasena,
      });
      Swal.fire({ icon: 'success', title: 'Correcto', text: 'Contraseña actualizada correctamente', timer: 2000, showConfirmButton: false });
      setContrasenaActual('');
      setNuevaContrasena('');
      setConfirmarContrasena('');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Error al cambiar la contraseña', confirmButtonColor: '#1e40af' });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-slate-500">Cargando...</p>
        </main>
      </div>
    );
  }

  const rolLabel = {
    admin: 'Administrador',
    gestor_calidad: 'Gestor de Calidad',
    auditor: 'Auditor',
    docente: 'Docente',
    estudiante: 'Estudiante',
    egresado: 'Egresado',
    invitado: 'Invitado',
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <User /> Mi Perfil
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del perfil */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} /> Información Personal
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Nombres</label>
                <p className="text-slate-800 font-medium">{perfil?.nombres} {perfil?.apellidos}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Código</label>
                <p className="text-slate-800 font-medium">{perfil?.codigo}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <Mail size={14} /> Correo
                </label>
                <p className="text-slate-800 font-medium">{perfil?.correo}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <Shield size={14} /> Rol
                </label>
                <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium mt-1 ${
                  perfil?.rol === 'admin' ? 'bg-purple-100 text-purple-700' :
                  perfil?.rol === 'gestor_calidad' ? 'bg-blue-100 text-blue-700' :
                  perfil?.rol === 'auditor' ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-100 text-slate-700'
                }`}>{rolLabel[perfil?.rol] || perfil?.rol}</span>
              </div>
              {perfil?.facultad && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Facultad</label>
                  <p className="text-slate-800 font-medium">{perfil?.facultad}</p>
                </div>
              )}
              {perfil?.escuela && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Escuela</label>
                  <p className="text-slate-800 font-medium">{perfil?.escuela}</p>
                </div>
              )}
              {perfil?.ultimo_acceso && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Último Acceso</label>
                  <p className="text-slate-800 font-medium">{new Date(perfil.ultimo_acceso).toLocaleString('es-PE')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cambiar contraseña */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Key size={20} /> Cambiar Contraseña
            </h3>
            <form onSubmit={handleCambiarPassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={mostrarActual ? 'text' : 'password'}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                    value={contrasenaActual}
                    onChange={(e) => setContrasenaActual(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setMostrarActual((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                    {mostrarActual ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={mostrarNueva ? 'text' : 'password'}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setMostrarNueva((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                    {mostrarNueva ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={mostrarConfirmar ? 'text' : 'password'}
                    className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 ${
                      confirmarContrasena && nuevaContrasena !== confirmarContrasena
                        ? 'border-red-400 focus:border-red-600 focus:ring-red-600/15'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/15'
                    }`}
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setMostrarConfirmar((v) => !v)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
                    {mostrarConfirmar ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {confirmarContrasena && nuevaContrasena !== confirmarContrasena && (
                  <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
                )}
                {confirmarContrasena && nuevaContrasena === confirmarContrasena && (
                  <p className="mt-1 text-xs text-green-500 flex items-center gap-1"><CheckCircle size={12} /> Coinciden</p>
                )}
              </div>

              <button
                type="submit"
                disabled={guardando || (!!confirmarContrasena && nuevaContrasena !== confirmarContrasena)}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando ? 'Guardando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
