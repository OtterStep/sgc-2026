// ============================================================
// ActividadesPanel.jsx
// Componente de panel maestro-detalle para visualizar y
// gestionar las actividades de un proceso seleccionado.
//
// Estilo "Classroom moderno": ligero, amigable, con enfoque
// en usabilidad y jerarquía visual clara.
// ============================================================
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ListOrdered, Plus, User, ArrowRightCircle, ArrowLeftCircle,
  Gauge, X, FileSignature, Hash, AlignLeft,
} from 'lucide-react';
import { swalError, swalSuccess } from '@/lib/swal';

// ─────────────────────────────────────────────
// FORMULARIO: AGREGAR ACTIVIDAD
// ─────────────────────────────────────────────
function FormActividad({ procesoId, usuarios, siguienteSecuencia, onClose, onCreated }) {
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    secuencia: siguienteSecuencia,
    responsable_id: '',
    entradas: '',
    salidas: '',
    indicadores: '',
  });
  const [guardando, setGuardando] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await axios.post('/api/v1/actividades', { ...form, proceso_id: procesoId });
      swalSuccess('Actividad registrada correctamente');
      onCreated();
      onClose();
    } catch (err) {
      swalError(err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
              <FileSignature size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nueva Actividad</h3>
              <p className="text-sm text-gray-500">Registro secuencial del proceso</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Código *</label>
              <input required value={form.codigo} onChange={(e) => set('codigo', e.target.value)}
                placeholder="ACT-01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Secuencia *</label>
              <input required type="number" min="1" value={form.secuencia}
                onChange={(e) => set('secuencia', parseInt(e.target.value, 10) || '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la actividad *</label>
            <input required value={form.nombre} onChange={(e) => set('nombre', e.target.value)}
              placeholder="Ej. Revisión de matrícula"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea rows={2} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)}
              placeholder="Detalle de lo que comprende la actividad"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Responsable</label>
            <select value={form.responsable_id} onChange={(e) => set('responsable_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow">
              <option value="">Sin asignar</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>
              ))}
            </select>
          </div>

          {/* Entradas / Salidas */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <ArrowRightCircle size={14} className="text-green-600" /> Entradas
              </label>
              <textarea rows={3} value={form.entradas} onChange={(e) => set('entradas', e.target.value)}
                placeholder="Insumos requeridos"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <ArrowLeftCircle size={14} className="text-amber-600" /> Salidas
              </label>
              <textarea rows={3} value={form.salidas} onChange={(e) => set('salidas', e.target.value)}
                placeholder="Resultados generados"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Gauge size={14} className="text-blue-600" /> Indicadores asociados
            </label>
            <textarea rows={2} value={form.indicadores} onChange={(e) => set('indicadores', e.target.value)}
              placeholder="Ej. % de matrículas procesadas a tiempo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" />
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={onClose} type="button"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={guardando} type="button"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {guardando ? 'Guardando…' : 'Registrar Actividad'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TARJETA DE ACTIVIDAD (panel derecho)
// ─────────────────────────────────────────────
function TarjetaActividad({ actividad, index }) {
  return (
    <div className="relative pl-12 pb-6 group">
      {/* Línea de tiempo vertical */}
      <div className="absolute left-[15px] top-9 bottom-0 w-px bg-gray-200 group-last:hidden" />
      {/* Número de secuencia */}
      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-blue-600 border-2 border-blue-200 flex items-center justify-center shadow-sm">
        <span className="text-xs font-semibold text-white">{actividad.secuencia}</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Cabecera */}
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100 flex items-start justify-between">
          <div>
            <span className="text-xs font-mono text-blue-600 font-medium">{actividad.codigo}</span>
            <h4 className="font-semibold text-gray-900 text-base leading-snug mt-0.5">
              {actividad.nombre}
            </h4>
          </div>
          {actividad.responsable && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-200 shrink-0 ml-3">
              <User size={12} className="text-gray-400" />
              {actividad.responsable.nombres} {actividad.responsable.apellidos}
            </div>
          )}
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-3">
          {actividad.descripcion && (
            <p className="text-sm text-gray-600 leading-relaxed">{actividad.descripcion}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-green-700 mb-1">
                <ArrowRightCircle size={12} /> Entradas
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{actividad.entradas || '—'}</p>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
                <ArrowLeftCircle size={12} /> Salidas
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{actividad.salidas || '—'}</p>
            </div>
          </div>

          {actividad.indicadores && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-1">
                <Gauge size={12} /> Indicadores asociados
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{actividad.indicadores}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PANEL PRINCIPAL: LISTA DE PROCESOS + DETALLE
// ─────────────────────────────────────────────
export default function ActividadesPanel({ procesos, usuarios, puedeEditar }) {
  const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [filtro, setFiltro] = useState('');

  const seleccionarProceso = async (proceso) => {
    setProcesoSeleccionado(proceso);
    setCargando(true);
    try {
      const { data } = await axios.get(`/api/v1/procesos/${proceso.id}/actividades`);
      setActividades(data);
    } catch (err) {
      setActividades([]);
      swalError(err);
    } finally {
      setCargando(false);
    }
  };

  const recargarActividades = () => {
    if (procesoSeleccionado) seleccionarProceso(procesoSeleccionado);
  };

  const siguienteSecuencia = actividades.length > 0
    ? Math.max(...actividades.map((a) => a.secuencia)) + 1
    : 1;

  const procesosFiltrados = procesos.filter((p) =>
    p.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="grid grid-cols-12 gap-0 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-sm" style={{ minHeight: '640px' }}>

      {/* ───────── PANEL IZQUIERDO: LISTA DE PROCESOS ───────── */}
      <div className="col-span-4 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <ListOrdered size={18} className="text-blue-600" /> Directorio de Procesos
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Seleccione un proceso</p>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="Buscar proceso…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {procesosFiltrados.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8 px-4">No se encontraron procesos.</p>
          )}
          {procesosFiltrados.map((p) => {
            const activo = procesoSeleccionado?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => seleccionarProceso(p)}
                className={`w-full text-left px-5 py-3.5 border-b border-gray-100 transition-colors ${
                  activo ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                <p className={`text-xs font-mono font-medium ${activo ? 'text-blue-600' : 'text-gray-500'}`}>
                  {p.codigo}
                </p>
                <p className={`text-sm font-medium mt-0.5 ${activo ? 'text-gray-900' : 'text-gray-700'}`}>
                  {p.nombre}
                </p>
                <p className="text-xs text-gray-400 mt-1">{p.macroproceso?.nombre || 'Sin macroproceso'}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────── PANEL DERECHO: DETALLE DE ACTIVIDADES ───────── */}
      <div className="col-span-8 bg-gray-50 flex flex-col">
        {!procesoSeleccionado ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mb-4">
              <AlignLeft size={28} className="text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Seleccione un proceso</h4>
            <p className="text-sm text-gray-500 mt-1.5 max-w-xs">
              Elija un proceso del directorio para consultar su secuencia de actividades, responsables e indicadores.
            </p>
          </div>
        ) : (
          <>
            {/* Cabecera detalle */}
            <div className="px-6 py-5 bg-white border-b border-gray-200 flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-blue-600 font-medium">{procesoSeleccionado.codigo}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">{procesoSeleccionado.nombre}</h3>
                {procesoSeleccionado.objetivo && (
                  <p className="text-sm text-gray-500 mt-1.5 max-w-xl leading-relaxed">{procesoSeleccionado.objetivo}</p>
                )}
              </div>
              {puedeEditar && (
                <button
                  onClick={() => setMostrarForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0"
                >
                  <Plus size={16} /> Agregar Actividad
                </button>
              )}
            </div>

            {/* Lista de actividades */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {cargando && (
                <p className="text-sm text-gray-500 text-center py-10">Cargando actividades…</p>
              )}
              {!cargando && actividades.length === 0 && (
                <div className="text-center py-14">
                  <p className="text-sm text-gray-500">Este proceso aún no tiene actividades registradas.</p>
                  {puedeEditar && (
                    <button onClick={() => setMostrarForm(true)} className="mt-3 text-sm text-blue-600 hover:underline font-medium">
                      Registrar la primera actividad
                    </button>
                  )}
                </div>
              )}
              {!cargando && actividades.length > 0 && (
                <div>
                  {actividades
                    .slice()
                    .sort((a, b) => a.secuencia - b.secuencia)
                    .map((act, i) => (
                      <TarjetaActividad key={act.id} actividad={act} index={i} />
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal formulario */}
      {mostrarForm && procesoSeleccionado && (
        <FormActividad
          procesoId={procesoSeleccionado.id}
          usuarios={usuarios}
          siguienteSecuencia={siguienteSecuencia}
          onClose={() => setMostrarForm(false)}
          onCreated={recargarActividades}
        />
      )}
    </div>
  );
}