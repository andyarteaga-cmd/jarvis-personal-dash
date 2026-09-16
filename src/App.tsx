import { useState, useEffect, useCallback } from 'react';
import BootScreen from '@/components/BootScreen';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import SettingsModal from '@/components/SettingsModal';
import CommandView from '@/views/CommandView';
import NotesView from '@/views/NotesView';
import CalendarView from '@/views/CalendarView';
import AudioView from '@/views/AudioView';
import { useBattery, useGPS, useClock, useSpeechSynthesis } from '@/hooks/useSystem';
import { useNotes, useCalendarEvents, useSettings } from '@/hooks/useSupabase';
import { fetchWeather, geocodeCity } from '@/lib/weather';
import type { ViewType, WeatherData } from '@/types';

export default function App() {
  const [booted, setBooted] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('command');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [timezone, setTimezone] = useState('America/Guayaquil');
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const battery = useBattery();
  const gps = useGPS();
  const { formatTime, formatDate } = useClock(timezone);
  const { settings, updateSetting } = useSettings();
  const { notes } = useNotes();
  const { events } = useCalendarEvents();
  const { voices } = useSpeechSynthesis();

  // Fetch weather when GPS changes
  useEffect(() => {
    let cancelled = false;

    const loadWeather = async () => {
      let lat = gps.latitude;
      let lon = gps.longitude;
      const city = gps.city;

      if (!lat || !lon) {
        const coords = await geocodeCity(city);
        if (coords) {
          lat = coords.lat;
          lon = coords.lon;
        } else {
          lat = -2.1709;
          lon = -79.9224;
        }
      }

      const data = await fetchWeather(lat, lon, city);
      if (!cancelled && data) {
        setWeather(data);
      }
    };

    loadWeather();

    return () => { cancelled = true; };
  }, [gps.latitude, gps.longitude, gps.city, gps.region]);

  // Apply accent color from settings
  useEffect(() => {
    if (settings.accentColor) {
      const colorMap: Record<string, string> = {
        amber: '#f59e0b',
        blue: '#3b82f6',
        green: '#22c55e',
        red: '#ef4444',
        cyan: '#06b6d4',
        orange: '#ea580c',
      };
      const color = colorMap[settings.accentColor] ?? '#f59e0b';
      const rgb = hexToRgb(color);
      document.documentElement.style.setProperty('--accent', color);
      document.documentElement.style.setProperty('--accent-rgb', rgb);
      document.documentElement.style.setProperty('--accent-glow', `rgba(${rgb}, 0.4)`);
      document.documentElement.style.setProperty('--accent-dim', `rgba(${rgb}, 0.15)`);
      document.documentElement.style.setProperty('--border-accent', `rgba(${rgb}, 0.2)`);
    }
  }, [settings.accentColor]);

  const handleVoiceError = useCallback((msg: string) => {
    console.warn('Voice/Audio error:', msg);
  }, []);

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  return (
    <div className="fixed inset-0 bg-jarvis-bg text-neutral-200 flex overflow-hidden hud-grid">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenSettings={() => setSettingsOpen(true)}
        settings={settings}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          timezone={timezone}
          onTimezoneChange={setTimezone}
          formatTime={formatTime}
          formatDate={formatDate}
          gps={gps}
          battery={battery}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeView === 'command' && (
            <CommandView
              battery={battery}
              gps={gps}
              settings={settings}
              weather={weather}
              notes={notes}
              events={events}
              timezone={timezone}
              formatTime={formatTime}
              formatDate={formatDate}
              onVoiceError={handleVoiceError}
            />
          )}
          {activeView === 'notes' && <NotesView />}
          {activeView === 'calendar' && <CalendarView />}
          {activeView === 'audio' && <AudioView onVoiceError={handleVoiceError} />}
        </main>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        voices={voices}
        onUpdateSetting={updateSetting}
      />
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
