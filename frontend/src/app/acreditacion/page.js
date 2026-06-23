'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Plus, Download, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';
import { useAuth } from '@/context/AuthContext';

export default function AcreditacionPage() {
  const { usuario } = useAuth();
  const [estandares, setEstandares] = useState([]);
  const [autoevaluaciones, setAutoevaluaciones] = useState([]);
  const [tab, setTab] = useState('estandares');
  const [nuevoEstandar, setNuevoEstandar] = useState({ codigo: '', nombre: '', organizacion: '' });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [e, a] = await Promise.all([
        axios.get('/api/v1/estandares'),
        axios.get('/api/v1/autoevaluaciones'),
      ]);
      setEstandares(e.data);
      setAutoevaluaciones(a.data);
    } catch (err) {
      setEstandares([
        { id: '1', codigo: 'ISO-21001', nombre: 'ISO 21001:2018', organizacion: 'ISO' },
        { id: '2', codigo: 'SUNEDU-01', nombre: 'Modelo de Acreditación SUNEDU', organizacion: 'SUNEDU' },
      ]);
      setAutoevaluaciones([
        { id: '1', periodo: '2024-I', estandar: { nombre: 'ISO 21001' }, estado: 'en_proceso', puntaje_total: 78.5 },
      ]);
    }
  };

  const handleCrearEstandar = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/estandares', nuevoEstandar);
      setNuevoEstandar({ codigo: '', nombre: '', organizacion: '' });
      swalSuccess('Estándar registrado correctamente');
      cargarDatos();
    } catch (err) { swalError(err); }
  };

  const descargarReporte = async () => {
    try {
      const response = await axios.get('/api/v1/acreditacion/reporte', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'acreditacion.pdf');
      link.click();
    } catch (err) { swalError(err); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Award /> Acreditación y Autoevaluación</h2>
          <button onClick={descargarReporte} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"><Download size={18} /> Reporte PDF</button>
        </div>

        <div className="flex gap-4 mb-6 border-b border-slate-200">
          {['estandares', 'autoevaluaciones'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium capitalize ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
              {t === 'estandares' ? 'Estándares' : 'Autoevaluaciones'}
            </button>
          ))}
        </div>

        {tab === 'estandares' && (
          <div className="space-y-6">
            {['admin', 'gestor_calidad'].includes(usuario?.rol) && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus size={18} /> Nuevo Estándar</h3>
                <form onSubmit={handleCrearEstandar} className="grid grid-cols-3 gap-4">
                  <input placeholder="Código" className="px-3 py-2 border rounded-lg" value={nuevoEstandar.codigo} onChange={e => setNuevoEstandar({...nuevoEstandar, codigo: e.target.value})} required />
                  <input placeholder="Nombre" className="px-3 py-2 border rounded-lg" value={nuevoEstandar.nombre} onChange={e => setNuevoEstandar({...nuevoEstandar, nombre: e.target.value})} required />
                  <input placeholder="Organización" className="px-3 py-2 border rounded-lg" value={nuevoEstandar.organizacion} onChange={e => setNuevoEstandar({...nuevoEstandar, organizacion: e.target.value})} required />
                  <button type="submit" className="col-span-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Registrar Estándar</button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6">
              {estandares.map(e => (
                <div key={e.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-slate-500">{e.codigo}</p>
                      <p className="font-semibold text-slate-900">{e.nombre}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium">{e.organizacion}</span>
                  </div>
                  {['admin', 'gestor_calidad'].includes(usuario?.rol) && (
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 flex justify-center items-center gap-2 text-sm font-medium"><Edit size={16} /> Editar</button>
                      <button className="flex-1 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 flex justify-center items-center gap-2 text-sm font-medium"><Trash2 size={16} /> Eliminar</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'autoevaluaciones' && (
          <div className="grid grid-cols-3 gap-6">
            {autoevaluaciones.map(a => (
              <div key={a.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-slate-500">{a.periodo}</p>
                    <p className="font-semibold text-slate-900">{a.estandar?.nombre}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${a.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{a.estado}</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={18} className="text-blue-600" />
                  <span className="text-2xl font-bold text-slate-800">{a.puntaje_total || '-'}</span>
                  <span className="text-sm text-slate-500">/ 100 pts</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium">Ver Detalle</button>
                  {['admin', 'gestor_calidad'].includes(usuario?.rol) && (
                    <button className="py-2 px-3 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
