'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText, GitBranch, Award, Search, ShieldAlert,
  Activity, BarChart3, ClipboardList, LogOut, Home, Users, User
} from 'lucide-react';

const menuItems = [
  { href: '/perfil', label: 'Mi Perfil', icon: User, roles: ['admin', 'gestor_calidad', 'auditor', 'docente', 'estudiante', 'egresado', 'invitado'] },
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'gestor_calidad', 'auditor', 'docente', 'estudiante', 'egresado', 'invitado'] },
  { href: '/documentos', label: 'Gestión Documental', icon: FileText, roles: ['admin', 'gestor_calidad', 'auditor', 'docente', 'estudiante', 'egresado'] },
  { href: '/procesos', label: 'Mapa de Procesos', icon: GitBranch, roles: ['admin', 'gestor_calidad', 'auditor', 'docente', 'estudiante'] },
  { href: '/acreditacion', label: 'Acreditación', icon: Award, roles: ['admin', 'gestor_calidad', 'auditor', 'docente'] },
  { href: '/auditorias', label: 'Auditorías', icon: Search, roles: ['admin', 'gestor_calidad', 'auditor'] },
  { href: '/capas', label: 'CAPA', icon: ShieldAlert, roles: ['admin', 'gestor_calidad', 'auditor'] },
  { href: '/riesgos', label: 'Riesgos', icon: Activity, roles: ['admin', 'gestor_calidad', 'auditor'] },
  { href: '/indicadores', label: 'Indicadores', icon: BarChart3, roles: ['admin', 'gestor_calidad', 'auditor', 'docente'] },
  { href: '/encuestas', label: 'Encuestas', icon: ClipboardList, roles: ['admin', 'gestor_calidad', 'estudiante', 'egresado', 'docente', 'auditor', 'invitado'] },
  { href: '/usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { usuario, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">SGC - UNT</h1>
        <p className="text-xs text-slate-400 mt-1">Gestión de la Calidad</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.filter(item => item.roles.includes(usuario?.rol)).map((item) => {
          const Icon = item.icon;
          const activo = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activo ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
