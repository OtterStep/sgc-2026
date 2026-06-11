'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { GitBranch, Plus, Download, ChevronRight } from 'lucide-react';

export default function ProcesosPage() {
  const [macroprocesos, setMacroprocesos] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [procesoSel, setProcesoSel] = useState(null);
  const [mostrarFormProc, setMostrarFormProc] = useState(false);
  const [nuevoProceso, setNuevoProceso] = useState({ codigo: '', nombre: '', objetivo: '', macroproceso_id: '', responsable_id: '' });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [mp, pr] = await Promise.all([
        axios.get('/api/v1/macroprocesos'),
        axios.get('/api/v1/procesos'),
      ]);
      setMacroprocesos(mp.data);
      setProcesos(pr.data);
    } catch (err) {
      // Demo data
      setMacroprocesos([
        { id: '1', codigo: 'MP-01', nombre: 'Direccionamiento Estratégico', tipo: 'estrategico' },
        { id: '2', codigo: 'MP-02', nombre: 'Formación Profesional', tipo: 'misional' },
      ]);
      setProcesos([
        { id: '1', codigo: 'P-01', nombre: 'Planificación Curricular', objetivo: 'Diseñar planes de estudio', macroproceso_id: '2', estado: 'activo' },
        { id: '2', codigo: 'P-02', nombre: 'Gestión de Docencia', objetivo: 'Ejecutar actividades académicas', macroproceso_id: '2', estado: 'activo' },
      ]);
    }
  };

  const verActividades = async (proceso) => {
    setProcesoSel(proceso);
    try {
      const { data } = await axios.get(`/api/v1/procesos/${proceso.id}/actividades`);
      setActividades(data);
    } catch (err) {
      setActividades([
        { id: '1', codigo: 'A-01', nombre: 'Elaboración de sílabo', secuencia: 1, descripcion: 'Redactar sílabo del curso' },
        { id: '2', codigo: 'A-02', nombre: 'Ejecución de clases', secuencia: 2, descripcion: 'Desarrollar sesiones de aprendizaje' },
      ]);
    }
  };

  const handleCrearProceso = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/procesos', nuevoProceso);
      setMostrarFormProc(false);
      cargarDatos();
    } catch (err) {
      alert('Error al crear proceso');
    }
  };

  const descargarReporte = async () => {
    try {
      const response = await axios.get('/api/v1/procesos/reporte', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mapa-procesos.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Error al generar PDF');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><GitBranch /> Mapa de Procesos</h2>
          <div className="flex gap-3">
            <button onClick={descargarReporte} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"><Download size={18} /> Reporte PDF</button>
            <button onClick={() => setMostrarFormProc(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={18} /> Nuevo Proceso</button>
          </div>
        </div>

        {mostrarFormProc && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <h3 className="font-semibold mb-4">Registrar Nuevo Proceso</h3>
            <form onSubmit={handleCrearProceso} className="grid grid-cols-3 gap-4">
              <input placeholder="Código" className="px-3 py-2 border rounded-lg" value={nuevoProceso.codigo} onChange={e => setNuevoProceso({...nuevoProceso, codigo: e.target.value})} required />
              <input placeholder="Nombre" className="px-3 py-2 border rounded-lg" value={nuevoProceso.nombre} onChange={e => setNuevoProceso({...nuevoProceso, nombre: e.target.value})} required />
              <select className="px-3 py-2 border rounded-lg" value={nuevoProceso.macroproceso_id} onChange={e => setNuevoProceso({...nuevoProceso, macroproceso_id: e.target.value})} required>
                <option value="">Seleccionar Macroproceso</option>
                {macroprocesos.map(mp => <option key={mp.id} value={mp.id}>{mp.nombre}</option>)}
              </select>
              <input placeholder="Objetivo" className="col-span-2 px-3 py-2 border rounded-lg" value={nuevoProceso.objetivo} onChange={e => setNuevoProceso({...nuevoProceso, objetivo: e.target.value})} />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">Procesos Institucionales</div>
            <div className="divide-y divide-slate-200">
              {procesos.map(p => (
                <div key={p.id} className="p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center" onClick={() => verActividades(p)}>
                  <div>
                    <p className="font-medium text-slate-900">{p.codigo} - {p.nombre}</p>
                    <p className="text-xs text-slate-500">{p.objetivo}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
              {procesoSel ? `Actividades: ${procesoSel.nombre}` : 'Seleccione un proceso'}
            </div>
            <div className="divide-y divide-slate-200">
              {actividades.map((a, i) => (
                <div key={a.id} className="p-4 flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{i + 1}</span>
                  <div>
                    <p className="font-medium text-slate-900">{a.codigo} - {a.nombre}</p>
                    <p className="text-sm text-slate-600">{a.descripcion}</p>
                  </div>
                </div>
              ))}
              {actividades.length === 0 && <p className="p-8 text-center text-slate-400 text-sm">No hay actividades registradas</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
