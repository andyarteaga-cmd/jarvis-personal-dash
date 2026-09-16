import { useState, useRef, useEffect } from 'react';
import { Clock, MapPin, Cpu, Wifi, ChevronDown, Globe } from 'lucide-react';
import type { GPSLocation, BatteryInfo, TimeZone } from '@/types';
import { TIME_ZONES } from '@/types';

interface HeaderProps {
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  formatTime: () => string;
  formatDate: () => string;
  gps: GPSLocation;
  battery: BatteryInfo;
}

export default function Header({
  timezone,
  onTimezoneChange,
  formatTime,
  formatDate,
  gps,
  battery,
}: HeaderProps) {
  const [tzOpen, setTzOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentTz = TIME_ZONES.find((tz) => tz.timezone === timezone) ?? TIME_ZONES[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTzOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 border-b border-white/5 bg-jarvis-bg/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left — System status */}
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-amber-500" />
          <span className="font-mono text-xs text-neutral-400 hidden sm:inline">
            CPU <span className="text-amber-500/80">OPT</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi size={16} className="text-green-500" />
          <span className="font-mono text-xs text-neutral-400 hidden sm:inline">
            <span className="text-green-500/80">LINK</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${battery.charging ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="font-mono text-xs text-neutral-400">
            PWR <span className={battery.level < 0.2 ? 'text-red-500' : 'text-amber-500/80'}>
              {Math.round(battery.level * 100)}%
            </span>
          </span>
        </div>
      </div>

      {/* Center — Clock */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-500" />
          <span className="font-mono text-xl lg:text-2xl text-amber-500 font-medium tracking-wider glow-text">
            {formatTime()}
          </span>
        </div>
        <span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase hidden lg:block">
          {formatDate()}
        </span>
      </div>

      {/* Right — Location & Timezone */}
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="hidden md:flex items-center gap-2">
          <MapPin size={16} className="text-amber-500" />
          <div className="flex flex-col">
            <span className="font-mono text-xs text-neutral-300">{gps.city}</span>
            <span className="font-mono text-[10px] text-neutral-500">{gps.region}</span>
          </div>
        </div>

        {/* Timezone selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setTzOpen(!tzOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/5 hover:border-amber-500/30 transition-all"
          >
            <Globe size={14} className="text-amber-500" />
            <span className="font-mono text-xs text-neutral-300 hidden sm:inline">
              {currentTz.label}
            </span>
            <ChevronDown size={14} className={`text-neutral-500 transition-transform ${tzOpen ? 'rotate-180' : ''}`} />
          </button>

          {tzOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-jarvis-card border border-white/10 rounded-md shadow-xl z-50 max-h-72 overflow-y-auto animate-fade-in">
              {TIME_ZONES.map((tz: TimeZone) => (
                <button
                  key={tz.id}
                  onClick={() => {
                    onTimezoneChange(tz.timezone);
                    setTzOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2 font-mono text-xs transition-colors
                    ${tz.timezone === timezone
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                    }
                  `}
                >
                  <span className="block">{tz.label}</span>
                  <span className="block text-[10px] text-neutral-600">{tz.timezone}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
