import { ClipboardList, PlayCircle, SearchCheck, RefreshCw, GraduationCap } from 'lucide-react';

const PHASES = [
  { label: 'Planificar', icon: ClipboardList, position: 'top' },
  { label: 'Hacer', icon: PlayCircle, position: 'right' },
  { label: 'Verificar', icon: SearchCheck, position: 'bottom' },
  { label: 'Actuar', icon: RefreshCw, position: 'left' },
];

const POSITION_CLASSES = {
  top: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
  right: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
  bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
  left: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
};

/**
 * QualitySeal — diagram of the PHVA / Deming cycle (Planificar, Hacer,
 * Verificar, Actuar) that the quality system manages. Designed to sit on
 * a dark navy background (hero section, login brand panel).
 *
 * @param {boolean} compact - smaller variant without the four phase badges,
 *   used where space is tight (e.g. the login screen's side panel).
 */
export default function QualitySeal({ compact = false }) {
  return (
    <div
      aria-hidden="true"
      className={`relative mx-auto select-none ${
        compact ? 'w-48 h-48' : 'w-72 h-72 md:w-80 md:h-80 lg:w-[22rem] lg:h-[22rem]'
      }`}
    >
      {/* Static outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-[#F7F4EC]/15" />

      {/* Slow-rotating dashed ring (respects prefers-reduced-motion) */}
      <div className="absolute inset-3 rounded-full border border-dashed border-[#C9A227]/70 motion-safe:animate-[spin_70s_linear_infinite]" />

      {/* Phase badges */}
      {!compact &&
        PHASES.map(({ label, icon: Icon, position }) => (
          <div
            key={label}
            className={`absolute ${POSITION_CLASSES[position]} flex items-center gap-1.5 rounded-full bg-[#F7F4EC] border border-[#0B2545]/10 px-3 py-1.5 whitespace-nowrap`}
          >
            <Icon size={13} className="text-[#0B2545]" strokeWidth={2.25} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#0B2545]">
              {label}
            </span>
          </div>
        ))}

      {/* Center seal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#0B2545] ring-4 ring-[#F7F4EC]/90 flex flex-col items-center justify-center gap-0.5">
        <GraduationCap size={compact ? 18 : 22} className="text-[#C9A227]" strokeWidth={2} />
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#F7F4EC]">
          SGC
        </span>
      </div>
    </div>
  );
}