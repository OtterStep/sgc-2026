'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { GraduationCap, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import QualitySeal from '@/components/QualitySeal';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(correo, contrasena);
      router.push('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#071A33] p-10 md:flex">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#C9CFDA]/80 hover:text-[#F7F4EC]"
        >
          <ArrowLeft size={15} />
          Volver al inicio
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <QualitySeal compact />
        </div>

        <div className="max-w-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
            Universidad Nacional de Trujillo
          </p>
          <h2
            style={{ fontFamily: 'var(--font-serif)' }}
            className="mt-3 text-2xl font-semibold leading-snug text-[#F7F4EC]"
          >
            Procesos documentados, auditables y con mejora continua.
          </h2>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[#F7F4EC] p-6 md:p-12">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#5B6472] hover:text-[#0B2545] md:hidden"
          >
            <ArrowLeft size={15} />
            Volver al inicio
          </Link>

          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B2545]">
              <GraduationCap size={22} className="text-[#C9A227]" />
            </div>
            <div className="leading-none">
              <p
                style={{ fontFamily: 'var(--font-serif)' }}
                className="text-lg font-semibold text-[#0B2545]"
              >
                SGC · UNT
              </p>
              <p className="text-xs text-[#5B6472]">Sistema de Gestión de la Calidad</p>
            </div>
          </div>

          <h1 className="text-xl font-semibold text-[#0B2545]">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-[#5B6472]">
            Ingresa con tu correo institucional para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="correo" className="mb-1.5 block text-sm font-medium text-[#1F2430]">
                Correo institucional
              </label>
              <input
                id="correo"
                type="email"
                placeholder="nombre.apellido@unitru.edu.pe"
                className="w-full rounded-lg border border-[#E3DDCB] bg-white px-3.5 py-2.5 text-sm text-[#1F2430] placeholder:text-[#5B6472]/50 focus:border-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="contrasena"
                className="mb-1.5 block text-sm font-medium text-[#1F2430]"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="contrasena"
                  type={mostrarContrasena ? 'text' : 'password'}
                  className="w-full rounded-lg border border-[#E3DDCB] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#1F2430] focus:border-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5B6472] hover:text-[#0B2545] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2545]"
                  aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarContrasena ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B2545] py-2.5 text-sm font-semibold text-[#F7F4EC] transition-colors hover:bg-[#0B2545]/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cargando ? 'Verificando…' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-7 flex items-center gap-2 text-xs text-[#5B6472]">
            <ShieldCheck size={14} className="text-[#0B2545]/60" />
            Acceso reservado al personal autorizado de la UNT.
          </div>
        </div>
      </div>
    </div>
  );
}