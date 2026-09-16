export type ViewType = 'command' | 'notes' | 'calendar' | 'audio';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  category: string;
  created_at: string;
}

export interface AppSettings {
  theme: string;
  accentColor: string;
  language: string;
  voiceURI: string | null;
  customVoiceAudio: string | null;
  customGreeting: string | null;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

export interface QuickAccessApp {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}

export interface BatteryInfo {
  level: number;
  charging: boolean;
  supported: boolean;
}

export interface GPSLocation {
  latitude: number | null;
  longitude: number | null;
  city: string;
  region: string;
  supported: boolean;
}

export interface TimeZone {
  id: string;
  label: string;
  city: string;
  timezone: string;
}

export const TIME_ZONES: TimeZone[] = [
  { id: 'gye', label: 'Guayaquil', city: 'Guayaquil', timezone: 'America/Guayaquil' },
  { id: 'uio', label: 'Quito', city: 'Quito', timezone: 'America/Guayaquil' },
  { id: 'nyc', label: 'New York', city: 'New York', timezone: 'America/New_York' },
  { id: 'lon', label: 'London', city: 'London', timezone: 'Europe/London' },
  { id: 'mad', label: 'Madrid', city: 'Madrid', timezone: 'Europe/Madrid' },
  { id: 'tok', label: 'Tokyo', city: 'Tokyo', timezone: 'Asia/Tokyo' },
  { id: 'syd', label: 'Sydney', city: 'Sydney', timezone: 'Australia/Sydney' },
  { id: 'lax', label: 'Los Angeles', city: 'Los Angeles', timezone: 'America/Los_Angeles' },
  { id: 'bue', label: 'Buenos Aires', city: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires' },
  { id: 'mex', label: 'Mexico City', city: 'Mexico City', timezone: 'America/Mexico_City' },
];

export const QUICK_ACCESS_APPS: QuickAccessApp[] = [
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', icon: 'Sparkles', color: '#d97706' },
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'Bot', color: '#10a37f' },
  { id: 'grok', name: 'Grok', url: 'https://grok.com', icon: 'Zap', color: '#0ea5e9' },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', icon: 'Gem', color: '#4285f4' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai', icon: 'Search', color: '#20b8a6' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com', icon: 'Youtube', color: '#ff0000' },
  { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com', icon: 'Music', color: '#ff0050' },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com', icon: 'Instagram', color: '#e1306c' },
  { id: 'gdocs', name: 'Google Docs', url: 'https://docs.google.com', icon: 'FileText', color: '#4285f4' },
  { id: 'gsheets', name: 'Google Sheets', url: 'https://sheets.google.com', icon: 'Sheet', color: '#0f9d58' },
  { id: 'music', name: 'Music', url: 'https://music.youtube.com', icon: 'Headphones', color: '#ff0050' },
  { id: 'files', name: 'Files', url: 'file:///', icon: 'FolderOpen', color: '#f59e0b' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: 'amber',
  language: 'es',
  voiceURI: null,
  customVoiceAudio: null,
  customGreeting: null,
};

export const GREETINGS_ES = [
  'Buenos días, jefe. Todos los sistemas operativos.',
  'Bienvenido de regreso. JARVIS está en línea.',
  'Hola, comandante. ¿En qué puedo ayudarle hoy?',
  'Saludos. Todos los sistemas funcionan con normalidad.',
  'Buen día, jefe. El núcleo de comando está listo.',
  'Le estaba esperando. Todo está operativo.',
  'Inicialización completa. Listo para sus instrucciones.',
  'Sistemas encendidos. Es un placer verle de nuevo.',
];

export const GREETINGS_EN = [
  'Good morning, boss. All systems are operational.',
  'Welcome back. JARVIS is online.',
  'Hello, commander. How can I assist you today?',
  'Greetings. All systems are running normally.',
  'Good day, sir. The command core is ready.',
  'I was expecting you. Everything is operational.',
  'Initialization complete. Awaiting your instructions.',
  'Systems powered up. A pleasure to see you again.',
];
