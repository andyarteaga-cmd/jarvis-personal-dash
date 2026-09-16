import { useEffect, useState } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

const BOOT_MESSAGES = [
  'INICIANDO NÚCLEO DE COMANDO...',
  'CARGANDO MÓDULOS DE SISTEMA...',
  'ESTABLECIENDO CONEXIÓN SATÉLITE...',
  'CALIBRANDO REACTOR ARC...',
  'VERIFICANDO SISTEMAS DE SEGURIDAD...',
  'SINCRONIZANDO BASE DE DATOS...',
  'INICIALIZANDO ASISTENTE DE VOZ...',
  'SISTEMAS OPERATIVOS. JARVIS EN LÍNEA.',
];

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [arcProgress, setArcProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 3500;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      setArcProgress((pct / 100) * 283);
      setMessageIndex(Math.min(Math.floor((pct / 100) * BOOT_MESSAGES.length), BOOT_MESSAGES.length - 1));

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center hud-grid overflow-hidden">
      <div className="scan-line" />

      {/* Arc Reactor Animation */}
      <div className="relative w-64 h-64 mb-12">
        {/* Outer rotating ring */}
        <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="95"
            fill="none"
            stroke="rgba(245, 158, 11, 0.2)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <circle
            cx="100" cy="100" r="88"
            fill="none"
            stroke="rgba(245, 158, 11, 0.1)"
            strokeWidth="0.5"
          />
        </svg>

        {/* Middle counter-rotating ring */}
        <svg className="absolute inset-0 w-full h-full animate-spin-reverse" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="78"
            fill="none"
            stroke="rgba(245, 158, 11, 0.15)"
            strokeWidth="1"
            strokeDasharray="2 12"
          />
        </svg>

        {/* Progress arc */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r="70"
            fill="none"
            stroke="rgba(245, 158, 11, 0.08)"
            strokeWidth="3"
          />
          <circle
            cx="100" cy="100" r="70"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={283}
            strokeDashoffset={283 - arcProgress}
            style={{ filter: 'drop-shadow(0 0 8px var(--accent))' }}
          />
        </svg>

        {/* Core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: 'var(--accent)',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
              boxShadow: `0 0 ${20 + (progress / 100) * 40}px var(--accent-glow)`,
            }}
          >
            <span className="font-display text-3xl font-bold text-amber-500 glow-text">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Tick marks */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = 100 + Math.cos(angle) * 60;
            const y1 = 100 + Math.sin(angle) * 60;
            const x2 = 100 + Math.cos(angle) * 65;
            const y2 = 100 + Math.sin(angle) * 65;
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="var(--accent)"
                strokeWidth="1"
                opacity={progress > (i / 12) * 100 ? 0.6 : 0.15}
              />
            );
          })}
        </svg>
      </div>

      {/* Boot messages */}
      <div className="text-center min-h-[2rem]">
        <p
          key={messageIndex}
          className="animate-boot-text font-mono text-sm text-amber-500/80 tracking-widest"
        >
          {BOOT_MESSAGES[messageIndex]}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-6 w-64 h-0.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 transition-all duration-100"
          style={{ width: `${progress}%`, boxShadow: '0 0 10px var(--accent)' }}
        />
      </div>

      <p className="mt-4 font-display text-xs text-neutral-600 tracking-[0.3em]">
        J.A.R.V.I.S. v3.0
      </p>
    </div>
  );
}
