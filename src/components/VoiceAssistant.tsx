import { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Radio } from 'lucide-react';
import type { AppSettings, WeatherData, Note, CalendarEvent, GPSLocation } from '@/types';
import { GREETINGS_ES, GREETINGS_EN } from '@/types';
import { useSpeechRecognition, useSpeechSynthesis } from '@/hooks/useSystem';

interface VoiceAssistantProps {
  settings: AppSettings;
  gps: GPSLocation;
  weather: WeatherData | null;
  notes: Note[];
  events: CalendarEvent[];
  timezone: string;
  formatTime: () => string;
  formatDate: () => string;
  onVoiceError?: (msg: string) => void;
}

export default function VoiceAssistant({
  settings,
  gps,
  weather,
  notes,
  events,
  timezone,
  formatTime,
  formatDate,
}: VoiceAssistantProps) {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [muted, setMuted] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const greetedRef = useRef(false);

  const { speak, stop, speaking, voices } = useSpeechSynthesis();

  const generateGreeting = useCallback(() => {
    if (settings.customGreeting) return settings.customGreeting;

    const greetings = settings.language === 'es' ? GREETINGS_ES : GREETINGS_EN;
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    const hour = parseInt(
      new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }).format(new Date()),
      10
    );

    let timeContext = '';
    if (settings.language === 'es') {
      if (hour >= 5 && hour < 12) timeContext = 'Buenos días';
      else if (hour >= 12 && hour < 19) timeContext = 'Buenas tardes';
      else timeContext = 'Buenas noches';
    } else {
      if (hour >= 5 && hour < 12) timeContext = 'Good morning';
      else if (hour >= 12 && hour < 19) timeContext = 'Good afternoon';
      else timeContext = 'Good evening';
    }

    return `${timeContext}. ${greeting}`;
  }, [settings.customGreeting, settings.language, timezone]);

  const buildContextResponse = useCallback((): string => {
    const parts: string[] = [];

    // Time
    parts.push(`Son las ${formatTime()}. Hoy es ${formatDate()}.`);

    // Weather
    if (weather) {
      parts.push(`El clima en ${weather.city}: ${weather.condition}, ${weather.temperature} grados, sensación térmica de ${weather.feelsLike} grados.`);
    }

    // Location
    if (gps.supported) {
      parts.push(`Ubicación actual: ${gps.city}, ${gps.region}.`);
    }

    // Notes count
    if (notes.length > 0) {
      parts.push(`Tienes ${notes.length} nota${notes.length !== 1 ? 's' : ''} guardada${notes.length !== 1 ? 's' : ''}.`);
    }

    // Today's events
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter((e) => e.event_date === today);
    if (todayEvents.length > 0) {
      const eventList = todayEvents.map((e) => `${e.title}${e.event_time ? ` a las ${e.event_time}` : ''}`).join(', ');
      parts.push(`Agenda de hoy: ${eventList}.`);
    } else {
      parts.push('No tienes eventos programados para hoy.');
    }

    return parts.join(' ');
  }, [formatTime, formatDate, weather, gps, notes, events]);

  const handleVoiceInput = useCallback((text: string) => {
    setTranscript(text);
    const lowerText = text.toLowerCase().trim();

    let responseText = '';

    // Command processing
    if (lowerText.includes('clima') || lowerText.includes('tiempo') || lowerText.includes('weather')) {
      if (weather) {
        responseText = `El clima en ${weather.city}: ${weather.condition}, ${weather.temperature} grados, con ${weather.humidity}% de humedad y viento de ${weather.windSpeed} kilómetros por hora. Sensación térmica de ${weather.feelsLike} grados.`;
      } else {
        responseText = 'No tengo datos del clima en este momento.';
      }
    } else if (lowerText.includes('hora') || lowerText.includes('time') || lowerText.includes('qué hora')) {
      responseText = `Son las ${formatTime()} del ${formatDate()}.`;
    } else if (lowerText.includes('nota') || lowerText.includes('note')) {
      if (notes.length > 0) {
        const recent = notes.slice(0, 3).map((n) => n.title).join(', ');
        responseText = `Tienes ${notes.length} notas. Las más recientes son: ${recent}.`;
      } else {
        responseText = 'No tienes notas guardadas.';
      }
    } else if (lowerText.includes('agenda') || lowerText.includes('evento') || lowerText.includes('calendar') || lowerText.includes('hoy')) {
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = events.filter((e) => e.event_date === today);
      if (todayEvents.length > 0) {
        const eventList = todayEvents.map((e) => `${e.title}${e.event_time ? ` a las ${e.event_time}` : ''}`).join(', ');
        responseText = `Para hoy tienes ${todayEvents.length} evento${todayEvents.length !== 1 ? 's' : ''}: ${eventList}.`;
      } else {
        responseText = 'No tienes eventos programados para hoy.';
      }
    } else if (lowerText.includes('hola') || lowerText.includes('hello') || lowerText.includes('saludos')) {
      responseText = generateGreeting();
    } else if (lowerText.includes('estado') || lowerText.includes('status') || lowerText.includes('sistema')) {
      responseText = `Todos los sistemas operativos. ${buildContextResponse()}`;
    } else if (lowerText.includes('ubicación') || lowerText.includes('location') || lowerText.includes('dónde')) {
      responseText = `Ubicación actual: ${gps.city}, ${gps.region}.`;
    } else {
      // Default: provide context info
      responseText = `He registrado tu mensaje: "${text}". ${buildContextResponse()}`;
    }

    setResponse(responseText);
    if (!muted) {
      speak(responseText, settings.language, settings.voiceURI);
    }
  }, [weather, formatTime, formatDate, notes, events, generateGreeting, buildContextResponse, muted, speak, settings.language, settings.voiceURI, gps]);

  const { listening, start, stop: stopListening, supported } = useSpeechRecognition(handleVoiceInput, settings.language);

  // Greet on mount
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;

    const timer = setTimeout(() => {
      const greeting = generateGreeting();
      const context = buildContextResponse();
      const fullGreeting = `${greeting} ${context}`;
      setResponse(fullGreeting);
      if (!muted) {
        speak(fullGreeting, settings.language, settings.voiceURI);
      }
      setHasGreeted(true);
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = () => {
    if (!muted) {
      stop();
      setMuted(true);
    } else {
      setMuted(false);
    }
  };

  const handleMicClick = () => {
    if (listening) {
      stopListening();
    } else {
      setTranscript('');
      start();
    }
  };

  return (
    <div className="hud-panel rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${speaking || listening ? 'bg-amber-500 animate-pulse' : 'bg-neutral-600'}`} />
          <span className="font-mono text-[10px] text-amber-500/60 tracking-widest">ASISTENTE DE VOZ</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-neutral-500 hover:text-amber-500 transition-colors"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Mic button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleMicClick}
          disabled={!supported}
          className={`
            relative w-16 h-16 rounded-full flex items-center justify-center transition-all
            ${listening
              ? 'bg-amber-500/20 border-2 border-amber-500 animate-ring-pulse'
              : 'bg-amber-500/10 border-2 border-amber-500/30 hover:border-amber-500/60'
            }
            ${!supported ? 'opacity-30 cursor-not-allowed' : ''}
          `}
        >
          {listening ? (
            <>
              <Mic size={24} className="text-amber-500" />
              <span className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping" />
            </>
          ) : (
            <MicOff size={24} className="text-amber-500/70" />
          )}
        </button>
        <span className="font-mono text-[10px] text-neutral-500 tracking-wider">
          {listening ? 'ESCUCHANDO...' : !supported ? 'NO SOPORTADO' : 'TOCA PARA HABLAR'}
        </span>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mt-3 p-2 rounded-md bg-white/[0.02] border border-white/5 animate-fade-in">
          <span className="font-mono text-[10px] text-amber-500/60">TÚ:</span>
          <p className="font-body text-sm text-neutral-300 mt-1">{transcript}</p>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="mt-2 p-2 rounded-md bg-amber-500/[0.03] border border-amber-500/10 animate-fade-in">
          <div className="flex items-center gap-1.5 mb-1">
            <Radio size={10} className="text-amber-500/60" />
            <span className="font-mono text-[10px] text-amber-500/60">JARVIS:</span>
            {speaking && (
              <div className="flex items-center gap-0.5 ml-1">
                <span className="voice-bar" style={{ height: '6px' }} />
                <span className="voice-bar" style={{ height: '6px' }} />
                <span className="voice-bar" style={{ height: '6px' }} />
              </div>
            )}
          </div>
          <p className="font-body text-sm text-neutral-200 leading-relaxed">{response}</p>
        </div>
      )}
    </div>
  );
}
