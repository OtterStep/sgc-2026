'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText, GitBranch, Award, Search, ShieldAlert,
  Activity, BarChart3, ClipboardList, LogOut, Home
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/documentos', label: 'Gestión Documental', icon: FileText },
  { href: '/macroprocesos', label: 'Macroprocesos', icon: GitBranch },
  { href: '/procesos', label: 'Mapa de Procesos', icon: GitBranch },
  { href: '/acreditacion', label: 'Acreditación', icon: Award },
  { href: '/auditorias', label: 'Auditorías', icon: Search },
  { href: '/capas', label: 'CAPA', icon: ShieldAlert },
  { href: '/riesgos', label: 'Riesgos', icon: Activity },
  { href: '/indicadores', label: 'Indicadores', icon: BarChart3 },
  { href: '/encuestas', label: 'Encuestas', icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">SGC - UNT</h1>
        <p className="text-xs text-slate-400 mt-1">Gestión de la Calidad</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
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
