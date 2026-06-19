'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import { Activity, Plus, Download, AlertTriangle } from 'lucide-react';

export default function RiesgosPage() {
  const [riesgos, setRiesgos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoRiesgo, setNuevoRiesgo] = useState({ codigo: '', nombre: '', descripcion: '', categoria: 'operativo', probabilidad: 3, impacto: 3, proceso_id: '' });

  useEffect(() => { 
    setRiesgos([
      { id: '1', codigo: 'R-2024-01', nombre: 'Deserción estudiantil elevada', categoria: 'academico', probabilidad: 4, impacto: 5, estado: 'activo', descripcion: 'Tendencia al alza en la deserción de estudiantes' },
      { id: '2', codigo: 'R-2024-02', nombre: 'Falla en infraestructura digital', categoria: 'tecnologico', probabilidad: 3, impacto: 4, estado: 'activo', descripcion: 'Riesgo de fallos en servicios online' },
    ]);
  }, []);

  const calcularNivel = (p, i) => {
    const val = p * i;
    if (val <= 4) return { label: 'Bajo', color: 'bg-green-100 text-green-700' };
    if (val <= 9) return { label: 'Medio', color: 'bg-amber-100 text-amber-700' };
    if (val <= 14) return { label: 'Alto', color: 'bg-orange-100 text-orange-700' };
    return { label: 'Crítico', color: 'bg-red-100 text-red-700' };
  };

  const handleCrear = (e) => {
    e.preventDefault();
    setRiesgos([...riesgos, { ...nuevoRiesgo, id: Date.now().toString() }]);
    setMostrarForm(false);
    setNuevoRiesgo({ codigo: '', nombre: '', descripcion: '', categoria: 'operativo', probabilidad: 3, impacto: 3, proceso_id: '' });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity /> Gestión de Riesgos
          </h2>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
              <Download size={18} /> Reporte PDF
            </button>
            <button onClick={() => setMostrarForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus size={18} /> Nuevo Riesgo
            </button>
          </div>
        </div>

        {mostrarForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <h3 className="font-semibold mb-4">Registrar Riesgo</h3>
            <form onSubmit={handleCrear} className="grid grid-cols-3 gap-4">
              <input 
                placeholder="Código" 
                className="px-3 py-2 border rounded-lg" 
                value={nuevoRiesgo.codigo} 
                onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, codigo: e.target.value })} 
                required 
              />
              <input 
                placeholder="Nombre" 
                className="px-3 py-2 border rounded-lg" 
                value={nuevoRiesgo.nombre} 
                onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, nombre: e.target.value })} 
                required 
              />
              <select 
                className="px-3 py-2 border rounded-lg" 
                value={nuevoRiesgo.categoria} 
                onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, categoria: e.target.value })}
              >
                {['estrategico', 'operativo', 'academico', 'financiero', 'legal', 'tecnologico', 'reputacional'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <div className="flex gap-2 items-center">
                <label className="text-sm text-slate-600">Prob:</label>
                <input 
                  type="number" 
                  min="1" 
                  max="5" 
                  className="px-3 py-2 border rounded-lg w-20" 
                  value={nuevoRiesgo.probabilidad} 
                  onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, probabilidad: parseInt(e.target.value) })} 
                />
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm text-slate-600">Imp:</label>
                <input 
                  type="number" 
                  min="1" 
                  max="5" 
                  className="px-3 py-2 border rounded-lg w-20" 
                  value={nuevoRiesgo.impacto} 
                  onChange={e => setNuevoRiesgo({ ...nuevoRiesgo, impacto: parseInt(e.target.value) })} 
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Guardar
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {riesgos.map(r => {
            const nivel = calcularNivel(r.probabilidad, r.impacto);
            return (
              <div key={r.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-slate-500 font-mono">{r.codigo}</p>
                    <p className="font-semibold text-slate-900 mt-1">{r.nombre}</p>
                    {r.descripcion && <p className="text-sm text-slate-600 mt-1">{r.descripcion}</p>}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${nivel.color}`}>{nivel.label}</span>
                </div>
                <div className="flex gap-6 text-sm text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Probabilidad:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full ${i <= r.probabilidad ? 'bg-blue-600' : 'bg-slate-200'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Impacto:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full ${i <= r.impacto ? 'bg-red-500' : 'bg-slate-200'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
