'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import { BarChart3, Plus, Download, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function IndicadoresPage() {
  const [indicadores, setIndicadores] = useState([]);
  const [mediciones, setMediciones] = useState([]);
  const [indicadorSel, setIndicadorSel] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoIndicador, setNuevoIndicador] = useState({ 
    codigo: '', 
    nombre: '', 
    tipo: 'eficacia', 
    meta: 100, 
    frecuencia_medicion: 'mensual' 
  });

  useEffect(() => { 
    setIndicadores([
      { id: '1', codigo: 'IND-01', nombre: 'Tasa de satisfacción estudiantil', tipo: 'satisfaccion', meta: 85, unidad_medida: '%', estado: 'activo' },
      { id: '2', codigo: 'IND-02', nombre: 'Cumplimiento de planes de estudio', tipo: 'eficacia', meta: 95, unidad_medida: '%', estado: 'activo' },
    ]);
  }, []);

  const verMediciones = (ind) => {
    setIndicadorSel(ind);
    setMediciones([
      { periodo: '2024-01', valor_real: 82, valor_esperado: 85, cumplimiento: 96.4 },
      { periodo: '2024-02', valor_real: 86, valor_esperado: 85, cumplimiento: 101.1 },
      { periodo: '2024-03', valor_real: 84, valor_esperado: 85, cumplimiento: 98.8 },
    ]);
  };

  const handleCrear = (e) => {
    e.preventDefault();
    setIndicadores([...indicadores, { ...nuevoIndicador, id: Date.now().toString() }]);
    setMostrarForm(false);
    setNuevoIndicador({ 
      codigo: '', 
      nombre: '', 
      tipo: 'eficacia', 
      meta: 100, 
      frecuencia_medicion: 'mensual' 
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 /> Indicadores de Gestión
          </h2>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
              <Download size={18} /> Reporte PDF
            </button>
            <button onClick={() => setMostrarForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus size={18} /> Nuevo Indicador
            </button>
          </div>
        </div>

        {mostrarForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <h3 className="font-semibold mb-4">Nuevo Indicador</h3>
            <form onSubmit={handleCrear} className="grid grid-cols-3 gap-4">
              <input 
                placeholder="Código" 
                className="px-3 py-2 border rounded-lg" 
                value={nuevoIndicador.codigo} 
                onChange={e => setNuevoIndicador({ ...nuevoIndicador, codigo: e.target.value })} 
                required 
              />
              <input 
                placeholder="Nombre" 
                className="px-3 py-2 border rounded-lg" 
                value={nuevoIndicador.nombre} 
                onChange={e => setNuevoIndicador({ ...nuevoIndicador, nombre: e.target.value })} 
                required 
              />
              <select 
                className="px-3 py-2 border rounded-lg" 
                value={nuevoIndicador.tipo} 
                onChange={e => setNuevoIndicador({ ...nuevoIndicador, tipo: e.target.value })}
              >
                <option value="eficacia">Eficacia</option>
                <option value="eficiencia">Eficiencia</option>
                <option value="impacto">Impacto</option>
                <option value="satisfaccion">Satisfacción</option>
              </select>
              <input 
                type="number" 
                placeholder="Meta" 
                className="px-3 py-2 border rounded-lg" 
                value={nuevoIndicador.meta} 
                onChange={e => setNuevoIndicador({ ...nuevoIndicador, meta: e.target.value })} 
              />
              <div className="col-span-2"></div>
              <button type="submit" className="col-span-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Guardar Indicador
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 mb-8">
          {indicadores.map(ind => (
            <div 
              key={ind.id} 
              onClick={() => verMediciones(ind)} 
              className={`bg-white p-6 rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md ${indicadorSel?.id === ind.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-mono text-slate-500">{ind.codigo}</p>
                <TrendingUp size={18} className="text-blue-600" />
              </div>
              <p className="font-semibold text-slate-900">{ind.nombre}</p>
              <div className="mt-4 flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-500">Meta</p>
                  <p className="text-lg font-bold text-slate-800">{ind.meta}{ind.unidad_medida}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 capitalize">{ind.tipo}</span>
              </div>
            </div>
          ))}
        </div>

        {indicadorSel && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold mb-4">Histórico: {indicadorSel.nombre}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mediciones}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <ReferenceLine y={indicadorSel.meta} stroke="red" strokeDasharray="3 3" label="Meta" />
                <Bar dataKey="valor_real" fill="#003366" name="Valor Real" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cumplimiento" fill="#4d94ff" name="% Cumplimiento" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
