'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { GitBranch, Plus, Download, Search, Edit, Eye, EyeOff, LayoutDashboard, List, History, Upload, Tag, X, Layers, User, Hash, FileText, ListOrdered } from 'lucide-react';
import { swalError, swalSuccess, swalConfirm } from '@/lib/swal';
import { useAuth } from '@/context/AuthContext';
import ActividadesPanel from '@/components/procesos/ActividadesPanel';

const CLASIFICACIONES = [
  { value: 'estrategico', label: 'Estratégicos', color: 'border-l-blue-500 bg-blue-50', bg: 'bg-blue-100 text-blue-700' },
  { value: 'misional', label: 'Misionales', color: 'border-l-emerald-500 bg-emerald-50', bg: 'bg-emerald-100 text-emerald-700' },
  { value: 'soporte', label: 'Soporte', color: 'border-l-amber-500 bg-amber-50', bg: 'bg-amber-100 text-amber-700' },
];

export default function ProcesosPage() {
  const { usuario } = useAuth();
  const [vista, setVista] = useState('diagrama');
  const [macroprocesos, setMacroprocesos] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [mapaActual, setMapaActual] = useState({ version: 1, datos: { estrategicos: [], misionales: [], soporte: [], sin_clasificar: [] } });
  const [versiones, setVersiones] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalProceso, setMostrarModalProceso] = useState(false);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [mostrarModalVersion, setMostrarModalVersion] = useState(false);
  const [nuevoMacro, setNuevoMacro] = useState({ codigo: '', nombre: '', descripcion: '', tipo: '', clasificacion_mapa: '', responsable_id: '' });
  const [macroSeleccionado, setMacroSeleccionado] = useState(null);
  const [nuevoProceso, setNuevoProceso] = useState({ codigo: '', nombre: '', objetivo: '', alcance: '', macroproceso_id: '', responsable_id: '' });
  const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modoEdicionProceso, setModoEdicionProceso] = useState(false);
  const [cambiosDesc, setCambiosDesc] = useState('');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [mp, pr, us, mapa, vers] = await Promise.all([
        axios.get('/api/v1/macroprocesos'),
        axios.get('/api/v1/procesos'),
        axios.get('/api/v1/usuarios'),
        axios.get('/api/v1/mapa/actual'),
        axios.get('/api/v1/mapa/versiones'),
      ]);
      setMacroprocesos(mp.data);
      setProcesos(pr.data);
      setUsuarios(us.data);
      setMapaActual(mapa.data);
      setVersiones(vers.data);
    } catch (err) {
      const demoMacros = [
        { id: '1', codigo: 'MP-01', nombre: 'Direccionamiento Estratégico', tipo: 'estrategico', clasificacion_mapa: 'estrategico', estado: true, responsable: { nombres: 'Juan', apellidos: 'Pérez' } },
        { id: '2', codigo: 'MP-02', nombre: 'Formación Profesional', tipo: 'misional', clasificacion_mapa: 'misional', estado: true, responsable: { nombres: 'María', apellidos: 'Gómez' } },
        { id: '3', codigo: 'MP-03', nombre: 'Gestión Administrativa', tipo: 'apoyo', clasificacion_mapa: 'soporte', estado: true, responsable: { nombres: 'Carlos', apellidos: 'López' } },
        { id: '4', codigo: 'MP-04', nombre: 'Investigación y Desarrollo', tipo: 'misional', clasificacion_mapa: 'misional', estado: true, responsable: { nombres: 'Ana', apellidos: 'Martínez' } },
      ];
      setMacroprocesos(demoMacros);
      setProcesos([
        { id: '1', codigo: 'P-01', nombre: 'Planificación Curricular', macroproceso_id: '2', estado: 'activo', macroproceso: { nombre: 'Formación Profesional' }, responsable: { nombres: 'Juan', apellidos: 'Pérez' } },
        { id: '2', codigo: 'P-02', nombre: 'Gestión de Docencia', macroproceso_id: '2', estado: 'activo', macroproceso: { nombre: 'Formación Profesional' }, responsable: { nombres: 'María', apellidos: 'Gómez' } },
      ]);
      setMapaActual({
        version: 1,
        datos: {
          estrategicos: [demoMacros[0]],
          misionales: [demoMacros[1], demoMacros[3]],
          soporte: [demoMacros[2]],
          sin_clasificar: [],
        },
      });
      setVersiones([
        { id: 'v1', numero_version: 1, cambios_descripcion: 'Versión inicial del mapa de procesos', activa: true, creado_en: new Date().toISOString(), creadoPor: { nombres: 'Admin', apellidos: 'SGC' } },
      ]);
    }
  };

  const agruparPorClasificacion = (items) => {
    const grupos = { estrategicos: [], misionales: [], soporte: [], sin_clasificar: [] };
    items.forEach(m => {
      const c = m.clasificacion_mapa;
      if (c === 'estrategico') grupos.estrategicos.push(m);
      else if (c === 'misional') grupos.misionales.push(m);
      else if (c === 'soporte') grupos.soporte.push(m);
      else grupos.sin_clasificar.push(m);
    });
    return grupos;
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion && macroSeleccionado) {
        await axios.put(`/api/v1/macroprocesos/${macroSeleccionado.id}`, nuevoMacro);
        swalSuccess('Macroproceso actualizado');
      } else {
        await axios.post('/api/v1/macroprocesos', nuevoMacro);
        swalSuccess('Macroproceso registrado');
      }
      setMostrarModal(false);
      resetFormulario();
      cargarDatos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleEditar = (m) => {
    setMacroSeleccionado(m);
    setNuevoMacro({
      codigo: m.codigo,
      nombre: m.nombre,
      descripcion: m.descripcion || '',
      tipo: m.tipo || '',
      clasificacion_mapa: m.clasificacion_mapa || '',
      responsable_id: m.responsable_id?.toString() || '',
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const handleDesactivar = async (m) => {
    const confirmado = await swalConfirm('¿Desactivar este macroproceso?');
    if (confirmado) {
      try {
        await axios.patch(`/api/v1/macroprocesos/${m.id}/desactivar`);
        swalSuccess('Macroproceso desactivado');
        cargarDatos();
      } catch (err) { swalError(err); }
    }
  };

  const handlePublicarVersion = async () => {
    if (!cambiosDesc.trim()) {
      swalError('Debes describir los cambios de esta versión');
      return;
    }
    try {
      await axios.post('/api/v1/mapa/nueva-version', { cambios_descripcion: cambiosDesc });
      swalSuccess('Nueva versión publicada');
      setMostrarModalVersion(false);
      setCambiosDesc('');
      cargarDatos();
    } catch (err) { swalError(err); }
  };

  const handleGuardarProceso = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicionProceso && procesoSeleccionado) {
        await axios.put(`/api/v1/procesos/${procesoSeleccionado.id}`, nuevoProceso);
        swalSuccess('Proceso actualizado');
      } else {
        await axios.post('/api/v1/procesos', nuevoProceso);
        swalSuccess('Proceso registrado');
      }
      setMostrarModalProceso(false);
      resetFormularioProceso();
      cargarDatos();
    } catch (err) {
      swalError(err);
    }
  };

  const handleEditarProceso = (p) => {
    setProcesoSeleccionado(p);
    setNuevoProceso({
      codigo: p.codigo,
      nombre: p.nombre,
      objetivo: p.objetivo || '',
      alcance: p.alcance || '',
      macroproceso_id: p.macroproceso_id || '',
      responsable_id: p.responsable_id || '',
    });
    setModoEdicionProceso(true);
    setMostrarModalProceso(true);
  };

  const handleDesactivarProceso = async (p) => {
    const confirmado = await swalConfirm('¿Desactivar este proceso?');
    if (confirmado) {
      try {
        await axios.patch(`/api/v1/procesos/${p.id}/desactivar`);
        swalSuccess('Proceso desactivado');
        cargarDatos();
      } catch (err) { swalError(err); }
    }
  };

  const resetFormulario = () => {
    setNuevoMacro({ codigo: '', nombre: '', descripcion: '', tipo: '', clasificacion_mapa: '', responsable_id: '' });
    setMacroSeleccionado(null);
    setModoEdicion(false);
  };

  const resetFormularioProceso = () => {
    setNuevoProceso({ codigo: '', nombre: '', objetivo: '', alcance: '', macroproceso_id: '', responsable_id: '' });
    setProcesoSeleccionado(null);
    setModoEdicionProceso(false);
  };

  const abrirModalNuevo = () => { resetFormulario(); setMostrarModal(true); };
  const abrirModalNuevoProceso = () => { resetFormularioProceso(); setMostrarModalProceso(true); };
  const abrirModalVersion = () => { setCambiosDesc(''); setMostrarModalVersion(true); };

  const descargarReporte = async () => {
    try {
      const response = await axios.get('/api/v1/procesos/reporte', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mapa-procesos.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) { swalError(err); }
  };

  const clasificacionInfo = (value) => CLASIFICACIONES.find(c => c.value === value) || { label: 'Sin clasificar', color: 'border-l-slate-400 bg-slate-50', bg: 'bg-slate-200 text-slate-600' };

  const renderDiagrama = () => {
    const grupos = mapaActual.datos || { estrategicos: [], misionales: [], soporte: [], sin_clasificar: [] };
    const orden = [
      { key: 'estrategicos', ...CLASIFICACIONES[0] },
      { key: 'misionales', ...CLASIFICACIONES[1] },
      { key: 'soporte', ...CLASIFICACIONES[2] },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Tag className="text-blue-600" size={20} />
          <span className="text-sm text-slate-500">
            Versión actual: <strong className="text-slate-800">v{mapaActual.version}</strong>
          </span>
          {mapaActual.creado_en && (
            <span className="text-xs text-slate-400">
              · Publicada el {new Date(mapaActual.creado_en).toLocaleDateString('es-PE', { dateStyle: 'long' })}
            </span>
          )}
        </div>

        {orden.map(({ key, label, color, bg }) => {
          const items = grupos[key] || [];
          return (
            <div key={key} className={`border-l-4 rounded-xl border ${color} shadow-sm overflow-hidden`}>
              <div className={`flex items-center justify-between px-5 py-3 ${bg}`}>
                <h3 className="font-bold text-slate-800">{label}</h3>
                <span className="text-xs font-medium text-slate-500">{items.length} macroproceso(s)</span>
              </div>
              {items.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">
                  No hay macroprocesos clasificados como {label.toLowerCase()}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {items.map(m => (
                    <div key={m.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{m.codigo}</span>
                          <h4 className="font-semibold text-slate-800 truncate">{m.nombre}</h4>
                        </div>
                        {m.descripcion && <p className="text-xs text-slate-500 mt-1 truncate">{m.descripcion}</p>}
                        <div className="flex items-center gap-3 mt-1.5">
                          {m.responsable && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <User size={11} /> {m.responsable.nombres} {m.responsable.apellidos}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {['admin', 'gestor_calidad'].includes(usuario?.rol) && (
                          <button onClick={() => handleEditar(m)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Editar"><Edit size={14} /></button>
                        )}
                        {m.estado !== false && ['admin', 'gestor_calidad'].includes(usuario?.rol) && (
                          <button onClick={() => handleDesactivar(m)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Desactivar"><EyeOff size={14} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {grupos.sin_clasificar && grupos.sin_clasificar.length > 0 && (
          <div className="border-l-4 border-l-slate-400 rounded-xl border bg-slate-50 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-slate-100">
              <h3 className="font-bold text-slate-600">Sin clasificar</h3>
            </div>
            <div className="divide-y divide-slate-200">
              {grupos.sin_clasificar.map(m => (
                <div key={m.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-100/50">
                  <span className="text-sm text-slate-600">{m.codigo} - {m.nombre}</span>
                  {['admin', 'gestor_calidad'].includes(usuario?.rol) && (
                    <button onClick={() => handleEditar(m)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"><Edit size={14} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const filtrados = procesos.filter(p =>
    p.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><GitBranch /> Mapa de Procesos</h2>
          <div className="flex gap-2">
            <button onClick={descargarReporte} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm"><Download size={16} /> PDF</button>
            {vista === 'diagrama' && ['admin', 'gestor_calidad'].includes(usuario?.rol) && (
              <button onClick={abrirModalVersion} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"><Upload size={16} /> Publicar Versión</button>
            )}
            {vista === 'diagrama' && ['admin', 'gestor_calidad'].includes(usuario?.rol) && (
              <button onClick={abrirModalNuevo} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Plus size={16} /> Nuevo Macroproceso</button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setVista('diagrama')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'diagrama' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <LayoutDashboard size={16} /> Diagrama
          </button>
          <button onClick={() => setVista('macros')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'macros' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <Layers size={16} /> Macroprocesos
          </button>
          <button onClick={() => setVista('procesos')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'procesos' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <List size={16} /> Procesos
          </button>
          <button onClick={() => setMostrarModalVer(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50">
            <History size={16} /> Versiones
          </button>
          <button onClick={() => setVista('actividades')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${vista === 'actividades' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <ListOrdered size={16} /> Actividades
          </button>
        </div>

        {vista === 'diagrama' && renderDiagrama()}

        {vista === 'macros' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" placeholder="Buscar macroproceso..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                  value={filtro} onChange={(e) => setFiltro(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Clasificación</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Responsable</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                    {['admin', 'gestor_calidad'].includes(usuario?.rol) && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {macroprocesos.filter(m => m.nombre?.toLowerCase().includes(filtro.toLowerCase()) || m.codigo?.toLowerCase().includes(filtro.toLowerCase())).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{m.codigo}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.nombre}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${clasificacionInfo(m.clasificacion_mapa).bg}`}>
                          {clasificacionInfo(m.clasificacion_mapa).label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.responsable?.nombres} {m.responsable?.apellidos || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${m.estado !== false ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'}`}>
                          {m.estado !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      {['admin', 'gestor_calidad'].includes(usuario?.rol) && (
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleEditar(m)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Editar"><Edit size={16} /></button>
                            {m.estado !== false && (
                              <button onClick={() => handleDesactivar(m)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Desactivar"><EyeOff size={16} /></button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {vista === 'procesos' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input type="text" placeholder="Buscar proceso por código o nombre..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                  value={filtro} onChange={(e) => setFiltro(e.target.value)} />
              </div>
              {['admin', 'gestor_calidad'].includes(usuario?.rol) && (
                <button onClick={abrirModalNuevoProceso} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shrink-0">
                  <Plus size={16} /> Nuevo Proceso
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Macroproceso</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Responsable</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Estado</th>
                    {['admin', 'gestor_calidad'].includes(usuario?.rol) && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtrados.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{p.codigo}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{p.nombre}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{p.macroproceso?.nombre || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{p.responsable?.nombres} {p.responsable?.apellidos || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${p.estado === 'activo' ? 'bg-green-100 text-green-700' : p.estado === 'inactivo' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-700'}`}>
                          {p.estado}
                        </span>
                      </td>
                      {['admin', 'gestor_calidad'].includes(usuario?.rol) && (
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleEditarProceso(p)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Editar">
                              <Edit size={16} />
                            </button>
                            {p.estado === 'activo' && (
                              <button onClick={() => handleDesactivarProceso(p)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Desactivar">
                                <EyeOff size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {vista === 'actividades' && (
          <ActividadesPanel
            procesos={procesos}
            usuarios={usuarios}
            puedeEditar={['admin', 'gestor_calidad'].includes(usuario?.rol)}
          />
        )}

        {/* Modal Crear/Editar Macroproceso */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <Layers className="text-blue-600" size={20} />
                  {modoEdicion ? 'Editar Macroproceso' : 'Nuevo Macroproceso'}
                </h3>
                <button onClick={() => setMostrarModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none">&times;</button>
              </div>
              <form onSubmit={handleGuardar} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                    <input type="text" placeholder="Ej. MP-001" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      value={nuevoMacro.codigo} onChange={(e) => setNuevoMacro({ ...nuevoMacro, codigo: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Clasificación en el Mapa</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                      value={nuevoMacro.clasificacion_mapa} onChange={(e) => setNuevoMacro({ ...nuevoMacro, clasificacion_mapa: e.target.value })}>
                      <option value="">Sin clasificar</option>
                      {CLASIFICACIONES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input type="text" placeholder="Nombre del macroproceso" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    value={nuevoMacro.nombre} onChange={(e) => setNuevoMacro({ ...nuevoMacro, nombre: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    placeholder="Descripción..." value={nuevoMacro.descripcion} onChange={(e) => setNuevoMacro({ ...nuevoMacro, descripcion: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                    value={nuevoMacro.responsable_id} onChange={(e) => setNuevoMacro({ ...nuevoMacro, responsable_id: e.target.value })}>
                    <option value="">Sin responsable</option>
                    {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>)}
                  </select>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setMostrarModal(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{modoEdicion ? 'Guardar Cambios' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Versiones */}
        {mostrarModalVer && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <History className="text-blue-600" size={20} /> Historial de Versiones
                </h3>
                <button onClick={() => setMostrarModalVer(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none">&times;</button>
              </div>
              <div className="p-6 space-y-3 overflow-y-auto">
                {versiones.length === 0 && <p className="text-sm text-slate-400 text-center py-6">No hay versiones registradas.</p>}
                {versiones.map((v) => (
                  <div key={v.id} className={`border rounded-lg p-4 flex justify-between items-start ${v.activa ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200'}`}>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        Versión {v.numero_version}
                        {v.activa && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">ACTIVA</span>}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{v.cambios_descripcion}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {v.creadoPor ? `${v.creadoPor.nombres} ${v.creadoPor.apellidos}` : '-'} · {v.creado_en ? new Date(v.creado_en).toLocaleString('es-PE') : '-'}
                      </p>
                    </div>
                    <Tag className="text-slate-400" size={16} />
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                <button onClick={() => setMostrarModalVer(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Publicar Versión */}
        {mostrarModalVersion && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <Upload className="text-emerald-600" size={20} /> Publicar Nueva Versión
                </h3>
                <button onClick={() => setMostrarModalVersion(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none">&times;</button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500">Se creará un snapshot del estado actual del mapa de procesos como nueva versión.</p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción de cambios</label>
                  <textarea rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    placeholder="Ej. Se reclasificó el macroproceso MP-03 a Soporte" value={cambiosDesc} onChange={(e) => setCambiosDesc(e.target.value)} />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={() => setMostrarModalVersion(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">Cancelar</button>
                  <button onClick={handlePublicarVersion} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Publicar Versión</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Crear/Editar Proceso */}
        {mostrarModalProceso && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                  <GitBranch className="text-blue-600" size={20} />
                  {modoEdicionProceso ? 'Editar Proceso' : 'Nuevo Proceso'}
                </h3>
                <button onClick={() => setMostrarModalProceso(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-semibold focus:outline-none">&times;</button>
              </div>
              <form onSubmit={handleGuardarProceso} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                    <input type="text" placeholder="Ej. PRO-001" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                      value={nuevoProceso.codigo} onChange={(e) => setNuevoProceso({ ...nuevoProceso, codigo: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Macroproceso</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                      value={nuevoProceso.macroproceso_id} onChange={(e) => setNuevoProceso({ ...nuevoProceso, macroproceso_id: e.target.value })}>
                      <option value="">Sin macroproceso</option>
                      {macroprocesos.filter(m => m.estado !== false).map((m) => <option key={m.id} value={m.id}>{m.codigo} - {m.nombre}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input type="text" placeholder="Nombre del proceso" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    value={nuevoProceso.nombre} onChange={(e) => setNuevoProceso({ ...nuevoProceso, nombre: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo</label>
                  <textarea rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    placeholder="Objetivo del proceso..." value={nuevoProceso.objetivo} onChange={(e) => setNuevoProceso({ ...nuevoProceso, objetivo: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Alcance</label>
                  <textarea rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                    placeholder="Alcance del proceso..." value={nuevoProceso.alcance} onChange={(e) => setNuevoProceso({ ...nuevoProceso, alcance: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                    value={nuevoProceso.responsable_id} onChange={(e) => setNuevoProceso({ ...nuevoProceso, responsable_id: e.target.value })}>
                    <option value="">Sin responsable</option>
                    {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>)}
                  </select>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setMostrarModalProceso(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{modoEdicionProceso ? 'Guardar Cambios' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
