import CommandCore from '@/components/CommandCore';
import WeatherPanel from '@/components/WeatherPanel';
import QuickAccess from '@/components/QuickAccess';
import VoiceAssistant from '@/components/VoiceAssistant';
import type { BatteryInfo, GPSLocation, AppSettings, WeatherData, Note, CalendarEvent } from '@/types';

interface CommandViewProps {
  battery: BatteryInfo;
  gps: GPSLocation;
  settings: AppSettings;
  weather: WeatherData | null;
  notes: Note[];
  events: CalendarEvent[];
  timezone: string;
  formatTime: () => string;
  formatDate: () => string;
  onVoiceError?: (msg: string) => void;
}

export default function CommandView({
  battery,
  gps,
  settings,
  weather,
  notes,
  events,
  timezone,
  formatTime,
  formatDate,
  onVoiceError,
}: CommandViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
      {/* Left column — Command Core */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <CommandCore battery={battery} />
        <QuickAccess />
      </div>

      {/* Right column — Weather, Voice Assistant */}
      <div className="flex flex-col gap-4">
        <WeatherPanel gps={gps} />
        <VoiceAssistant
          settings={settings}
          gps={gps}
          weather={weather}
          notes={notes}
          events={events}
          timezone={timezone}
          formatTime={formatTime}
          formatDate={formatDate}
          onVoiceError={onVoiceError}
        />
      </div>
    </div>
  );
}
