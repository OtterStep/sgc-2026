'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, Plus, Download, TrendingUp, Activity, X, Edit3, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Swal from 'sweetalert2';

const TIPO_LABEL = { eficacia: 'Eficacia', eficiencia: 'Eficiencia', impacto: 'Impacto', satisfaccion: 'Satisfacción' };
const FRECUENCIA_LABEL = { diaria: 'Diaria', semanal: 'Semanal', mensual: 'Mensual', bimestral: 'Bimestral', trimestral: 'Trimestral', semestral: 'Semestral', anual: 'Anual' };
const EMPTY_IND = { codigo: '', nombre: '', descripcion: '', tipo: 'eficacia', formula_calculo: '', unidad_medida: '%', proceso_id: '', meta: '', frecuencia_medicion: 'mensual' };
const EMPTY_MED = { periodo: '', fecha_medicion: new Date().toISOString().split('T')[0], valor_real: '', valor_esperado: '', analisis_tendencia: '' };

const today = () => new Date().toISOString().split('T')[0];
const firstDay = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };

export default function IndicadoresPage() {
  const { usuario } = useAuth();
  const esGestion = ['admin', 'gestor_calidad'].includes(usuario?.rol);

  const [indicadores, setIndicadores] = useState([]);
  const [procesos, setProcesos] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [indicadorSel, setIndicadorSel] = useState(null);
  const [mediciones, setMediciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtro reporte
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [filtroPeriodoId, setFiltroPeriodoId] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState(firstDay());
  const [filtroFechaFin, setFiltroFechaFin] = useState(today());

  // Form indicador
  const [mostrarFormInd, setMostrarFormInd] = useState(false);
  const [editandoInd, setEditandoInd] = useState(null);
  const [formInd, setFormInd] = useState({ ...EMPTY_IND });

  // Modal medición
  const [mostrarModalMed, setMostrarModalMed] = useState(false);
  const [editandoMed, setEditandoMed] = useState(null);
  const [formMed, setFormMed] = useState({ ...EMPTY_MED });

  useEffect(() => { if (usuario) cargarDatos(); }, [usuario]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [indRes, procRes, perRes] = await Promise.all([
        axios.get('/api/v1/indicadores'),
        axios.get('/api/v1/procesos'),
        axios.get('/api/v1/periodos-academicos'),
      ]);
      setIndicadores(indRes.data);
      setProcesos(procRes.data);
      setPeriodos(perRes.data);
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  const cargarMediciones = async (ind) => {
    setIndicadorSel(ind);
    try {
      const { data } = await axios.get(`/api/v1/indicadores/${ind.id}/mediciones`);
      setMediciones(data);
    } catch { setMediciones([]); }
  };

  // Indicador CRUD
  const abrirNuevoInd = () => { setEditandoInd(null); setFormInd({ ...EMPTY_IND }); setMostrarFormInd(true); };
  const abrirEditarInd = (ind) => { setEditandoInd(ind); setFormInd({ ...ind }); setMostrarFormInd(true); };

  const guardarIndicador = async (e) => {
    e.preventDefault();
    try {
      if (editandoInd) {
        await axios.put(`/api/v1/indicadores/${editandoInd.id}`, formInd);
        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Indicador actualizado', timer: 1500, showConfirmButton: false });
      } else {
        await axios.post('/api/v1/indicadores', formInd);
        Swal.fire({ icon: 'success', title: 'Creado', text: 'Indicador creado', timer: 1500, showConfirmButton: false });
      }
      setMostrarFormInd(false); setEditandoInd(null); cargarDatos();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Error al guardar', confirmButtonColor: '#1e40af' });
    }
  };

  const eliminarIndicador = async (ind) => {
    const confirm = await Swal.fire({ icon: 'question', title: '¿Eliminar indicador?', text: `Se eliminarán también todas sus mediciones. ¿Continuar?`, showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(`/api/v1/indicadores/${ind.id}`);
      Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Indicador eliminado', timer: 1500, showConfirmButton: false });
      if (indicadorSel?.id === ind.id) { setIndicadorSel(null); setMediciones([]); }
      cargarDatos();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Error al eliminar', confirmButtonColor: '#1e40af' });
    }
  };

  // Medición CRUD
  const abrirNuevaMed = () => { setEditandoMed(null); setFormMed({ ...EMPTY_MED, fecha_medicion: new Date().toISOString().split('T')[0] }); setMostrarModalMed(true); };
  const abrirEditarMed = (med) => { setEditandoMed(med); setFormMed({ periodo: med.periodo, fecha_medicion: med.fecha_medicion || '', valor_real: med.valor_real, valor_esperado: med.valor_esperado || '', analisis_tendencia: med.analisis_tendencia || '' }); setMostrarModalMed(true); };

  const guardarMedicion = async (e) => {
    e.preventDefault();
    try {
      const payload = { indicador_id: indicadorSel.id, ...formMed };
      if (editandoMed) {
        await axios.put(`/api/v1/mediciones/${editandoMed.id}`, payload);
        Swal.fire({ icon: 'success', title: 'Actualizada', text: 'Medición actualizada', timer: 1500, showConfirmButton: false });
      } else {
        await axios.post('/api/v1/mediciones', payload);
        Swal.fire({ icon: 'success', title: 'Registrada', text: 'Medición registrada', timer: 1500, showConfirmButton: false });
      }
      setMostrarModalMed(false); setEditandoMed(null); cargarMediciones(indicadorSel);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Error al guardar medición', confirmButtonColor: '#1e40af' });
    }
  };

  const eliminarMedicion = async (med) => {
    const confirm = await Swal.fire({ icon: 'question', title: '¿Eliminar medición?', text: `Periodo: ${med.periodo}`, showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(`/api/v1/mediciones/${med.id}`);
      Swal.fire({ icon: 'success', title: 'Eliminada', text: 'Medición eliminada', timer: 1500, showConfirmButton: false });
      cargarMediciones(indicadorSel);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Error al eliminar', confirmButtonColor: '#1e40af' });
    }
  };

  const descargarPDF = async () => {
    try {
      const params = {};
      if (tipoFiltro === 'periodo' && filtroPeriodoId) { params.tipo_filtro = 'periodo'; params.periodo_id = filtroPeriodoId; }
      else if (tipoFiltro === 'fecha' && filtroFechaInicio && filtroFechaFin) { params.tipo_filtro = 'fecha'; params.fecha_inicio = filtroFechaInicio; params.fecha_fin = filtroFechaFin; }
      const res = await axios.get('/api/v1/indicadores/reporte', { params, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'indicadores.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Error al descargar reporte', confirmButtonColor: '#1e40af' }); }
  };

  if (cargando) return (
    <div className="flex min-h-screen bg-slate-50"><Sidebar /><main className="flex-1 p-8 flex items-center justify-center"><p className="text-slate-500">Cargando...</p></main></div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BarChart3 /> Indicadores de Gestión</h2>
            {/* Filtro de reporte */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button onClick={() => setTipoFiltro('todos')} className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${tipoFiltro === 'todos' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Todos</button>
                <button onClick={() => setTipoFiltro('periodo')} className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${tipoFiltro === 'periodo' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Por Periodo</button>
                <button onClick={() => setTipoFiltro('fecha')} className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${tipoFiltro === 'fecha' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>Por Fechas</button>
              </div>
              {tipoFiltro === 'periodo' && (
                <select className="text-xs border border-slate-300 rounded-lg px-3 py-1.5" value={filtroPeriodoId} onChange={e => setFiltroPeriodoId(e.target.value)}>
                  <option value="">Seleccionar periodo</option>
                  {periodos.map(p => <option key={p.id} value={p.id}>{p.codigo} — {p.nombre}</option>)}
                </select>
              )}
              {tipoFiltro === 'fecha' && (
                <>
                  <input type="date" className="text-xs border border-slate-300 rounded-lg px-3 py-1.5" value={filtroFechaInicio} onChange={e => setFiltroFechaInicio(e.target.value)} />
                  <span className="text-xs text-slate-400">a</span>
                  <input type="date" className="text-xs border border-slate-300 rounded-lg px-3 py-1.5" value={filtroFechaFin} onChange={e => setFiltroFechaFin(e.target.value)} />
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={descargarPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"><Download size={18} /> Reporte PDF</button>
            {esGestion && <button onClick={abrirNuevoInd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={18} /> Nuevo Indicador</button>}
          </div>
        </div>

        {/* Formulario indicador */}
        {mostrarFormInd && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{editandoInd ? 'Editar Indicador' : 'Nuevo Indicador'}</h3>
              <button onClick={() => { setMostrarFormInd(false); setEditandoInd(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={guardarIndicador} className="grid grid-cols-3 gap-4">
              <input placeholder="Código *" className="px-3 py-2 border rounded-lg" value={formInd.codigo} onChange={e => setFormInd({ ...formInd, codigo: e.target.value })} required />
              <input placeholder="Nombre *" className="px-3 py-2 border rounded-lg" value={formInd.nombre} onChange={e => setFormInd({ ...formInd, nombre: e.target.value })} required />
              <select className="px-3 py-2 border rounded-lg" value={formInd.tipo} onChange={e => setFormInd({ ...formInd, tipo: e.target.value })}>
                {Object.entries(TIPO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <textarea placeholder="Fórmula de cálculo" className="px-3 py-2 border rounded-lg col-span-2" rows={2} value={formInd.formula_calculo} onChange={e => setFormInd({ ...formInd, formula_calculo: e.target.value })} />
              <input placeholder="Unidad de medida" className="px-3 py-2 border rounded-lg" value={formInd.unidad_medida} onChange={e => setFormInd({ ...formInd, unidad_medida: e.target.value })} />
              <select className="px-3 py-2 border rounded-lg" value={formInd.proceso_id} onChange={e => setFormInd({ ...formInd, proceso_id: e.target.value })}>
                <option value="">Sin proceso</option>
                {procesos.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Meta" className="px-3 py-2 border rounded-lg" value={formInd.meta} onChange={e => setFormInd({ ...formInd, meta: e.target.value })} />
              <select className="px-3 py-2 border rounded-lg" value={formInd.frecuencia_medicion} onChange={e => setFormInd({ ...formInd, frecuencia_medicion: e.target.value })}>
                {Object.entries(FRECUENCIA_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <textarea placeholder="Descripción" className="px-3 py-2 border rounded-lg col-span-3" rows={2} value={formInd.descripcion} onChange={e => setFormInd({ ...formInd, descripcion: e.target.value })} />
              <div className="col-span-3 flex justify-end gap-3">
                <button type="button" onClick={() => { setMostrarFormInd(false); setEditandoInd(null); }} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editandoInd ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Grid indicadores */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {indicadores.map(ind => (
            <div key={ind.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
              <div onClick={() => cargarMediciones(ind)} className={`p-6 cursor-pointer ${indicadorSel?.id === ind.id ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-mono text-slate-500">{ind.codigo}</p>
                  <TrendingUp size={18} className="text-blue-600" />
                </div>
                <p className="font-semibold text-slate-900">{ind.nombre}</p>
                {ind.proceso && <p className="text-xs text-slate-400 mt-1">{ind.proceso.nombre}</p>}
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500">Meta</p>
                    <p className="text-lg font-bold text-slate-800">{ind.meta}{ind.unidad_medida || ''}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 capitalize">{TIPO_LABEL[ind.tipo] || ind.tipo}</span>
                    <p className="text-xs text-slate-400 mt-1 capitalize">{FRECUENCIA_LABEL[ind.frecuencia_medicion] || ind.frecuencia_medicion}</p>
                  </div>
                </div>
              </div>
              {esGestion && (
                <div className="px-6 pb-4 flex gap-2 border-t border-slate-100 pt-3">
                  <button onClick={() => abrirEditarInd(ind)} className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"><Edit3 size={13} /> Editar</button>
                  <button onClick={() => eliminarIndicador(ind)} className="text-red-600 hover:text-red-800 text-xs font-medium flex items-center gap-1"><Trash2 size={13} /> Eliminar</button>
                </div>
              )}
            </div>
          ))}
          {indicadores.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-400">
              <Activity size={48} className="mx-auto mb-3 opacity-50" />
              <p>No hay indicadores registrados.</p>
              {esGestion && <p className="text-sm mt-1">Crea el primer indicador usando el botón "Nuevo Indicador".</p>}
            </div>
          )}
        </div>

        {/* Panel mediciones */}
        {indicadorSel && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-lg">{indicadorSel.codigo} — {indicadorSel.nombre}</h3>
                <p className="text-sm text-slate-500">Meta: {indicadorSel.meta}{indicadorSel.unidad_medida || ''}</p>
              </div>
              {esGestion && <button onClick={abrirNuevaMed} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"><Plus size={16} /> Registrar Medición</button>}
            </div>

            {mediciones.length > 0 && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={mediciones}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis domain={[0, 'auto']} />
                  <Tooltip />
                  <ReferenceLine y={Number(indicadorSel.meta)} stroke="red" strokeDasharray="3 3" label={{ value: 'Meta', position: 'right', fill: 'red', fontSize: 12 }} />
                  <Bar dataKey="valor_real" fill="#003366" name="Valor Real" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cumplimiento" fill="#4d94ff" name="% Cumplimiento" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-600 mb-3">Histórico de Mediciones</h4>
              {mediciones.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Periodo</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Valor Real</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Valor Esperado</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">% Cumplimiento</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Detalles</th>
                        {esGestion && <th className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Acciones</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {mediciones.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-700">{m.fecha_medicion ? new Date(m.fecha_medicion).toLocaleDateString('es-PE') : '-'}</td>
                          <td className="px-4 py-3 font-medium text-slate-700">{m.periodo}</td>
                          <td className="px-4 py-3 text-right">{Number(m.valor_real).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">{m.valor_esperado ? Number(m.valor_esperado).toFixed(2) : '-'}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${Number(m.cumplimiento) >= 100 ? 'bg-green-100 text-green-700' : Number(m.cumplimiento) >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                              {Number(m.cumplimiento).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{m.analisis_tendencia || '-'}</td>
                          {esGestion && (
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => abrirEditarMed(m)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Editar</button>
                                <button onClick={() => eliminarMedicion(m)} className="text-red-600 hover:text-red-800 text-xs font-medium">Eliminar</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-6">No hay mediciones registradas. Selecciona otro indicador o registra la primera medición.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal medición */}
      {mostrarModalMed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-lg">{editandoMed ? 'Editar Medición' : 'Registrar Medición'}</h3>
                <p className="text-sm text-slate-500">{indicadorSel?.codigo} — {indicadorSel?.nombre}</p>
              </div>
              <button onClick={() => { setMostrarModalMed(false); setEditandoMed(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={guardarMedicion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Medición</label>
                  <input type="date" className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15" value={formMed.fecha_medicion} onChange={e => setFormMed({ ...formMed, fecha_medicion: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Periodo Académico</label>
                  <select className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15" value={formMed.periodo} onChange={e => setFormMed({ ...formMed, periodo: e.target.value })} required>
                    <option value="">Seleccionar periodo</option>
                    {periodos.map(p => <option key={p.id} value={p.codigo}>{p.codigo} — {p.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Real *</label>
                  <input type="number" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15" value={formMed.valor_real} onChange={e => setFormMed({ ...formMed, valor_real: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Esperado *</label>
                  <input type="number" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15" value={formMed.valor_esperado} onChange={e => setFormMed({ ...formMed, valor_esperado: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Detalles / Observaciones <span className="text-slate-400 font-normal">(opcional)</span></label>
                <textarea rows={2} placeholder="Comentarios, análisis de tendencia, observaciones..." className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15" value={formMed.analisis_tendencia} onChange={e => setFormMed({ ...formMed, analisis_tendencia: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setMostrarModalMed(false); setEditandoMed(null); }} className="px-4 py-2 text-slate-600 hover:text-slate-800">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{editandoMed ? 'Actualizar' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
