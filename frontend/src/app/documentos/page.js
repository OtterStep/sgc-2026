'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Plus, Search } from 'lucide-react';

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    cargarDocumentos();
  }, []);

  const cargarDocumentos = async () => {
    try {
      const { data } = await axios.get('/api/v1/documentos');
      setDocumentos(data);
    } catch (err) {
      // Datos de demostración
      setDocumentos([
        { id: '1', codigo: 'POL-001', titulo: 'Política de Calidad Institucional', estado: 'aprobado', version_actual: 3, creado_en: '2024-01-15' },
        { id: '2', codigo: 'MAN-002', titulo: 'Manual de Gestión de Procesos', estado: 'en_revision', version_actual: 2, creado_en: '2024-02-20' },
      ]);
    }
  };

  const descargarReporte = async () => {
    try {
      const response = await axios.get('/api/v1/documentos/reporte', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte-documentos.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Error al generar PDF');
    }
  };

  const filtrados = documentos.filter(d =>
    d.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    d.codigo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Gestión Documental</h2>
          <div className="flex gap-3">
            <button onClick={descargarReporte} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
              <Download size={18} /> Reporte PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus size={18} /> Nuevo Documento
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por código o título..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Versión</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtrados.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{doc.codigo}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{doc.titulo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      doc.estado === 'aprobado' ? 'bg-green-100 text-green-700' :
                      doc.estado === 'en_revision' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {doc.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">v{doc.version_actual}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
