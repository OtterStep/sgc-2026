'use client';
import { useState, useEffect } from 'react';
import { GitBranch, Tag, User, GraduationCap } from 'lucide-react';

const CLASIFICACIONES = [
  { key: 'estrategicos', label: 'Estratégicos', color: 'border-l-blue-500 bg-blue-50', headerBg: 'bg-blue-50', badgeBg: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
  { key: 'misionales', label: 'Misionales', color: 'border-l-emerald-500 bg-emerald-50', headerBg: 'bg-emerald-50', badgeBg: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
  { key: 'soporte', label: 'Soporte', color: 'border-l-amber-500 bg-amber-50', headerBg: 'bg-amber-50', badgeBg: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
];

export default function PublicProcessMap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapa = async () => {
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${baseURL}/api/v1/mapa/publico`);
        const json = await res.json();
        setData(json);
      } catch {
        setData({ publicada: false });
      } finally {
        setLoading(false);
      }
    };
    fetchMapa();
  }, []);

  if (loading || !data || !data.publicada) return null;

  const grupos = data.datos || { estrategicos: [], misionales: [], soporte: [], sin_clasificar: [] };

  return (
    <section className="border-t border-[#E3DDCB] bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0B2545]">
            <GraduationCap size={15} className="text-[#C9A227]" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
            Mapa de Procesos
          </p>
        </div>

        <h2
          style={{ fontFamily: 'var(--font-serif)' }}
          className="mt-3 max-w-xl text-3xl font-semibold text-[#0B2545]"
        >
          Estructura organizacional de la calidad
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5B6472]">
          Los macroprocesos están clasificados en estratégicos, misionales y de
          soporte, según su contribución al Sistema de Gestión de la Calidad.
        </p>

        <div className="flex items-center gap-3 mt-8 mb-6">
          <Tag size={16} className="text-[#C9A227]" />
          <span className="text-sm text-[#5B6472]">
            Versión publicada:{' '}
            <strong className="text-[#0B2545]">v{data.version}</strong>
          </span>
          {data.creado_en && (
            <span className="text-xs text-[#9CA3AF]">
              · {new Date(data.creado_en).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {CLASIFICACIONES.map(({ key, label, headerBg, badgeBg, border }) => {
            const items = grupos[key] || [];
            return (
              <div
                key={key}
                className={`rounded-xl border ${border} overflow-hidden shadow-[0_1px_2px_rgba(11,37,69,0.04)]`}
              >
                <div className={`px-5 py-3 ${headerBg} border-b ${border}`}>
                  <h3 className="font-bold text-[#1F2430] flex items-center justify-between">
                    {label}
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeBg}`}
                    >
                      {items.length}
                    </span>
                  </h3>
                </div>
                {items.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-[#9CA3AF]">
                    No hay macroprocesos clasificados
                  </div>
                ) : (
                  <div className="divide-y divide-[#E3DDCB]">
                    {items.map((m) => (
                      <div
                        key={m.id}
                        className="px-5 py-3.5 hover:bg-[#F7F4EC]/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-[#5B6472] bg-[#F7F4EC] px-2 py-0.5 rounded">
                            {m.codigo}
                          </span>
                          <h4 className="font-semibold text-[#1F2430] truncate text-sm">
                            {m.nombre}
                          </h4>
                        </div>
                        {m.descripcion && (
                          <p className="text-xs text-[#5B6472] mt-1 truncate">
                            {m.descripcion}
                          </p>
                        )}
                        {m.responsable && (
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-[#9CA3AF]">
                            <User size={11} />
                            {m.responsable.nombres} {m.responsable.apellidos}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {grupos.sin_clasificar && grupos.sin_clasificar.length > 0 && (
          <div className="mt-6 rounded-xl border border-[#E3DDCB] overflow-hidden shadow-[0_1px_2px_rgba(11,37,69,0.04)]">
            <div className="px-5 py-3 bg-[#F7F4EC] border-b border-[#E3DDCB]">
              <h3 className="font-bold text-[#5B6472] text-sm">Sin clasificar</h3>
            </div>
            <div className="divide-y divide-[#E3DDCB]">
              {grupos.sin_clasificar.map((m) => (
                <div key={m.id} className="px-5 py-3">
                  <span className="text-sm text-[#5B6472]">
                    {m.codigo} — {m.nombre}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
