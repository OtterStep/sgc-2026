'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Download, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AuditoriasPage() {
  const [planes, setPlanes] = useState([]);
  const [hallazgos, setHallazgos] = useState([]);
  const [tab, setTab] = useState('planes');
  const [nuevoPlan, setNuevoPlan] = useState({ codigo: '', nombre: '', tipo: 'interna', fecha_programada: '' });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [p, h] = await Promise.all([
        axios.get('/api/v1/planes-auditoria'),
        axios.get('/api/v1/hallazgos'),
      ]);
      setPlanes(p.data);
      setHallazgos(h.data);
    } catch (err) {
      setPlanes([
        { id: '1', codigo: 'AUD-2024-01', nombre: 'Auditoría Interna de Calidad', tipo: 'interna', fecha_programada: '2024-06-15', estado: 'planificado' },
      ]);
      setHallazgos([
        { id: '1', tipo: 'no_conformidad', descripcion: 'Falta de trazabilidad en sílabos', gravedad: 'alta', estado: 'abierto', plan: { codigo: 'AUD-2024-01' } },
      ]);
    }
  };

  const handleCrearPlan = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/planes-auditoria', nuevoPlan);
      setNuevoPlan({ codigo: '', nombre: '', tipo: 'interna', fecha_programada: '' });
      cargarDatos();
    } catch (err) { alert('Error'); }
  };

  const descargarReporte = async () => {
    try {
      const response = await axios.get('/api/v1/auditorias/reporte', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'auditorias.pdf');
      link.click();
    } catch (err) { alert('Error PDF'); }
  };

  const getIconoGravedad = (g) => {
    if (g === 'critica' || g === 'alta') return <AlertTriangle className="text-red-500" size={18} />;
    return <CheckCircle className="text-amber-500" size={18} />;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Search /> Auditorías e Inspecciones</h2>
          <button onClick={descargarReporte} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"><Download size={18} /> Reporte PDF</button>
        </div>

        <div className="flex gap-4 mb-6 border-b border-slate-200">
          {['planes', 'hallazgos'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium capitalize ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
              {t === 'planes' ? 'Planes de Auditoría' : 'Hallazgos'}
            </button>
          ))}
        </div>

        {tab === 'planes' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus size={18} /> Nuevo Plan</h3>
              <form onSubmit={handleCrearPlan} className="grid grid-cols-4 gap-4">
                <input placeholder="Código" className="px-3 py-2 border rounded-lg" value={nuevoPlan.codigo} onChange={e => setNuevoPlan({...nuevoPlan, codigo: e.target.value})} required />
                <input placeholder="Nombre" className="px-3 py-2 border rounded-lg" value={nuevoPlan.nombre} onChange={e => setNuevoPlan({...nuevoPlan, nombre: e.target.value})} required />
                <select className="px-3 py-2 border rounded-lg" value={nuevoPlan.tipo} onChange={e => setNuevoPlan({...nuevoPlan, tipo: e.target.value})}>
                  <option value="interna">Interna</option>
                  <option value="externa">Externa</option>
                  <option value="especial">Especial</option>
                </select>
                <input type="date" className="px-3 py-2 border rounded-lg" value={nuevoPlan.fecha_programada} onChange={e => setNuevoPlan({...nuevoPlan, fecha_programada: e.target.value})} required />
                <button type="submit" className="col-span-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Programar Auditoría</button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Código</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipo</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Fecha</th><th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th></tr></thead>
                <tbody className="divide-y divide-slate-200">
                  {planes.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium">{p.codigo}</td>
                      <td className="px-6 py-4 text-sm">{p.nombre}</td>
                      <td className="px-6 py-4 text-sm capitalize">{p.tipo}</td>
                      <td className="px-6 py-4 text-sm">{p.fecha_programada}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${p.estado === 'ejecutado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{p.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'hallazgos' && (
          <div className="space-y-4">
            {hallazgos.map(h => (
              <div key={h.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
                {getIconoGravedad(h.gravedad)}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-900">{h.tipo.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-sm text-slate-600 mt-1">{h.descripcion}</p>
                      <p className="text-xs text-slate-400 mt-1">Plan: {h.plan?.codigo}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${h.estado === 'cerrado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.estado}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
