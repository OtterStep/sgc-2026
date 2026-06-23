'use client';
import Sidebar from '@/components/layout/Sidebar';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ClipboardList, Plus, Send, BarChart3, ChevronDown, ChevronUp,
  Trash2, PencilLine, Eye, CheckCircle2, Lock, X, GripVertical,
  ToggleLeft, ToggleRight, Calendar, Users, FileText, Settings,
} from 'lucide-react';
import { swalError, swalSuccess } from '@/lib/swal';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const TIPO_LABELS = {
  likert_5: 'Likert 1-5',
  likert_7: 'Likert 1-7',
  si_no: 'Sí / No',
  abierta: 'Abierta',
  numerica: 'Numérica',
};

const ESTADO_COLORS = {
  borrador: 'bg-slate-100 text-slate-600',
  publicada: 'bg-emerald-100 text-emerald-700',
  en_curso: 'bg-blue-100 text-blue-700',
  cerrada: 'bg-amber-100 text-amber-700',
  archivada: 'bg-red-100 text-red-600',
};

const DIRIGIDO_OPTS = [
  { value: 'estudiantes', label: 'Estudiantes' },
  { value: 'docentes', label: 'Docentes' },
  { value: 'egresados', label: 'Egresados' },
  { value: 'administrativos', label: 'Administrativos' },
  { value: 'todos', label: 'Todos' },
];

const TIPO_PREGUNTA_OPTS = Object.entries(TIPO_LABELS).map(([value, label]) => ({ value, label }));

const FLUJO_ESTADO = ['borrador', 'publicada', 'cerrada', 'archivada'];

function badge(estado) {
  return `px-2.5 py-0.5 text-xs font-medium rounded-full ${ESTADO_COLORS[estado] ?? 'bg-slate-100 text-slate-600'}`;
}

