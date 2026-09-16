import { useState, useRef } from 'react';
import { X, Palette, Globe, Mic, Upload, Volume2 } from 'lucide-react';
import type { AppSettings } from '@/types';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
  voices: SpeechSynthesisVoice[];
  onUpdateSetting: (key: string, value: unknown) => void;
}

const ACCENT_COLORS = [
  { id: 'amber', label: 'Ámbar', value: '#f59e0b' },
  { id: 'blue', label: 'Azul', value: '#3b82f6' },
  { id: 'green', label: 'Verde', value: '#22c55e' },
  { id: 'red', label: 'Rojo', value: '#ef4444' },
  { id: 'cyan', label: 'Cian', value: '#06b6d4' },
  { id: 'orange', label: 'Naranja', value: '#ea580c' },
];

const LANGUAGES = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
];

export default function SettingsModal({ open, onClose, settings, voices, onUpdateSetting }: SettingsModalProps) {
  const [testText, setTestText] = useState('Hola, jefe. Todos los sistemas operativos.');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleVoiceChange = (voiceURI: string) => {
    onUpdateSetting('voiceURI', voiceURI);
  };

  const handleAccentChange = (colorId: string) => {
    const color = ACCENT_COLORS.find((c) => c.id === colorId);
    if (color) {
      onUpdateSetting('accentColor', colorId);
      document.documentElement.style.setProperty('--accent', color.value);
      document.documentElement.style.setProperty('--accent-rgb', hexToRgb(color.value));
      document.documentElement.style.setProperty('--accent-glow', `rgba(${hexToRgb(color.value)}, 0.4)`);
      document.documentElement.style.setProperty('--accent-dim', `rgba(${hexToRgb(color.value)}, 0.15)`);
      document.documentElement.style.setProperty('--border-accent', `rgba(${hexToRgb(color.value)}, 0.2)`);
    }
  };

  const handleLanguageChange = (lang: string) => {
    onUpdateSetting('language', lang);
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onUpdateSetting('customVoiceAudio', base64);
    };
    reader.readAsDataURL(file);
  };

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.lang = settings.language === 'es' ? 'es-ES' : 'en-US';
      if (settings.voiceURI) {
        const voice = voices.find((v) => v.voiceURI === settings.voiceURI);
        if (voice) utterance.voice = voice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="hud-panel rounded-lg p-6 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg text-amber-500 tracking-wider">AJUSTES</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-amber-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Language */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-amber-500/70" />
            <h3 className="font-body font-semibold text-sm text-neutral-300">Idioma</h3>
          </div>
          <div className="flex gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={`
                  px-4 py-2 rounded-md font-body text-sm transition-all
                  ${settings.language === lang.id
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-500'
                    : 'bg-white/[0.02] border border-white/5 text-neutral-400 hover:text-neutral-200'
                  }
                `}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={16} className="text-amber-500/70" />
            <h3 className="font-body font-semibold text-sm text-neutral-300">Color de acento</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => handleAccentChange(color.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md transition-all
                  ${settings.accentColor === color.id
                    ? 'bg-white/5 border'
                    : 'hover:bg-white/5'
                  }
                `}
                style={settings.accentColor === color.id ? { borderColor: color.value } : { border: '1px solid transparent' }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: color.value, boxShadow: `0 0 8px ${color.value}80` }}
                />
                <span className="font-body text-sm text-neutral-300">{color.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Mic size={16} className="text-amber-500/70" />
            <h3 className="font-body font-semibold text-sm text-neutral-300">Voz del asistente</h3>
          </div>
          <select
            value={settings.voiceURI ?? ''}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="hud-input w-full mb-3"
          >
            <option value="">Voz por defecto</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Texto de prueba..."
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="hud-input flex-1"
            />
            <button onClick={testVoice} className="hud-btn flex items-center gap-1.5">
              <Volume2 size={14} />
              Probar
            </button>
          </div>

          {/* Custom voice upload */}
          <div className="pt-3 border-t border-white/5">
            <p className="font-body text-xs text-neutral-500 mb-2">Subir audio para clonar voz (experimental)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleVoiceUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="hud-btn flex items-center gap-2 w-full justify-center"
            >
              <Upload size={14} />
              {settings.customVoiceAudio ? 'Audio cargado - Cambiar' : 'Subir audio'}
            </button>
            {settings.customVoiceAudio && (
              <p className="font-mono text-[10px] text-green-500/60 mt-1">Audio personalizado cargado</p>
            )}
          </div>
        </div>

        {/* Custom greeting */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Volume2 size={16} className="text-amber-500/70" />
            <h3 className="font-body font-semibold text-sm text-neutral-300">Saludo personalizado</h3>
          </div>
          <input
            type="text"
            placeholder="Dejar vacío para saludos aleatorios..."
            value={settings.customGreeting ?? ''}
            onChange={(e) => onUpdateSetting('customGreeting', e.target.value || null)}
            className="hud-input w-full"
          />
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
