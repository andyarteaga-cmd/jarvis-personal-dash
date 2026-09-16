import { useEffect, useState, useCallback, useRef } from 'react';
import type { BatteryInfo, GPSLocation } from '@/types';

export function useBattery(): BatteryInfo {
  const [battery, setBattery] = useState<BatteryInfo>({
    level: 0.85,
    charging: false,
    supported: false,
  });

  useEffect(() => {
    let batteryManager: { level: number; charging: boolean; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void } | null = null;

    const update = () => {
      if (batteryManager && typeof batteryManager.level === 'number') {
        setBattery({
          level: batteryManager.level,
          charging: batteryManager.charging ?? false,
          supported: true,
        });
      }
    };

    const getBattery = async () => {
      try {
        if (!navigator.getBattery) return;
        batteryManager = await navigator.getBattery();
        update();
        batteryManager.addEventListener('levelchange', update);
        batteryManager.addEventListener('chargingchange', update);
      } catch {
        // Battery API not supported — keep simulated values
      }
    };

    getBattery();

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener?.('levelchange', update);
        batteryManager.removeEventListener?.('chargingchange', update);
      }
    };
  }, []);

  return battery;
}

export function useGPS(): GPSLocation {
  const [gps, setGps] = useState<GPSLocation>({
    latitude: null,
    longitude: null,
    city: 'Guayaquil',
    region: 'Ecuador',
    supported: false,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const onSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      let city = 'Unknown';
      let region = '';
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        );
        if (res.ok) {
          const data = await res.json();
          city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || 'Unknown';
          region = data.address?.state || data.address?.country || '';
        }
      } catch {
        // Reverse geocoding failed — keep defaults
      }
      setGps({ latitude, longitude, city, region, supported: true });
    };

    const onError = () => {
      // Keep default Guayaquil location
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      timeout: 10000,
      maximumAge: 600000,
    });
  }, []);

  return gps;
}

export function useClock(timezone: string) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = useCallback(() => {
    return new Intl.DateTimeFormat('es-ES', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(time);
  }, [time, timezone]);

  const formatDate = useCallback(() => {
    return new Intl.DateTimeFormat('es-ES', {
      timeZone: timezone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(time);
  }, [time, timezone]);

  const getHour = useCallback(() => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    }).format(time);
  }, [time, timezone]);

  return { time, formatTime, formatDate, getHour };
}

export function useSpeechRecognition(
  onResult: (text: string) => void,
  language: string
) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const retryCountRef = useRef(0);
  const shouldListenRef = useRef(false);

  useEffect(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'es' ? 'es-ES' : 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript) onResult(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
      if (shouldListenRef.current && retryCountRef.current < 3 && event.error !== 'not-allowed') {
        retryCountRef.current++;
        setTimeout(() => {
          if (shouldListenRef.current) {
            try {
              recognition.start();
            } catch {
              // Already started or other error — ignore
            }
          }
        }, 500);
      }
    };

    recognition.onend = () => {
      setListening(false);
      if (shouldListenRef.current && retryCountRef.current < 3) {
        retryCountRef.current++;
        setTimeout(() => {
          if (shouldListenRef.current) {
            try {
              recognition.start();
              setListening(true);
            } catch {
              // Ignore
            }
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      try {
        recognition.stop();
      } catch {
        // Already stopped
      }
    };
  }, [onResult, language]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldListenRef.current = true;
    retryCountRef.current = 0;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      // Already started
    }
  }, []);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
    }
    setListening(false);
  }, []);

  return { listening, start, stop, supported: !!recognitionRef.current };
}

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string, lang: string, voiceURI?: string | null) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'es' ? 'es-ES' : 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;

    if (voiceURI) {
      const voice = voices.find((v) => v.voiceURI === voiceURI);
      if (voice) utterance.voice = voice;
    } else {
      const preferred = voices.find(
        (v) => v.lang.startsWith(lang === 'es' ? 'es' : 'en')
      );
      if (preferred) utterance.voice = preferred;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    // Small delay to ensure cancel completed
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  }, [voices]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { speak, stop, speaking, voices };
}
