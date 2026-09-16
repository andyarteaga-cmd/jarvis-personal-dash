import { Command, StickyNote, Calendar, Headphones, Settings } from 'lucide-react';
import type { ViewType, AppSettings } from '@/types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onOpenSettings: () => void;
  settings: AppSettings;
}

const NAV_ITEMS: { id: ViewType; label: string; labelEn: string; icon: typeof Command }[] = [
  { id: 'command', label: 'Comando', labelEn: 'Command', icon: Command },
  { id: 'notes', label: 'Notas', labelEn: 'Notes', icon: StickyNote },
  { id: 'calendar', label: 'Calendario', labelEn: 'Calendar', icon: Calendar },
  { id: 'audio', label: 'Audio', labelEn: 'Audio', icon: Headphones },
];

export default function Sidebar({ activeView, onViewChange, onOpenSettings, settings }: SidebarProps) {
  const isEs = settings.language === 'es';

  return (
    <aside className="w-20 lg:w-56 h-full bg-jarvis-bg border-r border-white/5 flex flex-col items-center py-6 flex-shrink-0">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-pulse-soft" />
          <div className="absolute inset-1 rounded-full border border-amber-500/20" />
          <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse-glow" />
          </div>
        </div>
        <span className="mt-2 font-display text-[10px] font-bold text-amber-500 tracking-[0.2em] hidden lg:block">
          JARVIS
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-2 w-full px-2 lg:px-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                group relative flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200
                ${isActive
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'
                }
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-amber-500 rounded-r-full" />
              )}
              <Icon
                size={22}
                className={isActive ? 'drop-shadow-[0_0_6px_var(--accent)]' : ''}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="hidden lg:block font-body font-medium text-sm tracking-wide">
                {isEs ? item.label : item.labelEn}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Settings button */}
      <button
        onClick={onOpenSettings}
        className="mt-auto flex items-center gap-3 px-3 py-3 rounded-md text-neutral-500 hover:text-amber-500 hover:bg-white/5 transition-all duration-200 w-[calc(100%-1rem)] mx-2 lg:mx-4"
      >
        <Settings size={22} strokeWidth={1.5} />
        <span className="hidden lg:block font-body font-medium text-sm tracking-wide">
          {isEs ? 'Ajustes' : 'Settings'}
        </span>
      </button>
    </aside>
  );
}
