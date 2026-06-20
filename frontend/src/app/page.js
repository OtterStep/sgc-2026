import Link from 'next/link';
import {
  GraduationCap,
  ArrowRight,
  ClipboardList,
  PlayCircle,
  SearchCheck,
  RefreshCw,
  ShieldCheck,
  Search,
  Building2,
  FileText,
} from 'lucide-react';
import QualitySeal from '@/components/QualitySeal';

const PHASES = [
  {
    letter: 'P',
    name: 'Planificar',
    icon: ClipboardList,
    text: 'Cada área define objetivos de calidad, indicadores y la documentación normativa que los respalda.',
  },
  {
    letter: 'H',
    name: 'Hacer',
    icon: PlayCircle,
    text: 'Los procesos se ejecutan con procedimientos estandarizados y responsables claramente asignados.',
  },
  {
    letter: 'V',
    name: 'Verificar',
    icon: SearchCheck,
    text: 'Auditorías internas y revisiones periódicas contrastan lo ejecutado frente a lo planificado.',
  },
  {
    letter: 'A',
    name: 'Actuar',
    icon: RefreshCw,
    text: 'Las no conformidades generan planes de acción con plazos y responsables hasta su cierre.',
  },
];

const ROLES = [
  {
    icon: ShieldCheck,
    title: 'Coordinador de calidad',
    text: 'Da seguimiento al sistema en su unidad: documentación vigente, indicadores y planes de mejora.',
  },
  {
    icon: Search,
    title: 'Auditor interno',
    text: 'Programa y registra auditorías, levanta hallazgos y verifica el cierre de no conformidades.',
  },
  {
    icon: Building2,
    title: 'Decano / Jefe de unidad',
    text: 'Visualiza el estado de calidad de su facultad o área y aprueba los planes de acción.',
  },
  {
    icon: FileText,
    title: 'Personal administrativo',
    text: 'Sube evidencias, actualiza procedimientos y mantiene trazable cada proceso a su cargo.',
  },
];

export default function HomePage() {
  return (
    <main className="bg-[#F7F4EC] text-[#1F2430]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#E3DDCB] bg-[#F7F4EC]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0B2545]">
              <GraduationCap size={18} className="text-[#C9A227]" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold tracking-wide text-[#0B2545]">SGC · UNT</p>
              <p className="text-[11px] text-[#5B6472]">Gestión de la Calidad</p>
            </div>
          </div>
          <Link
            href="/login"
            className="rounded-lg border border-[#0B2545]/20 px-4 py-2 text-sm font-medium text-[#0B2545] transition-colors hover:bg-[#0B2545]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B2545]"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#071A33]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
              Sistema de Gestión de la Calidad
            </p>
            <h1
              style={{ fontFamily: 'var(--font-serif)' }}
              className="mt-4 text-4xl font-semibold leading-tight text-[#F7F4EC] md:text-[2.75rem]"
            >
              La calidad institucional, con trazabilidad y evidencia en cada proceso.
            </h1>
            <p className="mt-5 max-w-md text-[#C9CFDA]">
              La plataforma con la que la Universidad Nacional de Trujillo documenta
              procesos, programa auditorías internas y da seguimiento a los planes de
              mejora de cada facultad y unidad administrativa, alineada a estándares de
              gestión de la calidad y a los modelos de acreditación vigentes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-[#C9A227] px-5 py-3 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#D8B748] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7F4EC]"
              >
                Acceder al sistema
                <ArrowRight size={16} />
              </Link>
              <a
                href="#ciclo"
                className="text-sm font-medium text-[#F7F4EC]/80 underline-offset-4 hover:text-[#F7F4EC] hover:underline"
              >
                Cómo funciona
              </a>
            </div>
          </div>

          <QualitySeal />
        </div>
      </section>

      {/* Ciclo de mejora continua */}
      <section id="ciclo" className="border-b border-[#E3DDCB] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
            El ciclo de mejora continua
          </p>
          <h2
            style={{ fontFamily: 'var(--font-serif)' }}
            className="mt-3 max-w-xl text-3xl font-semibold text-[#0B2545]"
          >
            Cuatro fases, un mismo estándar
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#E3DDCB] bg-[#E3DDCB] md:grid-cols-4">
            {PHASES.map(({ letter, name, icon: Icon, text }) => (
              <div key={letter} className="flex flex-col gap-4 bg-[#F7F4EC] p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B2545] text-sm font-bold text-[#C9A227]">
                    {letter}
                  </span>
                  <Icon size={20} className="text-[#0B2545]" />
                </div>
                <p className="font-semibold text-[#0B2545]">{name}</p>
                <p className="text-sm leading-relaxed text-[#5B6472]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
            Un sistema, varios responsables
          </p>
          <h2
            style={{ fontFamily: 'var(--font-serif)' }}
            className="mt-3 max-w-xl text-3xl font-semibold text-[#0B2545]"
          >
            Diseñado para cada rol dentro de la universidad
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#E3DDCB] bg-white p-6 shadow-[0_1px_2px_rgba(11,37,69,0.04)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B2545]/5">
                  <Icon size={19} className="text-[#0B2545]" />
                </div>
                <p className="mt-4 font-semibold text-[#0B2545]">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#5B6472]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-[#0B2545] px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
          <h2
            style={{ fontFamily: 'var(--font-serif)' }}
            className="max-w-lg text-2xl font-semibold text-[#F7F4EC] md:text-3xl"
          >
            Ingresa con tu correo institucional para comenzar.
          </h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9A227] px-6 py-3 text-sm font-semibold text-[#0B2545] transition-colors hover:bg-[#D8B748] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7F4EC]"
          >
            Ir al inicio de sesión
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#071A33] px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center text-xs text-[#C9CFDA]/70 sm:flex-row sm:text-left">
          <p>Universidad Nacional de Trujillo — Sistema de Gestión de la Calidad</p>
          <p>© {new Date().getFullYear()} UNT. Trujillo, Perú.</p>
        </div>
      </footer>
    </main>
  );
}