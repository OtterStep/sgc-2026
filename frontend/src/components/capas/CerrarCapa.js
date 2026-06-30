'use client';
import { useState } from 'react';
import axios from 'axios';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { swalError, swalSuccess } from '@/lib/swal';

// ============================================================
// ModalCerrarCapa
// Modal de cierre de CAPA con calificación obligatoria de
// efectividad. Si la efectividad es 'no_efectiva', el backend
// genera automáticamente una CAPA derivada.
//
// Estilo "Classroom moderno": ligero, amigable, con enfoque
// en usabilidad y jerarquía visual clara.
// ============================================================
export default function ModalCerrarCapa({ capa, onClose, onCerrada }) {
  const [efectividad, setEfectividad] = useState(null);
  const [comentario, setComentario] = useState('');
  const [fechaVerificacion, setFechaVerificacion] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const opciones = [
    { valor: 'efectiva', label: 'Efectiva', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', hover: 'hover:bg-green-100' },
    { valor: 'parcial', label: 'Parcial', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', hover: 'hover:bg-amber-100' },
    { valor: 'no_efectiva', label: 'No Efectiva', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', hover: 'hover:bg-red-100' },
  ];

  const confirmarCierre = async () => {
    if (!efectividad) return;
    setEnviando(true);
    try {
      const { data } = await axios.patch(`/api/v1/capas/${capa.id}/cerrar`, {
        efectividad,
        comentario_cierre: comentario || undefined,
        fecha_verificacion: fechaVerificacion || undefined,
      });

      setResultado(data);
      swalSuccess(
        data.capa_derivada
          ? 'CAPA cerrada como No Efectiva. Se generó una CAPA derivada.'
          : `CAPA cerrada correctamente (${efectividad}).`
      );

      setTimeout(() => {
        onCerrada();
        onClose();
      }, 1600);
    } catch (err) {
      swalError(err);
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cerrar CAPA</h3>
            <p className="text-sm text-gray-500 mt-0.5">{capa.codigo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Selector de efectividad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Calificación de efectividad <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {opciones.map((op) => {
                const Icon = op.icon;
                const seleccionada = efectividad === op.valor;
                return (
                  <button
                    key={op.valor}
                    type="button"
                    onClick={() => setEfectividad(op.valor)}
                    className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                      seleccionada
                        ? `${op.bg} ${op.border} shadow-sm`
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={24} className={`mb-1.5 ${op.color}`} />
                    <span className="text-xs font-medium text-gray-700">{op.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advertencia si no efectiva */}
          {efectividad === 'no_efectiva' && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-sm text-red-800">
              <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                Al calificar como <strong>No Efectiva</strong>, el sistema generará automáticamente una nueva
                CAPA derivada vinculada al mismo hallazgo, en estado <em>registrada</em>, para definir una
                nueva acción correctiva.
              </div>
            </div>
          )}

          {/* Fecha de verificación */}
          <div>
            <label htmlFor="fecha-verificacion" className="block text-sm font-medium text-gray-700 mb-1.5">
              Fecha de verificación
            </label>
            <input
              id="fecha-verificacion"
              type="date"
              value={fechaVerificacion}
              onChange={(e) => setFechaVerificacion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>

          {/* Comentario */}
          <div>
            <label htmlFor="comentario-cierre" className="block text-sm font-medium text-gray-700 mb-1.5">
              Comentario de cierre
            </label>
            <textarea
              id="comentario-cierre"
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Observaciones sobre la verificación de efectividad de la acción..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>

          {/* Resultado tras cierre */}
          {resultado && (
            <div
              className={`p-4 rounded-lg text-sm ${
                resultado.capa_derivada
                  ? 'bg-red-50 border-l-4 border-red-500 text-red-800'
                  : 'bg-green-50 border-l-4 border-green-500 text-green-800'
              }`}
            >
              {resultado.capa_derivada ? (
                <>
                  CAPA cerrada como <strong>No Efectiva</strong>.<br />
                  Se generó la CAPA derivada <strong>{resultado.capa_derivada.codigo}</strong>, pendiente
                  de definir nueva acción correctiva.
                </>
              ) : (
                <>CAPA cerrada correctamente con efectividad <strong>{efectividad}</strong>.</>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmarCierre}
            disabled={!efectividad || enviando || resultado}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              efectividad === 'no_efectiva'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {enviando ? 'Procesando…' : resultado ? 'Cerrado' : 'Confirmar Cierre'}
          </button>
        </div>
      </div>
    </div>
  );
}