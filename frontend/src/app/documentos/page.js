'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Plus, Search, Edit, Eye, Archive, Send, CheckCircle, RotateCcw, Clock3, History } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';

const ESTADO_STYLES = {
  borrador: 'bg-blue-100 text-blue-700',
  en_revision: 'bg-amber-100 text-amber-700',
  aprobado: 'bg-green-100 text-green-700',
  archivado: 'bg-slate-200 text-slate-700',
};

const ESTADO_LABEL = {
  borrador: 'Borrador',
  en_revision: 'En Revisión',
  aprobado: 'Aprobado',
  archivado: 'Archivado',
};

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [nuevoDoc, setNuevoDoc] = useState({
    codigo: '',
    titulo: '',
    tipo_documento_id: '',
    contenido: '',
    fecha_vigencia: '',
    cambios_descripcion: '',
  });
  const [docSeleccionado, setDocSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [historial, setHistorial] = useState({ versiones: [] });

  useEffect(() => {
    cargarDocumentos();
    cargarTipos();
  }, []);

  const cargarDocumentos = async () => {
    try {
      const { data } = await axios.get('/api/v1/documentos');
      setDocumentos(data);
    } catch (err) {
      setDocumentos([
        { id: '1', codigo: 'POL-001', titulo: 'Política de Calidad Institucional', estado: 'aprobado', version_actual: 3, creado_en: '2024-01-15' },
        { id: '2', codigo: 'MAN-002', titulo: 'Manual de Gestión de Procesos', estado: 'en_revision', version_actual: 2, creado_en: '2024-02-20' },
        { id: '3', codigo: 'PRO-003', titulo: 'Procedimiento de Auditoría Interna', estado: 'borrador', version_actual: 1, creado_en: '2024-03-10' },
        { id: '4', codigo: 'INS-004', titulo: 'Instructivo Obsoleto', estado: 'obsoleto', version_actual: 1, creado_en: '2023-05-10' },
      ]);
    }
  };

  const cargarTipos = async () => {
    try {
      const { data } = await axios.get('/api/v1/tipos-documento');
      setTipos(data);
      if (data.length > 0) {
        setNuevoDoc(prev => ({ ...prev, tipo_documento_id: data[0].id.toString() }));
      }
    } catch (err) {
      const fallbackTipos = [
        { id: 1, nombre: 'Política', codigo: 'POL' },
        { id: 2, nombre: 'Manual', codigo: 'MAN' },
        { id: 3, nombre: 'Procedimiento', codigo: 'PRO' },
        { id: 4, nombre: 'Instructivo', codigo: 'INS' },
        { id: 5, nombre: 'Formato', codigo: 'FOR' },
      ];
      setTipos(fallbackTipos);
      setNuevoDoc(prev => ({ ...prev, tipo_documento_id: '1' }));
    }
  };

  const handleCrearDocumento = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...nuevoDoc,
        tipo_documento_id: parseInt(nuevoDoc.tipo_documento_id, 10),
      };
      if (modoEdicion && docSeleccionado) {
        await axios.put(`/api/v1/documentos/${docSeleccionado.id}`, payload);
        swalSuccess('Documento actualizado correctamente');
      } else {
        await axios.post('/api/v1/documentos', payload);
        swalSuccess('Documento registrado correctamente como borrador');
      }
      setMostrarModal(false);
      resetFormulario();
      cargarDocumentos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleEditar = (doc) => {
    setDocSeleccionado(doc);
    setNuevoDoc({
      codigo: doc.codigo,
      titulo: doc.titulo,
      tipo_documento_id: doc.tipo_documento_id?.toString() || '1',
      contenido: doc.contenido || '',
      fecha_vigencia: doc.fecha_vigencia || '',
      cambios_descripcion: '',
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  // Botón "Ver" -> historial de versiones anteriores
  const handleVer = async (doc) => {
    setDocSeleccionado(doc);
    setMostrarModalVer(true);
    try {
      const { data } = await axios.get(`/api/v1/documentos/${doc.id}/versiones`);
      setHistorial({ versiones: data.versiones || [] });
    } catch (err) {
      setHistorial({
        versiones: [
          { id: 'v1', numero_version: doc.version_actual, cambios_descripcion: 'Versión actual', estado: doc.estado, creado_en: doc.creado_en, creadoPor: { nombres: 'Demo', apellidos: 'Usuario' } },
        ],
      });
    }
  };

  const handleEnviarRevision = async (doc) => {
    const result = await swalConfirm(`¿Enviar el documento ${doc.codigo} a revisión?`);
    if (!result.isConfirmed) return;
    try {
      await axios.patch(`/api/v1/documentos/${doc.id}/enviar-revision`);
      swalSuccess('Documento enviado a revisión');
      cargarDocumentos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleAprobar = async (doc) => {
    const result = await swalConfirm(`¿Confirmas la aprobación del documento ${doc.codigo}? Pasará a estado "Aprobado".`);
    if (!result.isConfirmed) return;
    try {
      await axios.patch(`/api/v1/documentos/${doc.id}/aprobar`);
      swalSuccess('Documento aprobado correctamente');
      cargarDocumentos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleDevolverBorrador = async (doc) => {
    const result = await swalConfirm(`¿Devolver ${doc.codigo} a borrador para hacer correcciones?`);
    if (!result.isConfirmed) return;
    try {
      await axios.patch(`/api/v1/documentos/${doc.id}/devolver-borrador`);
      swalSuccess('Documento devuelto a borrador');
      cargarDocumentos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleMarcarObsoleto = async (doc) => {
    const result = await swalConfirm(`¿Marcar ${doc.codigo} como obsoleto? El documento dejará de estar vigente.`);
    if (!result.isConfirmed) return;
    try {
      await axios.patch(`/api/v1/documentos/${doc.id}/obsoleto`);
      swalSuccess('Documento marcado como obsoleto');
      cargarDocumentos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleArchivar = async (doc) => {
    const result = await swalConfirm('¿Estás seguro de archivar este documento? Esta acción es definitiva.');
    if (result.isConfirmed) {
      try {
        await axios.patch(`/api/v1/documentos/${doc.id}/archivar`);
        swalSuccess('Documento archivado correctamente');
        cargarDocumentos();
      } catch (err) {
        swalError(err);
      }
    }
  };

  const resetFormulario = () => {
    setNuevoDoc({
      codigo: '',
      titulo: '',
      tipo_documento_id: tipos[0]?.id?.toString() || '1',
      contenido: '',
      fecha_vigencia: '',
      cambios_descripcion: '',
    });
    setDocSeleccionado(null);
    setModoEdicion(false);
  };

  const abrirModalNuevo = () => {
    resetFormulario();
    setMostrarModal(true);
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
      swalError(err);
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
            <button onClick={abrirModalNuevo} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipo</th>
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
                    <td className="px-6 py-4 text-sm text-slate-600">{doc.tipo?.nombre || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${ESTADO_STYLES[doc.estado] || 'bg-slate-100 text-slate-700'}`}>
                        {ESTADO_LABEL[doc.estado] || doc.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">v{doc.version_actual}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {/* Ver historial de versiones: siempre disponible */}
                        <button onClick={() => handleVer(doc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver versiones anteriores">
                          <Eye size={16} />
                        </button>

                        {doc.estado === 'borrador' && (
                          <>
                            <button onClick={() => handleEditar(doc)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Editar">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleEnviarRevision(doc)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Enviar a revisión">
                              <Send size={16} />
                            </button>
                          </>
                        )}

                        {doc.estado === 'en_revision' && (
                          <>
                            <button onClick={() => handleAprobar(doc)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Aprobar documento">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => handleDevolverBorrador(doc)} className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-lg" title="Devolver a borrador">
                              <RotateCcw size={16} />
                            </button>
                          </>
                        )}

                        {doc.estado === 'aprobado' && (
                          <>
                            <button onClick={() => handleEditar(doc)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Editar (genera nueva versión)">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleMarcarObsoleto(doc)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg" title="Marcar como obsoleto">
                              <Clock3 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Crear/Editar */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  {modoEdicion ? 'Editar Documento' : 'Registrar Nuevo Documento'}
                </h3>
                <button onClick={() => setMostrarModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none">
                  &times;
                </button>
              </div>
              <form onSubmit={handleCrearDocumento} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                    <input
                      type="text"
                      placeholder="Ej. POL-001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      value={nuevoDoc.codigo}
                      onChange={(e) => setNuevoDoc({ ...nuevoDoc, codigo: e.target.value })}
                      disabled={modoEdicion}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                      value={nuevoDoc.tipo_documento_id}
                      onChange={(e) => setNuevoDoc({ ...nuevoDoc, tipo_documento_id: e.target.value })}
                      required
                    >
                      {tipos.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                  <input
                    type="text"
                    placeholder="Título descriptivo del documento"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    value={nuevoDoc.titulo}
                    onChange={(e) => setNuevoDoc({ ...nuevoDoc, titulo: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de vigencia</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                    value={nuevoDoc.fecha_vigencia}
                    onChange={(e) => setNuevoDoc({ ...nuevoDoc, fecha_vigencia: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contenido / Descripción</label>
                  <textarea
                    placeholder="Escriba el texto del documento o una descripción detallada..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    value={nuevoDoc.contenido}
                    onChange={(e) => setNuevoDoc({ ...nuevoDoc, contenido: e.target.value })}
                    required
                  />
                </div>

                {modoEdicion && docSeleccionado?.estado === 'aprobado' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Descripción del cambio <span className="text-slate-400">(se creará una nueva versión y volverá a borrador)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Actualización de referencias normativas"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                      value={nuevoDoc.cambios_descripcion}
                      onChange={(e) => setNuevoDoc({ ...nuevoDoc, cambios_descripcion: e.target.value })}
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setMostrarModal(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    {modoEdicion ? 'Guardar Cambios' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Ver: historial de versiones anteriores */}
        {mostrarModalVer && docSeleccionado && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  {docSeleccionado.codigo} — {docSeleccionado.titulo}
                </h3>
                <button onClick={() => setMostrarModalVer(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none">
                  &times;
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Estado actual</span>
                    <p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${ESTADO_STYLES[docSeleccionado.estado]}`}>
                        {ESTADO_LABEL[docSeleccionado.estado]}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Versión vigente</span>
                    <p className="text-slate-800 font-semibold">v{docSeleccionado.version_actual}</p>
                  </div>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <History size={16} /> Versiones Anteriores
                  </h4>
                  <div className="space-y-2">
                    {historial.versiones.length === 0 && (
                      <p className="text-sm text-slate-400">Sin versiones registradas.</p>
                    )}
                    {historial.versiones.map((v) => (
                      <div key={v.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Versión {v.numero_version}{' '}
                            {v.numero_version === docSeleccionado.version_actual && (
                              <span className="text-xs text-blue-600 font-normal">(vigente)</span>
                            )}
                          </p>
                          <p className="text-sm text-slate-600">{v.cambios_descripcion}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {v.creadoPor ? `${v.creadoPor.nombres} ${v.creadoPor.apellidos}` : '-'} ·{' '}
                            {v.creado_en ? new Date(v.creado_en).toLocaleString('es-PE') : '-'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${ESTADO_STYLES[v.estado] || 'bg-slate-100 text-slate-600'}`}>
                          {ESTADO_LABEL[v.estado] || v.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {docSeleccionado.contenido && (
                  <div>
                    <span className="text-sm text-slate-500 font-medium">Contenido vigente</span>
                    <div className="mt-1 p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap text-sm">
                      {docSeleccionado.contenido}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                <button onClick={() => setMostrarModalVer(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}