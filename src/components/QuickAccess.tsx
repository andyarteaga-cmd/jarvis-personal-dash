import {
  Sparkles, Bot, Zap, Gem, Search, Youtube, Music,
  Instagram, FileText, Sheet, Headphones, FolderOpen,
  ExternalLink,
} from 'lucide-react';
import type { QuickAccessApp } from '@/types';
import { QUICK_ACCESS_APPS } from '@/types';

const ICON_MAP: Record<string, typeof Sparkles> = {
  Sparkles, Bot, Zap, Gem, Search, Youtube, Music,
  Instagram, FileText, Sheet, Headphones, FolderOpen,
};

export default function QuickAccess() {
  const handleOpen = (app: QuickAccessApp) => {
    window.open(app.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="hud-panel rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-mono text-[10px] text-amber-500/60 tracking-widest">ACCESO RÁPIDO</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {QUICK_ACCESS_APPS.map((app) => {
          const Icon = ICON_MAP[app.icon] ?? Sparkles;
          return (
            <button
              key={app.id}
              onClick={() => handleOpen(app)}
              className="group relative flex flex-col items-center gap-2 p-3 rounded-lg border border-white/5 hover:border-amber-500/30 bg-white/[0.02] hover:bg-amber-500/5 transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{
                  background: `${app.color}15`,
                  border: `1px solid ${app.color}30`,
                }}
              >
                <Icon size={20} style={{ color: app.color }} />
              </div>
              <span className="font-body text-xs text-neutral-400 group-hover:text-neutral-200 transition-colors text-center leading-tight">
                {app.name}
              </span>
              <ExternalLink
                size={10}
                className="absolute top-1.5 right-1.5 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
