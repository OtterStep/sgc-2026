'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/context/AuthContext';

const COLORES = ['#003366', '#0066cc', '#4d94ff', '#99c2ff', '#cce0ff'];

export default function Dashboard() {
  const { usuario } = useAuth();
  const [estadisticas, setEstadisticas] = useState({
    documentos: 0, capas: 0, riesgos: 0, encuestas: 0,
    indicadores: [], satisfaccion: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/v1/dashboard/estadisticas');
        setEstadisticas(data);
      } catch (err) {
        console.error('Error cargando estadísticas del dashboard:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Panel de Control</h2>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Documentos', valor: estadisticas.documentos, color: 'bg-blue-600', show: true },
            { label: 'CAPAs Activas', valor: estadisticas.capas, color: 'bg-amber-500', show: ['admin', 'gestor_calidad', 'auditor'].includes(usuario?.rol) },
            { label: 'Riesgos', valor: estadisticas.riesgos, color: 'bg-red-500', show: ['admin', 'gestor_calidad', 'auditor'].includes(usuario?.rol) },
            { label: 'Encuestas', valor: estadisticas.encuestas, color: 'bg-emerald-500', show: true },
          ].filter(card => card.show).map((card, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                <span className="text-xl font-bold">{card.valor}</span>
              </div>
              <p className="text-sm text-slate-500">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {['admin', 'gestor_calidad', 'docente', 'auditor'].includes(usuario?.rol) && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Indicadores de Gestión</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticas.indicadores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="valor" fill="#003366" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Satisfacción General</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadisticas.satisfaccion}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {estadisticas.satisfaccion.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
