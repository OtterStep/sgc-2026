'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { swalError, swalSuccess } from '@/lib/swal';

export default function CapasPage() {
  const [capas, setCapas] = useState([]);
  const [nuevaCapa, setNuevaCapa] = useState({ codigo: '', tipo: 'correctiva', descripcion: '', accion_propuesta: '', responsable_id: '' });

  useEffect(() => {
    cargarCapas();
  }, []);

  const cargarCapas = async () => {
    try {
      const { data } = await axios.get('/api/v1/capas');
      setCapas(data);
    } catch (err) {
      setCapas([
        { id: '1', codigo: 'CAPA-2024-001', tipo: 'correctiva', descripcion: 'Retraso en entrega de sílabos', estado: 'en_implementacion', efectividad: 'pendiente', 'responsable.nombres': 'Juan Pérez' },
        { id: '2', codigo: 'CAPA-2024-002', tipo: 'preventiva', descripcion: 'Capacitación en normativa ISO', estado: 'implementada', efectividad: 'efectiva', 'responsable.nombres': 'María López' },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/capas', nuevaCapa);
      swalSuccess('CAPA registrada correctamente');
      cargarCapas();
      setNuevaCapa({ codigo: '', tipo: 'correctiva', descripcion: '', accion_propuesta: '', responsable_id: '' });
    } catch (err) {
      swalError(err);
    }
  };

  const getIconoEstado = (estado) => {
    switch (estado) {
      case 'cerrada': return <CheckCircle className="text-green-500" size={20} />;
      case 'en_implementacion': return <Clock className="text-amber-500" size={20} />;
      default: return <AlertTriangle className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ShieldAlert /> Acciones Correctivas y Preventivas (CAPA)
        </h2>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Nueva CAPA</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={nuevaCapa.codigo}
                  onChange={(e) => setNuevaCapa({ ...nuevaCapa, codigo: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={nuevaCapa.tipo}
                  onChange={(e) => setNuevaCapa({ ...nuevaCapa, tipo: e.target.value })}
                >
                  <option value="correctiva">Correctiva</option>
                  <option value="preventiva">Preventiva</option>
                  <option value="mejora">Mejora</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={3}
                  value={nuevaCapa.descripcion}
                  onChange={(e) => setNuevaCapa({ ...nuevaCapa, descripcion: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acción Propuesta</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={2}
                  value={nuevaCapa.accion_propuesta}
                  onChange={(e) => setNuevaCapa({ ...nuevaCapa, accion_propuesta: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Registrar CAPA
              </button>
            </form>
          </div>

          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-700">Listado de CAPAs</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {capas.map((capa) => (
                <div key={capa.id} className="p-4 hover:bg-slate-50 flex items-start gap-4">
                  {getIconoEstado(capa.estado)}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-900">{capa.codigo}</p>
                        <p className="text-sm text-slate-600 mt-1">{capa.descripcion}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        capa.estado === 'cerrada' ? 'bg-green-100 text-green-700' :
                        capa.estado === 'implementada' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {capa.estado}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-slate-500">
                      <span>Tipo: <strong className="capitalize">{capa.tipo}</strong></span>
                      <span>Responsable: {capa['responsable.nombres'] || 'Sin asignar'}</span>
                      <span>Efectividad: {capa.efectividad || 'Pendiente'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