// Barra de progreso para resultados likert/numérica
function BarraDistribucion({ valor, conteo, total, max }) {
  const pct = total > 0 ? Math.round((conteo / total) * 100) : 0;
  const width = max > 0 ? Math.round((conteo / max) * 100) : pct;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-6 text-right font-mono text-slate-500">{valor}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${width}%` }} />
      </div>
      <span className="w-14 text-slate-600">{conteo} ({pct}%)</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL CREAR / EDITAR ENCUESTA
// ─────────────────────────────────────────────
function ModalEncuesta({ encuesta, onClose, onSaved }) {
  const esEdicion = Boolean(encuesta?.id);
  const [form, setForm] = useState({
    codigo: encuesta?.codigo ?? '',
    titulo: encuesta?.titulo ?? '',
    descripcion: encuesta?.descripcion ?? '',
    dirigido_a: encuesta?.dirigido_a ?? 'estudiantes',
    fecha_inicio: encuesta?.fecha_inicio ?? '',
    fecha_fin: encuesta?.fecha_fin ?? '',
    anonima: encuesta?.anonima !== false,
  });
  const [preguntas, setPreguntas] = useState(
    encuesta?.preguntas?.length
      ? encuesta.preguntas.map((p) => ({ ...p }))
      : [{ texto: '', tipo: 'likert_5', orden: 1, obligatoria: true }]
  );
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addPregunta = () =>
    setPreguntas((ps) => [...ps, { texto: '', tipo: 'likert_5', orden: ps.length + 1, obligatoria: true }]);

  const removePregunta = (i) =>
    setPreguntas((ps) => ps.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, orden: idx + 1 })));

  const setPregunta = (i, k, v) =>
    setPreguntas((ps) => ps.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)));

  const moverPregunta = (i, dir) => {
    const ps = [...preguntas];
    const target = i + dir;
    if (target < 0 || target >= ps.length) return;
    [ps[i], ps[target]] = [ps[target], ps[i]];
    setPreguntas(ps.map((p, idx) => ({ ...p, orden: idx + 1 })));
  };

  const handleSubmit = async () => {
    if (!form.codigo || !form.titulo) return swalError({ message: 'Código y título son obligatorios' });
    setSaving(true);
    try {
      const payload = { ...form, preguntas };
      if (esEdicion) {
        await axios.put(`/api/v1/encuestas/${encuesta.id}`, payload);
      } else {
        await axios.post('/api/v1/encuestas', payload);
      }
      swalSuccess(esEdicion ? 'Encuesta actualizada' : 'Encuesta creada');
      onSaved();
      onClose();
    } catch (err) {
      swalError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            {esEdicion ? 'Editar Encuesta' : 'Nueva Encuesta'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Datos generales */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Datos generales</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
                <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ENC-2026-I" value={form.codigo} onChange={(e) => set('codigo', e.target.value)} disabled={esEdicion} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Satisfacción del Estudiante" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirigido a</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.dirigido_a} onChange={(e) => set('dirigido_a', e.target.value)}>
                  {DIRIGIDO_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <span className="text-sm font-medium text-slate-700">Anónima</span>
                <button onClick={() => set('anonima', !form.anonima)} className="text-blue-600">
                  {form.anonima ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-slate-400" />}
                </button>
                <span className="text-sm text-slate-500">{form.anonima ? 'Sí' : 'No'}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha inicio</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.fecha_inicio} onChange={(e) => set('fecha_inicio', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha fin</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.fecha_fin} onChange={(e) => set('fecha_fin', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Preguntas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preguntas</p>
              <button onClick={addPregunta}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">
                <Plus size={14} /> Agregar
              </button>
            </div>
            <div className="space-y-3">
              {preguntas.map((p, i) => (
                <div key={i} className="flex gap-2 items-start bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="flex flex-col gap-1 pt-1">
                    <button onClick={() => moverPregunta(i, -1)} disabled={i === 0} className="text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronUp size={14} /></button>
                    <span className="text-xs text-slate-400 text-center">{i + 1}</span>
                    <button onClick={() => moverPregunta(i, 1)} disabled={i === preguntas.length - 1} className="text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronDown size={14} /></button>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Texto de la pregunta" value={p.texto} onChange={(e) => setPregunta(i, 'texto', e.target.value)} />
                    </div>
                    <div>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={p.tipo} onChange={(e) => setPregunta(i, 'tipo', e.target.value)}>
                        {TIPO_PREGUNTA_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id={`ob-${i}`} checked={p.obligatoria} onChange={(e) => setPregunta(i, 'obligatoria', e.target.checked)} className="rounded" />
                      <label htmlFor={`ob-${i}`} className="text-xs text-slate-600">Obligatoria</label>
                    </div>
                  </div>
                  <button onClick={() => removePregunta(i)} className="text-red-400 hover:text-red-600 pt-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {preguntas.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Sin preguntas. Agrega al menos una.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear encuesta'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VISTA RESULTADOS (página completa, no modal)
// ─────────────────────────────────────────────
function VistaResultados({ encuestaId, onVolver }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/v1/encuestas/${encuestaId}/resultados`)
      .then((r) => setData(r.data))
      .catch(swalError)
      .finally(() => setLoading(false));
  }, [encuestaId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <div className="text-center">
          <BarChart3 size={36} className="mx-auto mb-3 animate-pulse" />
          <p className="text-sm">Cargando resultados…</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { encuesta, total_respondentes, resultados } = data;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb / volver */}
      <button onClick={onVolver}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mb-6 group">
        <ChevronDown size={15} className="rotate-90 group-hover:-translate-x-0.5 transition-transform" />
        Volver a encuestas
      </button>

      {/* Header de la encuesta */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 mb-1">{encuesta.codigo}</p>
            <h3 className="text-xl font-bold text-slate-800">{encuesta.titulo}</h3>
            <p className="text-sm text-slate-500 mt-1">
              Dirigido a: <span className="font-medium capitalize">{encuesta.dirigido_a}</span>
              {encuesta.fecha_inicio && (
                <span className="ml-3">· {encuesta.fecha_inicio}{encuesta.fecha_fin ? ` → ${encuesta.fecha_fin}` : ''}</span>
              )}
            </p>
          </div>
          <span className={badge(encuesta.estado)}>{encuesta.estado}</span>
        </div>

        {/* Métricas resumen */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{total_respondentes}</p>
            <p className="text-xs text-blue-500 mt-1 font-medium">Respondentes</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-slate-700">{resultados.length}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Preguntas</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-slate-700">
              {encuesta.anonima ? '🔒' : '👤'}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{encuesta.anonima ? 'Anónima' : 'Identificada'}</p>
          </div>
        </div>
      </div>

      {/* Resultados por pregunta */}
      <div className="space-y-4">
        {resultados.map((r, i) => (
          <div key={r.pregunta_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            {/* Cabecera pregunta */}
            <div className="flex items-start justify-between mb-1">
              <p className="text-sm font-semibold text-slate-800 leading-snug">
                <span className="text-blue-500 mr-1.5">{i + 1}.</span>{r.texto}
              </p>
              <span className="ml-3 shrink-0 text-xs px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                {TIPO_LABELS[r.tipo]}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {r.total} respuesta{r.total !== 1 ? 's' : ''}
            </p>

            {/* Likert / Numérica → barras + promedio */}
            {['likert_5', 'likert_7', 'numerica'].includes(r.tipo) && (
              <>
                {r.promedio !== null && (
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-blue-600">{r.promedio}</span>
                    <span className="text-sm text-slate-500">
                      promedio de {r.tipo === 'likert_5' ? '5' : r.tipo === 'likert_7' ? '7' : '—'}
                    </span>
                  </div>
                )}
                {r.distribucion && Object.keys(r.distribucion).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(r.distribucion)
                      .sort((a, b) => Number(a[0]) - Number(b[0]))
                      .map(([v, c]) => (
                        <BarraDistribucion key={v} valor={v} conteo={c} total={r.total}
                          max={Math.max(...Object.values(r.distribucion))} />
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Sin respuestas aún.</p>
                )}
              </>
            )}

            {/* Sí / No → tarjetas con conteo real */}
            {r.tipo === 'si_no' && (
              <div className="flex gap-4">
                <div className="flex-1 bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                  <p className="text-3xl font-bold text-emerald-600">{r.si ?? 0}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Sí · {r.total > 0 ? Math.round(((r.si ?? 0) / r.total) * 100) : 0}%
                  </p>
                </div>
                <div className="flex-1 bg-red-50 rounded-xl p-4 text-center border border-red-100">
                  <p className="text-3xl font-bold text-red-500">{r.no ?? 0}</p>
                  <p className="text-xs text-red-500 font-medium mt-1">
                    No · {r.total > 0 ? Math.round(((r.no ?? 0) / r.total) * 100) : 0}%
                  </p>
                </div>
              </div>
            )}

            {/* Abierta → lista de textos */}
            {r.tipo === 'abierta' && (
              <ul className="space-y-2">
                {(r.respuestas_texto ?? []).length > 0
                  ? r.respuestas_texto.map((t, j) => (
                      <li key={j} className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200">
                        "{t}"
                      </li>
                    ))
                  : <li className="text-sm text-slate-400 italic">Sin respuestas abiertas aún.</li>
                }
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VISTA RESPONDER ENCUESTA (usuario final)
// ─────────────────────────────────────────────
function VistaResponder({ encuesta, onVolver, onRespondida }) {
  const [respuestas, setRespuestas] = useState({});
  const [enviando, setEnviando] = useState(false);

  const setR = (id, v) => setRespuestas((r) => ({ ...r, [id]: v }));

  const puedeEnviar = encuesta.preguntas.every(
    (p) => !p.obligatoria || respuestas[p.id] !== undefined
  );

  const enviar = async () => {
    setEnviando(true);
    try {
      await axios.post('/api/v1/encuestas/responder', {
        encuesta_id: encuesta.id,
        respuestas: encuesta.preguntas.map((p) => ({
          pregunta_id: p.id,
          valor_numerico: typeof respuestas[p.id] === 'number' ? respuestas[p.id] : null,
          valor_texto: typeof respuestas[p.id] === 'string' ? respuestas[p.id] : null,
        })),
      });
      swalSuccess('¡Respuestas enviadas correctamente!');
      onRespondida();
    } catch (err) {
      swalError(err);
    } finally {
      setEnviando(false);
    }
  };

  const renderInput = (p) => {
    if (p.tipo === 'likert_5' || p.tipo === 'likert_7') {
      const max = p.tipo === 'likert_5' ? 5 : 7;
      return (
        <div className="flex gap-2 flex-wrap mt-3">
          {Array.from({ length: max }, (_, i) => i + 1).map((v) => (
            <button key={v} onClick={() => setR(p.id, v)}
              className={`w-11 h-11 rounded-xl font-bold text-sm transition-all ${
                respuestas[p.id] === v ? 'bg-blue-600 text-white shadow-md scale-110' : 'bg-slate-100 text-slate-600 hover:bg-blue-50'
              }`}>{v}</button>
          ))}
          <div className="w-full flex justify-between text-xs text-slate-400 px-1 mt-1">
            <span>Muy en desacuerdo</span><span>Muy de acuerdo</span>
          </div>
        </div>
      );
    }
    if (p.tipo === 'si_no') {
      return (
        <div className="flex gap-3 mt-3">
          {[['Sí', 1], ['No', 0]].map(([label, val]) => (
            <button key={label} onClick={() => setR(p.id, val)}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
                respuestas[p.id] === val ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-blue-50'
              }`}>{label}</button>
          ))}
        </div>
      );
    }
    if (p.tipo === 'numerica') {
      return (
        <input type="number" className="mt-3 px-4 py-2.5 border border-slate-300 rounded-xl text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={respuestas[p.id] ?? ''} onChange={(e) => setR(p.id, e.target.value === '' ? undefined : Number(e.target.value))}
          placeholder="Ingresa un número" />
      );
    }
    return (
      <textarea className="w-full mt-3 px-4 py-2.5 border border-slate-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3} value={respuestas[p.id] ?? ''} placeholder="Escribe tu respuesta…"
        onChange={(e) => setR(p.id, e.target.value || undefined)} />
    );
  };

  const completadas = encuesta.preguntas.filter((p) => respuestas[p.id] !== undefined).length;
  const progreso = encuesta.preguntas.length > 0
    ? Math.round((completadas / encuesta.preguntas.length) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header encuesta */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <button onClick={onVolver} className="text-sm text-blue-600 hover:underline mb-3">← Volver</button>
        <h3 className="text-xl font-semibold text-slate-800">{encuesta.titulo}</h3>
        {encuesta.descripcion && <p className="text-sm text-slate-500 mt-1">{encuesta.descripcion}</p>}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${progreso}%` }} />
          </div>
          <span className="text-xs text-slate-500">{completadas}/{encuesta.preguntas.length} respondidas</span>
        </div>
        {encuesta.anonima && (
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <Lock size={12} /> Esta encuesta es anónima
          </p>
        )}
      </div>

      {/* Preguntas */}
      <div className="space-y-4">
        {encuesta.preguntas
          .slice()
          .sort((a, b) => a.orden - b.orden)
          .map((p, i) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <p className="font-medium text-slate-800 text-sm leading-snug">
                  <span className="text-blue-500 font-bold mr-2">{i + 1}.</span>
                  {p.texto}
                  {p.obligatoria && <span className="text-red-400 ml-1">*</span>}
                </p>
                <span className="ml-3 text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full shrink-0">
                  {TIPO_LABELS[p.tipo]}
                </span>
              </div>
              {renderInput(p)}
              {respuestas[p.id] !== undefined && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Respondida
                </p>
              )}
            </div>
          ))}
      </div>

      {/* Enviar */}
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onVolver} className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-sm">Cancelar</button>
        <button onClick={enviar} disabled={!puedeEnviar || enviando}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <Send size={16} />
          {enviando ? 'Enviando…' : 'Enviar respuestas'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TARJETA DE ENCUESTA (admin)
// ─────────────────────────────────────────────
function TarjetaAdmin({ enc, onEditar, onEstado, onResultados, onRefresh }) {
  const siguienteEstado = FLUJO_ESTADO[FLUJO_ESTADO.indexOf(enc.estado) + 1];
  const labelSiguiente = {
    publicada: 'Publicar',
    cerrada: 'Cerrar',
    archivada: 'Archivar',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-mono text-slate-400">{enc.codigo}</p>
          <p className="font-semibold text-slate-900 mt-0.5 text-sm leading-snug">{enc.titulo}</p>
        </div>
        <span className={badge(enc.estado)}>{enc.estado}</span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Users size={12} /> {enc.dirigido_a}</span>
        {enc.fecha_inicio && <span className="flex items-center gap-1"><Calendar size={12} /> {enc.fecha_inicio}</span>}
        <span className="flex items-center gap-1">{enc.anonima ? <Lock size={12} /> : null} {enc.anonima ? 'Anónima' : 'Identificada'}</span>
        <span className="flex items-center gap-1"><FileText size={12} /> {enc.preguntas?.length ?? 0} preguntas</span>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onEditar(enc)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50">
          <PencilLine size={13} /> Editar
        </button>
        <button onClick={() => onResultados(enc.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50">
          <BarChart3 size={13} /> Resultados
        </button>
        {siguienteEstado && (
          <button onClick={() => onEstado(enc.id, siguienteEstado)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Eye size={13} /> {labelSiguiente[siguienteEstado] ?? siguienteEstado}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TARJETA ENCUESTA (usuario final)
// ─────────────────────────────────────────────
function TarjetaUsuario({ enc, onResponder }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-mono text-slate-400">{enc.codigo}</p>
          <p className="font-semibold text-slate-900 mt-0.5 text-sm">{enc.titulo}</p>
          {enc.descripcion && <p className="text-xs text-slate-500 mt-1">{enc.descripcion}</p>}
        </div>
        {enc.ya_respondida
          ? <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full"><CheckCircle2 size={12} /> Respondida</span>
          : <span className={badge('publicada')}>Disponible</span>}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {enc.fecha_inicio && <span className="flex items-center gap-1"><Calendar size={12} /> {enc.fecha_inicio} – {enc.fecha_fin ?? '…'}</span>}
        {enc.anonima && <span className="flex items-center gap-1"><Lock size={12} /> Anónima</span>}
      </div>

      {!enc.ya_respondida ? (
        <button onClick={() => onResponder(enc)}
          className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <Send size={15} /> Responder encuesta
        </button>
      ) : (
        <div className="py-2.5 text-center text-sm text-emerald-600 bg-emerald-50 rounded-xl font-medium">
          ¡Gracias por tu participación!
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────
export default function EncuestasPage() {
  // Obtener rol desde el contexto de sesión (ajusta según tu implementación)
  const [rol, setRol] = useState(null);
  const [encuestas, setEncuestas] = useState([]);
  const [vista, setVista] = useState('lista'); // 'lista' | 'responder' | 'resultados'
  const [encuestaActiva, setEncuestaActiva] = useState(null);
  const [encuestaResultadosId, setEncuestaResultadosId] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  // Cargar rol del usuario desde /api/v1/auth/perfil
  useEffect(() => {
    axios.get('/api/v1/auth/perfil')
      .then((r) => setRol(r.data.rol))
      .catch(() => setRol('invitado'));
  }, []);

  const esAdmin = ['admin', 'gestor_calidad'].includes(rol);

  const cargar = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/v1/encuestas');
      setEncuestas(data);
    } catch {
      setEncuestas([]);
    }
  }, []);

  useEffect(() => { if (rol) cargar(); }, [rol, cargar]);

  const cambiarEstado = async (id, estado) => {
    try {
      await axios.patch(`/api/v1/encuestas/${id}/estado`, { estado });
      swalSuccess(`Estado actualizado a "${estado}"`);
      cargar();
    } catch (err) { swalError(err); }
  };

  const encuestasFiltradas = filtroEstado
    ? encuestas.filter((e) => e.estado === filtroEstado)
    : encuestas;

  if (vista === 'responder' && encuestaActiva) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <VistaResponder
            encuesta={encuestaActiva}
            onVolver={() => { setVista('lista'); setEncuestaActiva(null); }}
            onRespondida={() => { setVista('lista'); setEncuestaActiva(null); cargar(); }}
          />
        </main>
      </div>
    );
  }

  if (vista === 'resultados' && encuestaResultadosId) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <VistaResultados
            encuestaId={encuestaResultadosId}
            onVolver={() => { setVista('lista'); setEncuestaResultadosId(null); }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-7">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="text-blue-600" /> Gestión de la Satisfacción
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Módulo 8 · Encuestas</p>
          </div>
          {esAdmin && (
            <button onClick={() => setModalCrear(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 shadow-sm">
              <Plus size={16} /> Nueva Encuesta
            </button>
          )}
        </div>

        {/* Filtros (solo admin) */}
        {esAdmin && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {['', ...FLUJO_ESTADO].map((e) => (
              <button key={e} onClick={() => setFiltroEstado(e)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === e
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}>
                {e === '' ? 'Todas' : e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Grid encuestas */}
        {encuestasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ClipboardList size={40} className="mb-3" />
            <p className="text-sm">No hay encuestas disponibles.</p>
            {esAdmin && (
              <button onClick={() => setModalCrear(true)} className="mt-3 text-blue-600 text-sm hover:underline">
                Crear la primera encuesta
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {encuestasFiltradas.map((enc) =>
              esAdmin ? (
                <TarjetaAdmin key={enc.id} enc={enc}
                  onEditar={(e) => setModalEditar(e)}
                  onEstado={cambiarEstado}
                  onResultados={(id) => { setEncuestaResultadosId(id); setVista('resultados'); }}
                  onRefresh={cargar}
                />
              ) : (
                <TarjetaUsuario key={enc.id} enc={enc}
                  onResponder={(e) => { setEncuestaActiva(e); setVista('responder'); }}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* Modales */}
      {modalCrear && (
        <ModalEncuesta onClose={() => setModalCrear(false)} onSaved={cargar} />
      )}
      {modalEditar && (
        <ModalEncuesta encuesta={modalEditar} onClose={() => setModalEditar(null)} onSaved={cargar} />
      )}
    </div>
  );
}