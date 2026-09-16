import { useEffect, useState } from 'react';
import { Thermometer, Timer, Activity } from 'lucide-react';
import type { BatteryInfo } from '@/types';

interface CommandCoreProps {
  battery: BatteryInfo;
}

export default function CommandCore({ battery }: CommandCoreProps) {
  const [temperature, setTemperature] = useState(42);
  const [uptime, setUptime] = useState(0);
  const [bootTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(Math.floor((Date.now() - bootTime) / 1000));
      setTemperature((prev) => {
        const target = battery.charging ? 48 : 42;
        const variance = (Math.random() - 0.5) * 2;
        return Math.round((prev + (target - prev) * 0.1 + variance) * 10) / 10;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [battery.charging, bootTime]);

  const batteryPct = Math.round(battery.level * 100);
  const circumference = 2 * Math.PI * 120;
  const arcLength = (batteryPct / 100) * circumference;

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="hud-panel rounded-lg p-6 lg:p-8 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 hud-grid opacity-30" />

      {/* Label */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-mono text-[10px] text-amber-500/60 tracking-widest">NÚCLEO DE COMANDO</span>
      </div>

      {/* Status */}
      <div className="absolute top-4 right-4 z-10">
        <span className="font-mono text-[10px] text-green-500/60 tracking-widest">EN LÍNEA</span>
      </div>

      {/* Arc Reactor */}
      <div className="relative w-72 h-72 my-4">
        {/* Outer rotating ring */}
        <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="145" fill="none" stroke="rgba(245, 158, 11, 0.1)" strokeWidth="1" strokeDasharray="3 6" />
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i * 6 - 90) * (Math.PI / 180);
            const isMajor = i % 5 === 0;
            const r1 = isMajor ? 135 : 138;
            const r2 = 142;
            const x1 = 150 + Math.cos(angle) * r1;
            const y1 = 150 + Math.sin(angle) * r1;
            const x2 = 150 + Math.cos(angle) * r2;
            const y2 = 150 + Math.sin(angle) * r2;
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(245, 158, 11, 0.3)"
                strokeWidth={isMajor ? 1.5 : 0.5}
              />
            );
          })}
        </svg>

        {/* Counter-rotating ring */}
        <svg className="absolute inset-0 w-full h-full animate-spin-reverse" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="128" fill="none" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="1" strokeDasharray="2 10" />
        </svg>

        {/* Battery arc */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 300 300">
          <circle
            cx="150" cy="150" r="120"
            fill="none"
            stroke="rgba(245, 158, 11, 0.08)"
            strokeWidth="4"
          />
          <circle
            cx="150" cy="150" r="120"
            fill="none"
            stroke={battery.charging ? '#22c55e' : 'var(--accent)'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - arcLength}
            style={{ filter: `drop-shadow(0 0 8px ${battery.charging ? '#22c55e' : 'var(--accent)'})` }}
          />
        </svg>

        {/* Inner decorative ring */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(245, 158, 11, 0.1)" strokeWidth="1" />
          <circle cx="150" cy="150" r="85" fill="none" stroke="rgba(245, 158, 11, 0.05)" strokeWidth="0.5" strokeDasharray="1 3" />
        </svg>

        {/* Core */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="w-32 h-32 rounded-full border-2 flex flex-col items-center justify-center relative"
            style={{
              borderColor: battery.charging ? 'rgba(34, 197, 94, 0.5)' : 'rgba(245, 158, 11, 0.5)',
              background: `radial-gradient(circle, ${
                battery.charging ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.08)'
              } 0%, transparent 70%)`,
              boxShadow: `0 0 30px ${battery.charging ? 'rgba(34, 197, 94, 0.3)' : 'var(--accent-glow)'}`,
            }}
          >
            <span
              className="font-display text-4xl font-bold glow-text"
              style={{ color: battery.charging ? '#22c55e' : 'var(--accent)' }}
            >
              {batteryPct}
            </span>
            <span className="font-mono text-xs text-neutral-500 mt-1">BATERÍA</span>
            {battery.charging && (
              <span className="font-mono text-[10px] text-green-500 mt-0.5 animate-pulse">CARGANDO</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 lg:gap-8 mt-4 w-full max-w-md">
        <div className="flex flex-col items-center gap-1">
          <Thermometer size={16} className="text-amber-500/70" />
          <span className="font-mono text-lg text-amber-500">{temperature}°</span>
          <span className="font-mono text-[10px] text-neutral-500 tracking-wider">TEMP</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Timer size={16} className="text-amber-500/70" />
          <span className="font-mono text-lg text-amber-500">{formatUptime(uptime)}</span>
          <span className="font-mono text-[10px] text-neutral-500 tracking-wider">ACTIVO</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Activity size={16} className="text-amber-500/70" />
          <span className="font-mono text-lg text-green-500">100%</span>
          <span className="font-mono text-[10px] text-neutral-500 tracking-wider">SALUD</span>
        </div>
      </div>
    </div>
  );
}
